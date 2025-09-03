import pytest
from sqlalchemy.orm import Session
from app.services.mailing_list_service import MailingListService
from app.db.models import MailingList, Contact, MessageTemplate, Campaign
from app.api.v1.schemas.mailing_list import MailingListCreate, MailingListUpdate
from datetime import datetime

@pytest.fixture
def setup_contacts_and_list(db_session: Session):
    """Fixture to set up a mailing list with some contacts."""
    contacts = [
        Contact(nom="List", prenom="User1", numero_telephone="100000001"),
        Contact(nom="List", prenom="User2", numero_telephone="100000002"),
        Contact(nom="List", prenom="User3", numero_telephone="100000003"),
    ]
    campaign = Campaign(nom_campagne="Fixture Campaign", date_debut=datetime.utcnow(), date_fin=datetime.utcnow(), statut="draft", type_campagne="promotional", id_agent=1)
    db_session.add_all(contacts)
    db_session.add(campaign)
    db_session.commit()

    mailing_list = MailingList(nom_liste="Test List", description="A test list", contacts=contacts, id_campagne=campaign.id_campagne)
    db_session.add(mailing_list)
    db_session.commit()

    return mailing_list, contacts

def test_create_list(db_session: Session):
    service = MailingListService(db=db_session)
    campaign = Campaign(nom_campagne="Another Fixture Campaign", date_debut=datetime.utcnow(), date_fin=datetime.utcnow(), statut="draft", type_campagne="promotional", id_agent=1)
    db_session.add(campaign)
    db_session.commit()
    list_data = MailingListCreate(nom_liste="New List", description="Desc", id_campagne=campaign.id_campagne)
    new_list = service.create_list(list_data)
    assert new_list.nom_liste == "New List"
    assert new_list.id_liste is not None

def test_soft_delete_list(db_session: Session, setup_contacts_and_list):
    mailing_list, _ = setup_contacts_and_list
    service = MailingListService(db=db_session)

    # Soft delete the list
    service.soft_delete_list(mailing_list.id_liste)

    # Try to fetch it normally, should not be found
    deleted_list = service.get_list(mailing_list.id_liste)
    assert deleted_list is None

    # Check the raw object to confirm deleted_at is set
    db_session.refresh(mailing_list)
    assert mailing_list.deleted_at is not None

def test_add_contacts_to_list(db_session: Session, setup_contacts_and_list):
    mailing_list, contacts = setup_contacts_and_list
    service = MailingListService(db=db_session)

    # Create a new contact to add
    new_contact = Contact(nom="New", prenom="Contact", numero_telephone="444444444")
    db_session.add(new_contact)
    db_session.commit()

    # Add the new contact and one existing contact (should be deduplicated)
    service.add_contacts_to_list(mailing_list.id_liste, [new_contact.id_contact, contacts[0].id_contact])

    db_session.refresh(mailing_list)
    assert len(mailing_list.contacts) == 4 # 3 original + 1 new

def test_remove_contacts_from_list(db_session: Session, setup_contacts_and_list):
    mailing_list, contacts = setup_contacts_and_list
    service = MailingListService(db=db_session)

    # Remove two contacts
    service.remove_contacts_from_list(mailing_list.id_liste, [contacts[0].id_contact, contacts[1].id_contact])

    db_session.refresh(mailing_list)
    assert len(mailing_list.contacts) == 1
    assert mailing_list.contacts[0].id_contact == contacts[2].id_contact

def test_get_list_statistics(db_session: Session, setup_contacts_and_list):
    mailing_list, _ = setup_contacts_and_list
    # Make one contact opt-out
    mailing_list.contacts[0].statut_opt_in = False
    db_session.commit()

    service = MailingListService(db=db_session)
    stats = service.get_list_statistics(mailing_list.id_liste)

    assert stats.total_contacts == 3
    assert stats.opt_in_count == 2
    assert stats.opt_out_count == 1
    assert pytest.approx(stats.opt_in_rate) == (2/3) * 100

def test_preview_campaign_for_list(db_session: Session, setup_contacts_and_list):
    mailing_list, _ = setup_contacts_and_list
    template = MessageTemplate(nom_modele="Preview", contenu_modele="Hi {prenom}")
    db_session.add(template)
    db_session.commit()

    service = MailingListService(db=db_session)
    previews = service.preview_campaign_for_list(mailing_list.id_liste, template.id_modele)

    assert len(previews) == 3
    assert "Hi User1" in previews
    assert "Hi User2" in previews
