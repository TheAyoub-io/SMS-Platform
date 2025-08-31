from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

def test_create_template(client: TestClient, admin_auth_headers: dict):
    response = client.post(
        "/templates/",
        json={
            "nom_modele": "Test Template",
            "contenu_modele": "Hello {nom}, this is a test.",
            "variables": {"nom": "string"},
        },
        headers=admin_auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["nom_modele"] == "Test Template"
    assert "id_modele" in data

def test_read_templates(client: TestClient, admin_auth_headers: dict):
    response = client.get("/templates/", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
