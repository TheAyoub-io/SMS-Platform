from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseSmsProvider(ABC):
    """
    Abstract base class for an SMS provider.
    Defines the interface that all concrete SMS provider implementations must follow.
    """

    @abstractmethod
    def send_sms(
        self, to_number: str, message: str, callback_url: str
    ) -> Dict[str, Any]:
        """
        Sends an SMS message to a given phone number.

        Args:
            to_number: The recipient's phone number in E.164 format.
            message: The text content of the message.
            callback_url: The URL for the provider to send status updates to.

        Returns:
            A dictionary containing details from the provider, such as
            the message SID and initial status.
        """
        pass

    @abstractmethod
    def get_delivery_status(self, message_sid: str) -> Dict[str, Any]:
        """
        Fetches the delivery status of a specific message from the provider.

        Args:
            message_sid: The unique identifier for the message from the provider.

        Returns:
            A dictionary containing the delivery status, error codes,
            and other relevant information.
        """
        pass
