import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.celery_app import celery_app
from app.db.models import Campaign, Contact, SMSQueue, Message, MessageTemplate
from app.db.session import SessionLocal
from app.services.sms_providers.twilio_provider import TwilioProvider, TwilioApiError
from app.utils.phone_validator import validate_and_format_phone_number, InvalidPhoneNumberError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_SEND_ATTEMPTS = 3

@celery_app.task
def process_sms_queue():
    """
    Processes pending messages from the sms_queue table.
    """
    db = SessionLocal()
    provider = TwilioProvider()

    try:
        # Atomically fetch and lock pending items for processing
        pending_items_query = db.query(SMSQueue).filter(SMSQueue.status == 'pending').limit(100)
        pending_items = pending_items_query.all()

        if not pending_items:
            logger.info("No pending SMS messages to process.")
            return

        item_ids = [item.id for item in pending_items]
        db.query(SMSQueue).filter(SMSQueue.id.in_(item_ids)).update({"status": "processing"}, synchronize_session=False)
        db.commit()

        logger.info(f"Processing {len(pending_items)} messages from the queue.")

        for item in pending_items:
            try:
                # Construct callback URL
                callback_url = f"http://localhost:8000/api/v1/sms-webhooks/twilio-status" # Placeholder URL

                response = provider.send_sms(
                    to_number=item.contact.numero_telephone,
                    message=item.message_content,
                    callback_url=callback_url
                )

                # Map Twilio's 'queued' status to our 'sent' status
                message_status = response.get("status", "failed")
                if message_status in ['queued', 'sending']:
                    message_status = 'sent'

                # Create permanent message record
                new_message = Message(
                    contenu=item.message_content,
                    date_envoi=datetime.utcnow(),
                    statut_livraison=message_status,
                    identifiant_expediteur=provider.twilio_phone_number,
                    external_message_id=response.get("sid"),
                    id_liste=item.campaign.mailing_lists[0].id_liste if item.campaign.mailing_lists else None,
                    id_contact=item.contact_id,
                    id_campagne=item.campaign_id
                )
                db.add(new_message)

                # Update queue item
                item.status = 'sent'
                item.processed_at = datetime.utcnow()
                logger.info(f"Successfully sent message from queue item {item.id}")

            except TwilioApiError as e:
                logger.error(f"Twilio API error for queue item {item.id}: {e}")
                item.attempts += 1
                item.error_message = str(e)
                if item.attempts >= MAX_SEND_ATTEMPTS:
                    item.status = 'failed'
                else:
                    item.status = 'pending' # Re-queue for another attempt

            except Exception as e:
                logger.error(f"Unexpected error processing queue item {item.id}: {e}")
                item.attempts += 1
                item.error_message = str(e)
                item.status = 'failed'

            db.commit()

    finally:
        db.close()


class SmsService:
    def __init__(self, db: Session):
        self.db = db

    def _personalize_message(self, template_content: str, contact: Contact) -> str:
        """Replaces placeholders in a message template with contact data."""
        # A simple format replacement. Can be extended for more complex variables.
        return template_content.format(
            prenom=contact.prenom,
            nom=contact.nom,
            email=contact.email or ''
        )

    def queue_campaign_messages(self, campaign_id: int) -> dict:
        """
        Generates personalized messages for a campaign and queues them in the sms_queue table.
        """
        campaign = self.db.query(Campaign).filter(Campaign.id_campagne == campaign_id).first()
        if not campaign:
            logger.error(f"Campaign with ID {campaign_id} not found.")
            return {"error": "Campaign not found", "queued_count": 0}

        if not campaign.template:
            logger.error(f"Campaign {campaign.id_campagne} has no message template.")
            return {"error": "Campaign has no template", "queued_count": 0}

        message_template = campaign.template.contenu_modele
        queued_count = 0
        total_contacts = 0

        for mailing_list in campaign.mailing_lists:
            total_contacts += len(mailing_list.contacts)
            for contact in mailing_list.contacts:
                if not contact.statut_opt_in:
                    logger.info(f"Skipping contact {contact.id_contact} because they have opted out.")
                    continue

                try:
                    # 1. Validate phone number
                    valid_phone_number = validate_and_format_phone_number(contact.numero_telephone)

                    # 2. Personalize message
                    personalized_content = self._personalize_message(message_template, contact)

                    # 3. Create SMSQueue record
                    new_queue_item = SMSQueue(
                        campaign_id=campaign.id_campagne,
                        contact_id=contact.id_contact,
                        message_content=personalized_content,
                        scheduled_at=datetime.utcnow(),
                        status='pending'
                    )
                    self.db.add(new_queue_item)
                    queued_count += 1

                except InvalidPhoneNumberError as e:
                    logger.warning(f"Skipping contact {contact.id_contact} for campaign {campaign.id_campagne}: {e}")
                except Exception as e:
                    logger.error(f"Failed to queue message for contact {contact.id_contact} in campaign {campaign.id_campagne}: {e}")

        if queued_count > 0:
            self.db.commit()
            logger.info(f"Successfully queued {queued_count} messages for campaign {campaign.id_campagne}.")

        return {"total_contacts": total_contacts, "queued_count": queued_count}
