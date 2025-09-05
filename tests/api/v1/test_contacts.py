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

from app.db.models import Contact

def test_bulk_update_opt_status(client: TestClient, db_session: Session, admin_auth_headers: dict):
    # --- Setup ---
    # Create some contacts to update, all opted-in
    contacts_to_create = [
        Contact(nom="Bulk", prenom="One", numero_telephone="+33610000001", statut_opt_in=True),
        Contact(nom="Bulk", prenom="Two", numero_telephone="+33610000002", statut_opt_in=True),
        Contact(nom="Bulk", prenom="Three", numero_telephone="+33610000003", statut_opt_in=True),
    ]
    db_session.add_all(contacts_to_create)
    db_session.commit()
    contact_ids = [c.id_contact for c in contacts_to_create]

    # --- Execute ---
    # Call the endpoint to opt them all out
    response = client.post(
        "/contacts/bulk-opt-status",
        json={"contact_ids": contact_ids, "opt_in_status": False},
        headers=admin_auth_headers,
    )

    # --- Assert ---
    assert response.status_code == 200
    data = response.json()
    assert data["updated_count"] == 3

    # Verify the change in the database
    updated_contacts = db_session.query(Contact).filter(Contact.id_contact.in_(contact_ids)).all()
    for contact in updated_contacts:
        assert contact.statut_opt_in is False


def test_filter_contacts_by_multiple_segments(client: TestClient, db_session: Session, admin_auth_headers: dict):
    # --- Setup ---
    contacts_to_create = [
        Contact(nom="Filter", prenom="One", numero_telephone="+33620000001", segment="VIP"),
        Contact(nom="Filter", prenom="Two", numero_telephone="+33620000002", segment="Standard"),
        Contact(nom="Filter", prenom="Three", numero_telephone="+33620000003", segment="New"),
        Contact(nom="Filter", prenom="Four", numero_telephone="+33620000004", segment="VIP"),
    ]
    db_session.add_all(contacts_to_create)
    db_session.commit()

    # --- Execute ---
    # Filter by VIP and Standard segments
    response = client.get(
        "/contacts/",
        params={"segments": "VIP,Standard"},
        headers=admin_auth_headers,
    )

    # --- Assert ---
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3 # Two VIPs and one Standard

    # Check that no "New" contacts are in the response
    for contact in data:
        assert contact["segment"] in ["VIP", "Standard"]
