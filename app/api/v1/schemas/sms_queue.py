from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class SMSQueueItem(BaseModel):
    id: int
    campaign_id: int
    contact_id: int
    message_content: str
    scheduled_at: datetime
    status: str
    attempts: int
    error_message: Optional[str] = None
    created_at: datetime
    processed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
