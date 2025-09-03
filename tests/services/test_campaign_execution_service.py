import pytest
from sqlalchemy.orm import Session
from app.services.campaign_execution_service import CampaignExecutionService
from app.db.models import Campaign, Contact, MailingList, MessageTemplate, SMSQueue
from datetime import datetime

@pytest.fixture
def mock_draft_campaign(db_session: Session):
    """Creates a mock draft campaign with all prerequisites for launching."""
    template = MessageTemplate(nom_modele="Launch Template", contenu_modele="Hello {prenom}!")
    contact = Contact(nom="Launch", prenom="Test", numero_telephone="+33611223344", statut_opt_in=True)
    mailing_list = MailingList(nom_liste="Launch List", contacts=[contact])
    campaign = Campaign(
        nom_campagne="Launch Campaign",
        template=template,
        mailing_lists=[mailing_list],
        statut="draft",  # Start in draft status
        date_debut=datetime(2025, 1, 1), date_fin=datetime(2025, 1, 31),
        type_campagne="promotional", id_agent=1
    )
    db_session.add_all([template, contact, mailing_list, campaign])
    db_session.commit()
    return campaign

def test_launch_campaign_success(db_session: Session, mock_draft_campaign: Campaign):
    # --- Setup ---
    service = CampaignExecutionService(db=db_session)
    campaign_id = mock_draft_campaign.id_campagne

    # --- Execute ---
    result = service.launch_campaign(campaign_id=campaign_id)

    # --- Assert ---
    assert result["success"] is True
    assert result["queued_count"] == 1

    # Verify campaign status changed to active
    db_session.refresh(mock_draft_campaign)
    assert mock_draft_campaign.statut == "active"

    # Verify item was queued
    queue_item = db_session.query(SMSQueue).filter_by(campaign_id=campaign_id).one()
    assert queue_item is not None
    assert queue_item.status == 'pending'

def test_launch_campaign_not_in_draft(db_session: Session, mock_draft_campaign: Campaign):
    # --- Setup ---
    service = CampaignExecutionService(db=db_session)
    # Change status to something other than draft
    mock_draft_campaign.statut = "active"
    db_session.commit()

    # --- Execute ---
    result = service.launch_campaign(campaign_id=mock_draft_campaign.id_campagne)

    # --- Assert ---
    assert result["success"] is False
    assert "not in 'draft' status" in result["message"]

def test_launch_campaign_invalid_requirements(db_session: Session):
    # --- Setup ---
    # Create a campaign that is invalid for launch (no mailing lists)
    template = MessageTemplate(nom_modele="Invalid Template", contenu_modele="Test")
    campaign = Campaign(
        nom_campagne="Invalid Campaign",
        template=template,
        mailing_lists=[], # No lists
        statut="draft",
        date_debut=datetime(2025, 1, 1), date_fin=datetime(2025, 1, 31),
        type_campagne="promotional", id_agent=1
    )
    db_session.add_all([template, campaign])
    db_session.commit()

    service = CampaignExecutionService(db=db_session)

    # --- Execute ---
    result = service.launch_campaign(campaign_id=campaign.id_campagne)

    # --- Assert ---
    assert result["success"] is False
    assert "must have a template and at least one mailing list" in result["message"]
