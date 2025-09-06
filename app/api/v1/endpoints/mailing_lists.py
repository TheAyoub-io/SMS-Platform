from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_user
from app.services.mailing_list_service import MailingListService
from app.api.v1.schemas import mailing_list as list_schema

router = APIRouter()

@router.post("/", response_model=list_schema.MailingList, status_code=status.HTTP_200_OK)
def create_mailing_list(
    list_data: list_schema.MailingListCreate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = MailingListService(db)
    return service.create_list(list_data=list_data)

@router.get("/", response_model=List[list_schema.MailingList])
def get_all_mailing_lists(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = MailingListService(db)
    return service.get_all_lists(skip=skip, limit=limit)

@router.get("/{list_id}", response_model=list_schema.MailingList)
def get_mailing_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = MailingListService(db)
    db_list = service.get_list(list_id)
    if db_list is None:
        raise HTTPException(status_code=404, detail="Mailing list not found")
    return db_list

@router.put("/{list_id}", response_model=list_schema.MailingList)
def update_mailing_list(
    list_id: int,
    list_data: list_schema.MailingListUpdate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = MailingListService(db)
    updated_list = service.update_list(list_id=list_id, list_data=list_data)
    if updated_list is None:
        raise HTTPException(status_code=404, detail="Mailing list not found")
    return updated_list

from app.core.security import get_current_active_admin

@router.delete("/{list_id}", response_model=dict, status_code=status.HTTP_200_OK)
def delete_mailing_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_active_admin)
):
    service = MailingListService(db)
    deleted_list = service.soft_delete_list(list_id)
    if deleted_list is None:
        raise HTTPException(status_code=404, detail="Mailing list not found")
    return {"success": True, "message": "Mailing list deleted successfully."}

@router.post("/{list_id}/contacts", response_model=dict, status_code=status.HTTP_200_OK)
def add_contacts_to_list(
    list_id: int,
    payload: list_schema.BulkContactOperation,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = MailingListService(db)
    result = service.add_contacts_to_list(list_id=list_id, contact_ids=payload.contact_ids)
    if result is None:
        raise HTTPException(status_code=404, detail="Mailing list not found")
    return result


@router.post("/{list_id}/duplicate", response_model=list_schema.MailingList, status_code=status.HTTP_201_CREATED)
def duplicate_mailing_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    """
    Duplicate a mailing list, creating a new list with the same details
    but without any contacts.
    """
    service = MailingListService(db)
    new_list = service.duplicate_list(list_id)
    if new_list is None:
        raise HTTPException(status_code=404, detail="Original mailing list not found")
    return new_list

@router.delete("/{list_id}/contacts/bulk-remove", response_model=dict, status_code=status.HTTP_200_OK)
def bulk_remove_contacts(
    list_id: int,
    payload: list_schema.BulkOperationRequest,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = MailingListService(db)
    result = service.bulk_remove_contacts_by_filter(list_id=list_id, filters=payload.filters)
    if result is None:
        raise HTTPException(status_code=404, detail="Mailing list not found")
    return result

@router.get("/{list_id}/contacts", response_model=List[list_schema.Contact])
def get_list_contacts(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    """
    Retrieve all contacts in a specific mailing list.
    """
    service = MailingListService(db)
    contacts = service.get_list_contacts(list_id=list_id)
    if contacts is None:
        raise HTTPException(status_code=404, detail="Mailing list not found")
    return contacts

@router.delete("/{list_id}/contacts", response_model=dict, status_code=status.HTTP_200_OK)
def remove_contacts_from_list(
    list_id: int,
    payload: list_schema.BulkContactOperation,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = MailingListService(db)
    result = service.remove_contacts_from_list(list_id=list_id, contact_ids=payload.contact_ids)
    if result is None:
        raise HTTPException(status_code=404, detail="Mailing list not found")
    return result

@router.get("/{list_id}/statistics", response_model=list_schema.ListStatistics)
def get_list_statistics(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = MailingListService(db)
    stats = service.get_list_statistics(list_id)
    if stats is None:
        raise HTTPException(status_code=404, detail="Mailing list not found")
    return stats

@router.post("/{list_id}/preview", response_model=list_schema.PreviewResponse)
def preview_list_campaign(
    list_id: int,
    payload: list_schema.PreviewRequest,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = MailingListService(db)
    preview_data = service.preview_campaign_for_list(
        list_id=list_id,
        message_template=payload.message_template,
        sample_size=payload.sample_size
    )
    if preview_data is None:
        raise HTTPException(status_code=404, detail="Mailing list not found")
    return preview_data

@router.post("/{list_id}/contacts/bulk-add", response_model=dict, status_code=status.HTTP_200_OK)
def bulk_add_contacts(
    list_id: int,
    payload: list_schema.BulkOperationRequest,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = MailingListService(db)
    result = service.bulk_add_contacts_by_filter(list_id=list_id, filters=payload.filters)
    if result is None:
        raise HTTPException(status_code=404, detail="Mailing list not found")
    return result
