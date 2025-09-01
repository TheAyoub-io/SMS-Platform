from sqlalchemy.orm import Session
from app.db.models import MailingList, Contact
from app.api.v1.schemas.mailing_list import MailingListCreate, MailingListUpdate

def create_mailing_list(db: Session, mailing_list: MailingListCreate):
    """
    Create a new mailing list and associate contacts with it.
    """
    # Create a new MailingList object
    db_mailing_list = MailingList(
        nom_liste=mailing_list.nom_liste,
        description=mailing_list.description,
        id_campagne=mailing_list.id_campagne
    )

    # Get the contacts from the database
    if mailing_list.contact_ids:
        contacts = db.query(Contact).filter(Contact.id_contact.in_(mailing_list.contact_ids)).all()
        db_mailing_list.contacts.extend(contacts)

    db.add(db_mailing_list)
    db.commit()
    db.refresh(db_mailing_list)
    return db_mailing_list

def get_mailing_list(db: Session, mailing_list_id: int):
    return db.query(MailingList).filter(MailingList.id_liste == mailing_list_id).first()

def update_mailing_list(db: Session, mailing_list_id: int, mailing_list: MailingListUpdate):
    db_mailing_list = get_mailing_list(db, mailing_list_id)
    if db_mailing_list:
        update_data = mailing_list.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_mailing_list, key, value)
        db.commit()
        db.refresh(db_mailing_list)
    return db_mailing_list
