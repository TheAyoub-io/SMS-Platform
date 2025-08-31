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

def test_read_campaigns(client: TestClient, admin_auth_headers: dict):
    response = client.get("/campaigns/", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
