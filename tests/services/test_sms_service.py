from unittest.mock import patch, MagicMock
import pytest
from sqlalchemy.orm import Session
from app.services.sms_service import SmsService, process_sms_queue
from app.db.models import Campaign, Contact, MailingList, MessageTemplate, SMSQueue, Message
from datetime import datetime

@pytest.fixture
def mock_campaign_for_queuing(db_session: Session):
    """Creates a mock campaign with template, list, and contacts for testing the queuing service."""
    template = MessageTemplate(nom_modele="Test Queue Template", contenu_modele="Bonjour {prenom}!")
    contact1 = Contact(nom="Valid", prenom="Contact", numero_telephone="+33611223344", email="valid@example.com", statut_opt_in=True)
    contact2 = Contact(nom="InvalidNum", prenom="Contact", numero_telephone="12345", email="invalid@example.com", statut_opt_in=True)
    contact3 = Contact(nom="OptOut", prenom="Contact", numero_telephone="+33655443322", email="optout@example.com", statut_opt_in=False)

    mailing_list = MailingList(nom_liste="Test Queue List", contacts=[contact1, contact2, contact3])
    campaign = Campaign(
        nom_campagne="Test Queuing Campaign",
        template=template,
        mailing_lists=[mailing_list],
        date_debut=datetime(2025, 1, 1),
        date_fin=datetime(2025, 1, 31),
        statut="active",
        type_campagne="promotional",
        id_agent=1
    )

    db_session.add_all([template, contact1, contact2, contact3, mailing_list, campaign])
    db_session.commit()
    return campaign

def test_queue_campaign_messages(db_session: Session, mock_campaign_for_queuing: Campaign):
    # --- Setup ---
    sms_service = SmsService(db=db_session)

    # --- Execute ---
    result = sms_service.queue_campaign_messages(campaign_id=mock_campaign_for_queuing.id_campagne)

    # --- Assert ---
    assert result["queued_count"] == 1
    assert result["total_contacts"] == 3
    queue_items = db_session.query(SMSQueue).all()
    assert len(queue_items) == 1
    valid_contact = db_session.query(Contact).filter_by(nom="Valid").one()
    queued_item = queue_items[0]
    assert queued_item.contact_id == valid_contact.id_contact
    assert queued_item.status == 'pending'
    assert "Bonjour Contact!" in queued_item.message_content


@patch("app.services.sms_service.SessionLocal")
@patch("app.services.sms_service.TwilioProvider")
def test_process_sms_queue_success(MockTwilioProvider, MockSessionLocal, db_session: Session):
    # --- Setup ---
    MockSessionLocal.return_value = db_session
    mock_provider_instance = MockTwilioProvider.return_value
    mock_provider_instance.send_sms.return_value = {"sid": "SM_SUCCESS", "status": "queued"}
    mock_provider_instance.twilio_phone_number = "+15005550006"

    contact = Contact(nom="Queue", prenom="Proc", numero_telephone="+33712345678")
    campaign = Campaign(nom_campagne="Proc Campaign", date_debut=datetime.utcnow(), date_fin=datetime.utcnow(), statut="active", type_campagne="promotional", id_agent=1)
    mailing_list = MailingList(nom_liste="Proc List", campaign=campaign, contacts=[contact])
    db_session.add_all([contact, campaign, mailing_list])
    db_session.commit()
    contact_id = contact.id_contact

    queue_item = SMSQueue(campaign_id=campaign.id_campagne, contact_id=contact_id, message_content="Go", scheduled_at=datetime.utcnow())
    db_session.add(queue_item)
    db_session.commit()
    queue_item_id = queue_item.id

    # --- Execute ---
    process_sms_queue()

    # --- Assert ---
    processed_item = db_session.query(SMSQueue).get(queue_item_id)
    assert processed_item.status == 'sent'
    assert processed_item.processed_at is not None

    message = db_session.query(Message).filter_by(id_contact=contact_id).first()
    assert message is not None
    assert message.external_message_id == "SM_SUCCESS"
    assert message.statut_livraison == "sent"


@patch("app.services.sms_service.SessionLocal")
@patch("app.services.sms_service.TwilioProvider")
def test_process_sms_queue_failure_and_retry(MockTwilioProvider, MockSessionLocal, db_session: Session):
    # --- Setup ---
    MockSessionLocal.return_value = db_session
    from app.services.sms_providers.twilio_provider import TwilioApiError
    mock_provider_instance = MockTwilioProvider.return_value
    mock_provider_instance.send_sms.side_effect = TwilioApiError("Test API Error")

    contact = Contact(nom="QueueFail", prenom="Proc", numero_telephone="+33787654321")
    campaign = Campaign(nom_campagne="Proc Campaign Fail", date_debut=datetime.utcnow(), date_fin=datetime.utcnow(), statut="active", type_campagne="promotional", id_agent=1)
    mailing_list_fail = MailingList(nom_liste="Proc List Fail", campaign=campaign, contacts=[contact])
    db_session.add_all([contact, campaign, mailing_list_fail])
    db_session.commit()
    contact_id = contact.id_contact

    queue_item = SMSQueue(campaign_id=campaign.id_campagne, contact_id=contact_id, message_content="Fail", scheduled_at=datetime.utcnow())
    db_session.add(queue_item)
    db_session.commit()
    queue_item_id = queue_item.id

    # --- Execute ---
    process_sms_queue()

    # --- Assert ---
    processed_item = db_session.query(SMSQueue).get(queue_item_id)
    assert processed_item.status == 'pending'
    assert processed_item.attempts == 1
    assert "Test API Error" in processed_item.error_message
