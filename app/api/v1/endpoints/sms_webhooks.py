import logging
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Message

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/twilio-status", status_code=status.HTTP_204_NO_CONTENT)
async def twilio_status_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handles incoming status update webhooks from Twilio.
    This endpoint updates the status of the permanent 'messages' table record.
    """
    try:
        webhook_data = await request.form()
        message_sid = webhook_data.get("MessageSid")
        message_status = webhook_data.get("MessageStatus")

        if not message_sid or not message_status:
            logger.warning("Received a Twilio webhook with missing MessageSid or MessageStatus.")
            return

        logger.info(f"Received Twilio status update for SID {message_sid}: {message_status}")

        message = db.query(Message).filter(Message.external_message_id == message_sid).first()

        if not message:
            logger.warning(f"Webhook for unknown message SID {message_sid} received. Ignoring.")
            return

        # Map Twilio statuses to our internal statuses
        if message_status in ['failed', 'undelivered', 'canceled']:
            message.statut_livraison = 'failed'
            message.error_message = webhook_data.get('ErrorMessage')
        elif message_status == 'delivered':
            message.statut_livraison = 'delivered'
        else: # 'queued', 'sending', 'sent'
            message.statut_livraison = 'sent'

        # Note: Cost can also be updated here from webhook data if available and desired.
        cost_str = webhook_data.get("Price")
        if cost_str:
             message.cost = abs(float(cost_str))

        db.commit()
        logger.info(f"Updated message {message.id_message} (SID: {message_sid}) status to {message.statut_livraison}")

    except Exception as e:
        logger.error(f"Error processing Twilio webhook: {e}")
        # It's crucial to not raise an HTTP exception here that would cause Twilio
        # to retry. Log the error and return a success response.
        pass

    return
