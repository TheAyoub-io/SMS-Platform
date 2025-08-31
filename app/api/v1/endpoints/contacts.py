from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.api.v1.schemas import contact as contact_schema
from app.services import contact_service
from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=contact_schema.Contact)
def create_contact(
    contact: contact_schema.ContactCreate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Create new contact.
    """
    return contact_service.create_contact(db=db, contact=contact)


@router.get("/", response_model=List[contact_schema.Contact])
def read_contacts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Retrieve contacts.
    """
    contacts = contact_service.get_contacts(db, skip=skip, limit=limit)
    return contacts


@router.get("/{contact_id}", response_model=contact_schema.Contact)
def read_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get contact by ID.
    """
    db_contact = contact_service.get_contact(db, contact_id=contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact


@router.put("/{contact_id}", response_model=contact_schema.Contact)
def update_contact(
    contact_id: int,
    contact: contact_schema.ContactUpdate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Update a contact.
    """
    db_contact = contact_service.get_contact(db, contact_id=contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact_service.update_contact(db=db, contact_id=contact_id, contact=contact)


@router.delete("/{contact_id}", response_model=contact_schema.Contact)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Delete a contact.
    """
    db_contact = contact_service.get_contact(db, contact_id=contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact_service.delete_contact(db=db, contact_id=contact_id)


@router.post("/import", response_model=dict)
def import_contacts(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Import contacts from a CSV or Excel file.
    """
    return contact_service.import_contacts_from_file(db=db, file=file)


@router.get("/segments", response_model=List[str])
def get_segments(
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get all unique contact segments.
    """
    segments = contact_service.get_contact_segments(db)
    return [s[0] for s in segments if s[0]]
