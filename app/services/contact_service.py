import pandas as pd
from sqlalchemy.orm import Session
from app.db.models import Contact
from app.api.v1.schemas.contact import ContactCreate, ContactUpdate
from fastapi import UploadFile
import io
from sqlalchemy import distinct
from pydantic import ValidationError

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
        content = file.file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(io.BytesIO(content))
        else:
            return {"error": "Unsupported file format. Please use CSV or Excel."}

        # Define mapping from expected CSV/Excel columns to model fields
        column_mapping = {
            'FirstName': 'prenom',
            'LastName': 'nom',
            'PhoneNumber': 'numero_telephone',
            'Email': 'email',
            'OptInStatus': 'statut_opt_in',
            'Segment': 'segment',
            'Zone': 'zone_geographique',
            'ClientType': 'type_client'
        }
        df.rename(columns=column_mapping, inplace=True)

        contacts_to_create = []
        errors = []

        for index, row in df.iterrows():
            try:
                contact_dict = {
                    "nom": row.get("nom"),
                    "prenom": row.get("prenom"),
                    "numero_telephone": row.get("numero_telephone"),
                    "email": row.get("email"),
                    "statut_opt_in": row.get("statut_opt_in", True),
                    "segment": row.get("segment"),
                    "zone_geographique": row.get("zone_geographique"),
                    "type_client": row.get("type_client"),
                }
                # Filter out None and NaN values so Pydantic can use defaults
                contact_dict_cleaned = {k: v for k, v in contact_dict.items() if v is not None and pd.notna(v)}

                contact_data = ContactCreate(**contact_dict_cleaned)
                contacts_to_create.append(contact_data.model_dump())
            except ValidationError as e:
                errors.append({"row": index + 2, "errors": e.errors()}) # +2 for header and 0-indexing

        if errors:
            db.rollback()
            return {"message": "Import failed due to validation errors.", "errors": errors}

        if contacts_to_create:
            db.bulk_insert_mappings(Contact, contacts_to_create)
            db.commit()

        return {"message": f"{len(contacts_to_create)} contacts imported successfully."}

    except Exception as e:
        db.rollback()
        return {"error": f"An unexpected error occurred: {str(e)}"}

def get_contact_segments(db: Session):
    return db.query(distinct(Contact.segment)).all()
