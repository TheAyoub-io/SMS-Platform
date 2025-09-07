from sqlalchemy.orm import Session
from twilio.request_validator import RequestValidator
from fastapi import Request, HTTPException

from app.core.config import settings
from app.db.models import Message

class WebhookService:
    def __init__(self, db: Session):
        self.db = db
        self.validator = RequestValidator(settings.TWILIO_AUTH_TOKEN)

    def validate_webhook_signature(self, request: Request, body: bytes):
        """Validates the signature of an incoming Twilio webhook."""
        twilio_signature = request.headers.get('X-Twilio-Signature', '')
        # The URL must be the full URL requested by Twilio, including query parameters
        url = str(request.url)

        if not self.validator.validate(url, body.decode('utf-8'), twilio_signature):
            raise HTTPException(status_code=403, detail="Invalid Twilio signature.")

    def handle_delivery_status(self, payload: dict):
        """Processes a delivery status update from Twilio."""
        message_sid = payload.get('MessageSid')
        message_status = payload.get('MessageStatus')

        if not message_sid or not message_status:
            return

        message = self.db.query(Message).filter(Message.external_message_id == message_sid).first()

        if message:
            message.statut_livraison = message_status
            if message_status == 'failed':
                message.error_message = payload.get('ErrorMessage')
            # Handle cost later if needed
            self.db.commit()

    def handle_incoming_sms(self, payload: dict):
        """Handles an incoming SMS reply."""
        # Placeholder for future implementation
        print(f"Received incoming message from {payload.get('From')}: {payload.get('Body')}")
        pass
