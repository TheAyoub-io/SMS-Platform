from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import io

def test_create_contact(client: TestClient, admin_auth_headers: dict):
    response = client.post(
        "/contacts/",
        json={
            "nom": "Test",
            "prenom": "Contact",
            "numero_telephone": "+15551234567",
            "email": "test.contact@example.com",
        },
        headers=admin_auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["numero_telephone"] == "+15551234567"
    assert "id_contact" in data

def test_read_contacts(client: TestClient, admin_auth_headers: dict):
    response = client.get("/contacts/", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_import_contacts(client: TestClient, admin_auth_headers: dict):
    # Create a dummy CSV file in memory
    csv_content = "FirstName,LastName,PhoneNumber,Email\nTest,User,+15557654321,test.user@example.com"
    file = ("test_import.csv", io.BytesIO(csv_content.encode('utf-8')), "text/csv")

    response = client.post(
        "/contacts/import",
        files={"file": file},
        headers=admin_auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "1 contacts imported successfully" in data["message"]
