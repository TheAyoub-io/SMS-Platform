from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.services import campaign_service
from app.api.v1.schemas import campaign as campaign_schema

def test_create_campaign(client: TestClient, admin_auth_headers: dict):
    response = client.post(
        "/campaigns/",
        json={
            "nom_campagne": "Test Campaign",
            "date_debut": (datetime.now() + timedelta(days=1)).isoformat(),
            "date_fin": (datetime.now() + timedelta(days=10)).isoformat(),
            "statut": "draft",
            "type_campagne": "promotional",
        },
        headers=admin_auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["nom_campagne"] == "Test Campaign"
    assert "id_campagne" in data

from app.db.models import Campaign, MessageTemplate, MailingList, Contact, SMSQueue

def test_read_campaigns(client: TestClient, admin_auth_headers: dict):
    response = client.get("/campaigns/", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_launch_campaign(client: TestClient, db_session: Session, admin_auth_headers: dict):
    # --- Setup ---
    template = MessageTemplate(nom_modele="API Launch Template", contenu_modele="Hello {prenom}!")
    contact = Contact(nom="APILaunch", prenom="Test", numero_telephone="+33699887766", statut_opt_in=True)
    mailing_list = MailingList(nom_liste="API Launch List", contacts=[contact])
    campaign = Campaign(
        nom_campagne="API Launch Campaign",
        template=template,
        mailing_lists=[mailing_list],
        statut="draft",
        date_debut=datetime(2025, 1, 1), date_fin=datetime(2025, 1, 31),
        type_campagne="promotional", id_agent=1
    )
    db_session.add_all([template, contact, mailing_list, campaign])
    db_session.commit()

    # --- Execute ---
    response = client.post(f"/campaigns/{campaign.id_campagne}/launch", headers=admin_auth_headers)

    # --- Assert ---
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["queued_count"] == 1

    # Verify db changes
    updated_campaign = db_session.get(Campaign, campaign.id_campagne)
    assert updated_campaign.statut == "active"
    queue_item = db_session.query(SMSQueue).filter_by(campaign_id=campaign.id_campagne).one()
    assert queue_item is not None


def test_pause_campaign(client: TestClient, db_session: Session, admin_auth_headers: dict):
    # --- Setup ---
    campaign = Campaign(
        nom_campagne="Active Campaign to Pause",
        statut="active", # Must be active to be paused
        date_debut=datetime(2025, 1, 1), date_fin=datetime(2025, 1, 31),
        type_campagne="promotional", id_agent=1
    )
    db_session.add(campaign)
    db_session.commit()

    # --- Execute ---
    response = client.post(f"/campaigns/{campaign.id_campagne}/pause", headers=admin_auth_headers)

    # --- Assert ---
    assert response.status_code == 200
    updated_campaign = db_session.get(Campaign, campaign.id_campagne)
    assert updated_campaign.statut == "paused"


def test_get_campaign_status(client: TestClient, db_session: Session, admin_auth_headers: dict):
    # --- Setup ---
    from app.db.models import Message
    campaign = Campaign(
        nom_campagne="Status Campaign", statut="active",
        date_debut=datetime.now(timezone.utc), date_fin=datetime.now(timezone.utc),
        type_campagne="promotional", id_agent=1
    )
    contact = Contact(nom="Status", prenom="Test", numero_telephone="+33765432198")
    mailing_list = MailingList(nom_liste="Status List", campaign=campaign, contacts=[contact])
    db_session.add_all([campaign, contact, mailing_list])
    db_session.commit()

    # Create messages with different statuses
    messages_to_create = [
        Message(contenu="msg1", date_envoi=datetime.now(timezone.utc), statut_livraison='delivered', identifiant_expediteur='test', id_liste=mailing_list.id_liste, id_contact=contact.id_contact, id_campagne=campaign.id_campagne),
        Message(contenu="msg2", date_envoi=datetime.now(timezone.utc), statut_livraison='delivered', identifiant_expediteur='test', id_liste=mailing_list.id_liste, id_contact=contact.id_contact, id_campagne=campaign.id_campagne),
        Message(contenu="msg3", date_envoi=datetime.now(timezone.utc), statut_livraison='sent', identifiant_expediteur='test', id_liste=mailing_list.id_liste, id_contact=contact.id_contact, id_campagne=campaign.id_campagne),
        Message(contenu="msg4", date_envoi=datetime.now(timezone.utc), statut_livraison='failed', identifiant_expediteur='test', id_liste=mailing_list.id_liste, id_contact=contact.id_contact, id_campagne=campaign.id_campagne),
    ]
    db_session.add_all(messages_to_create)
    db_session.commit()

    # --- Execute ---
    response = client.get(f"/campaigns/{campaign.id_campagne}/status", headers=admin_auth_headers)

    # --- Assert ---
    assert response.status_code == 200
    data = response.json()
    assert data["total_messages"] == 4
    assert data["delivered"] == 2
    assert data["sent"] == 1
    assert data["failed"] == 1
    assert data["pending"] == 0


def test_get_campaign_preview(client: TestClient, db_session: Session, admin_auth_headers: dict):
    # --- Setup ---
    template = MessageTemplate(nom_modele="API Preview Template", contenu_modele="Hi {prenom} {nom}!")
    contact1 = Contact(nom="Preview", prenom="One", numero_telephone="+33611111111")
    contact2 = Contact(nom="Preview", prenom="Two", numero_telephone="+33622222222")
    mailing_list = MailingList(nom_liste="API Preview List", contacts=[contact1, contact2])
    campaign = Campaign(
        nom_campagne="API Preview Campaign",
        template=template,
        mailing_lists=[mailing_list],
        statut="draft",
        date_debut=datetime(2025, 1, 1), date_fin=datetime(2025, 1, 31),
        type_campagne="promotional", id_agent=1
    )
    db_session.add_all([template, contact1, contact2, mailing_list, campaign])
    db_session.commit()

    # --- Execute ---
    response = client.get(f"/campaigns/{campaign.id_campagne}/preview", headers=admin_auth_headers)

    # --- Assert ---
    assert response.status_code == 200
    data = response.json()
    assert data["preview_count"] == 2
    assert len(data["items"]) == 2

    # Check that personalization worked for one of the items
    preview_item = data["items"][0]
    assert "One" in preview_item["personalized_message"]
    assert "Preview" in preview_item["personalized_message"]
    assert preview_item["contact_name"] == "One Preview"
