import logging
from typing import Dict, Any
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

from app.core.config import settings
from app.services.sms_providers.base import BaseSmsProvider

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TwilioApiError(Exception):
    """Custom exception for Twilio API errors."""
    pass


class TwilioProvider(BaseSmsProvider):
    """
    A concrete implementation of BaseSmsProvider for sending SMS via Twilio.
    """

    def __init__(self):
        try:
            if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_PHONE_NUMBER]):
                raise ValueError("Twilio credentials are not fully configured in settings.")

            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            self.twilio_phone_number = settings.TWILIO_PHONE_NUMBER
            logger.info("TwilioProvider initialized successfully.")
        except ValueError as e:
            logger.error(f"Error initializing TwilioProvider: {e}")
            raise

    def send_sms(
        self, to_number: str, message: str, callback_url: str
    ) -> Dict[str, Any]:
        """
        Sends an SMS message using the Twilio API.
        """
        logger.info(f"Attempting to send SMS to {to_number} via Twilio.")
        try:
            message_instance = self.client.messages.create(
                to=to_number,
                from_=self.twilio_phone_number,
                body=message,
                status_callback=callback_url,
            )
            logger.info(f"SMS submitted to Twilio for {to_number}. SID: {message_instance.sid}")
            return {
                "sid": message_instance.sid,
                "status": message_instance.status,
            }
        except TwilioRestException as e:
            logger.error(f"Twilio API error while sending SMS to {to_number}: {e}")
            raise TwilioApiError(f"Failed to send SMS via Twilio. Reason: {e}")

    def get_delivery_status(self, message_sid: str) -> Dict[str, Any]:
        """
        Fetches the delivery status of a message from Twilio.
        """
        logger.info(f"Fetching delivery status for SID: {message_sid}")
        try:
            message_instance = self.client.messages(message_sid).fetch()
            logger.info(f"Successfully fetched status for SID {message_sid}: {message_instance.status}")
            return {
                "sid": message_instance.sid,
                "status": message_instance.status,
                "cost": message_instance.price,
                "price_unit": message_instance.price_unit,
                "error_code": message_instance.error_code,
                "error_message": message_instance.error_message,
            }
        except TwilioRestException as e:
            logger.error(f"Twilio API error fetching status for SID {message_sid}: {e}")
            raise TwilioApiError(f"Failed to fetch status from Twilio. Reason: {e}")
