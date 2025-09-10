from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.schemas import sms_queue as sms_queue_schema
from app.services.queue_service import QueueService
from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_active_admin

router = APIRouter()

@router.get("/sms", response_model=List[sms_queue_schema.SMSQueueItem], summary="Get SMS queue items")
def get_sms_queue(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_active_admin),
):
    """
    Retrieves a list of items from the SMS queue.
    Requires admin privileges.
    """
    items = QueueService.get_sms_queue_items(db, skip=skip, limit=limit)
    return items
