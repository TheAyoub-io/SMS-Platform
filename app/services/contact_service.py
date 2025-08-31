import pandas as pd
from sqlalchemy.orm import Session
from app.db.models import Contact
from app.api.v1.schemas.contact import ContactCreate, ContactUpdate
from fastapi import UploadFile
import io
from sqlalchemy import distinct

def create_contact(db: Session, contact: ContactCreate):
    db_contact = Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def get_contact(db: Session, contact_id: int):
    return db.query(Contact).filter(Contact.id_contact == contact_id).first()

def get_contacts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Contact).offset(skip).limit(limit).all()

def update_contact(db: Session, contact_id: int, contact: ContactUpdate):
    db_contact = get_contact(db, contact_id)
    if db_contact:
        for key, value in contact.model_dump().items():
            setattr(db_contact, key, value)
        db.commit()
        db.refresh(db_contact)
    return db_contact

def delete_contact(db: Session, contact_id: int):
    db_contact = get_contact(db, contact_id)
    if db_contact:
        db.delete(db_contact)
        db.commit()
    return db_contact

def import_contacts_from_file(db: Session, file: UploadFile):
    try:
        # Read the file content into a pandas DataFrame
        content = file.file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(io.BytesIO(content))
        else:
            return {"error": "Unsupported file format"}

        # Assume the columns are named correctly
        # Add validation and error handling here
        contacts_to_create = []
        for index, row in df.iterrows():
            contact_data = ContactCreate(**row.to_dict())
            contacts_to_create.append(contact_data)

        # Bulk insert the contacts
        db.bulk_insert_mappings(Contact, [c.model_dump() for c in contacts_to_create])
        db.commit()
        return {"message": f"{len(contacts_to_create)} contacts imported successfully."}

    except Exception as e:
        db.rollback()
        return {"error": str(e)}

def get_contact_segments(db: Session):
    return db.query(distinct(Contact.segment)).all()
