from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

def test_create_mailing_list(client: TestClient, admin_auth_headers: dict, db: Session):
    # First, create a contact to add to the list
    contact_response = client.post(
        "/contacts/",
        json={
            "nom": "List",
            "prenom": "Member",
            "numero_telephone": "+15551112233",
            "email": "list.member@example.com",
        },
        headers=admin_auth_headers,
    )
    assert contact_response.status_code == 200
    contact_data = contact_response.json()
    contact_id = contact_data["id_contact"]

    # Now, create the mailing list
    response = client.post(
        "/mailing-lists/",
        json={
            "nom_liste": "Test Mailing List",
            "contact_ids": [contact_id],
        },
        headers=admin_auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["nom_liste"] == "Test Mailing List"
    assert "id_liste" in data
    assert len(data["contacts"]) == 1
    assert data["contacts"][0]["id_contact"] == contact_id
