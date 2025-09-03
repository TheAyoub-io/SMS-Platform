from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

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
    updated_campaign = db_session.query(Campaign).get(campaign.id_campagne)
    assert updated_campaign.statut == "active"
    queue_item = db_session.query(SMSQueue).filter_by(campaign_id=campaign.id_campagne).one()
    assert queue_item is not None
