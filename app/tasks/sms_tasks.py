import logging
from datetime import datetime
from app.core.celery_app import celery_app
from app.core.config import settings
from app.db.models import SMSQueue, Message, Campaign
from app.db.session import SessionLocal
from app.services.campaign_execution_service import CampaignExecutionService
from app.services.sms_providers.twilio_provider import TwilioProvider, TwilioApiError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_SEND_ATTEMPTS = 3

@celery_app.task
def send_scheduled_campaigns():
    """
    Checks for campaigns that are scheduled to be sent and launches them.
    """
    db = SessionLocal()
    campaign_execution_service = CampaignExecutionService(db)
    try:
        scheduled_campaigns = db.query(Campaign).filter(
            Campaign.statut == 'scheduled',
            Campaign.date_debut <= datetime.utcnow()
        ).all()

        if not scheduled_campaigns:
            logger.info("No scheduled campaigns to launch.")
            return

        logger.info(f"Found {len(scheduled_campaigns)} scheduled campaigns to launch.")
        for campaign in scheduled_campaigns:
            try:
                logger.info(f"Auto-launching scheduled campaign {campaign.id_campagne}.")
                campaign_execution_service.launch_campaign(campaign.id_campagne)
            except Exception as e:
                logger.error(f"Failed to auto-launch campaign {campaign.id_campagne}: {e}")
    finally:
        db.close()

@celery_app.task
def process_sms_queue():
    """
    Processes pending messages from the sms_queue table.
    """
    db = SessionLocal()
    provider = TwilioProvider()

    try:
        # Determine batch size from settings, with a fallback default
        DEFAULT_BATCH_SIZE = 100
        batch_size = DEFAULT_BATCH_SIZE
        if settings.SMS_RATE_LIMIT:
            try:
                parsed_limit = int(settings.SMS_RATE_LIMIT)
                if parsed_limit > 0:
                    batch_size = parsed_limit
                else:
                    logger.warning(f"SMS_RATE_LIMIT must be a positive integer, but got '{settings.SMS_RATE_LIMIT}'. Falling back to default {DEFAULT_BATCH_SIZE}.")
            except (ValueError, TypeError):
                logger.warning(f"Invalid SMS_RATE_LIMIT format: '{settings.SMS_RATE_LIMIT}'. Expected an integer. Falling back to default {DEFAULT_BATCH_SIZE}.")

        # Atomically fetch and lock pending items for processing
        pending_items_query = db.query(SMSQueue).filter(SMSQueue.status == 'pending').limit(batch_size)
        pending_items = pending_items_query.all()

        if not pending_items:
            # This is a normal state, so use info level, not warning
            # logger.info("No pending SMS messages to process.")
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
