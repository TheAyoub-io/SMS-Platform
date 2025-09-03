from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session
from app.tasks.sms_tasks import process_sms_queue, send_scheduled_campaigns
from app.db.models import Campaign, Contact, MailingList, SMSQueue, Message
from datetime import datetime, timedelta

@patch("app.tasks.sms_tasks.CampaignExecutionService")
@patch("app.tasks.sms_tasks.SessionLocal")
def test_send_scheduled_campaigns(MockSessionLocal, MockExecutionService, db_session: Session):
    # --- Setup ---
    MockSessionLocal.return_value = db_session
    mock_service_instance = MockExecutionService.return_value

    # Create a campaign that is scheduled and ready to be launched
    scheduled_campaign = Campaign(
        nom_campagne="Scheduled Campaign",
        statut="scheduled",
        date_debut=datetime.utcnow() - timedelta(hours=1), # Scheduled for 1 hour ago
        date_fin=datetime.utcnow() + timedelta(days=1),
        type_campagne="promotional", id_agent=1
    )
    db_session.add(scheduled_campaign)
    db_session.commit()

    # --- Execute ---
    send_scheduled_campaigns()

    # --- Assert ---
    # Verify that the launch method was called for the scheduled campaign
    mock_service_instance.launch_campaign.assert_called_once_with(scheduled_campaign.id_campagne)


@patch("app.tasks.sms_tasks.SessionLocal")
@patch("app.tasks.sms_tasks.TwilioProvider")
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


@patch("app.tasks.sms_tasks.SessionLocal")
@patch("app.tasks.sms_tasks.TwilioProvider")
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
