from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.schemas import mailing_list as mailing_list_schema
from app.services import mailing_list_service
from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=mailing_list_schema.MailingList)
def create_mailing_list(
    mailing_list: mailing_list_schema.MailingListCreate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Create new mailing list.
    """
    return mailing_list_service.create_mailing_list(db=db, mailing_list=mailing_list)


@router.put("/{mailing_list_id}", response_model=mailing_list_schema.MailingList)
def update_mailing_list(
    mailing_list_id: int,
    mailing_list: mailing_list_schema.MailingListUpdate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Update a mailing list.
    """
    db_mailing_list = mailing_list_service.get_mailing_list(db, mailing_list_id=mailing_list_id)
    if db_mailing_list is None:
        raise HTTPException(status_code=404, detail="Mailing list not found")
    return mailing_list_service.update_mailing_list(db=db, mailing_list_id=mailing_list_id, mailing_list=mailing_list)
