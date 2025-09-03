import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import io

from app.db.models import MailingList, Contact, Campaign, MessageTemplate, Agent
from app.services import mailing_list_service


@pytest.fixture
def test_agent(db_session: Session):
    """Create a test agent and return just the ID"""
    agent = Agent(
        nom_agent="Test Agent",
        identifiant="test_agent",
        mot_de_passe="hashed_password",
        role="agent",
        is_active=True
    )
    db_session.add(agent)
    db_session.commit()
    agent_id = agent.id_agent  # Extract ID before session might close
    return agent_id


@pytest.fixture
def test_template(db_session: Session, test_agent):
    """Create a test template and return just the ID"""
    template = MessageTemplate(
        nom_modele="Test Template",
        contenu_modele="Hello {prenom}, test message!",
        created_by=test_agent
    )
    db_session.add(template)
    db_session.commit()
    template_id = template.id_modele  # Extract ID
    return template_id


@pytest.fixture
def test_campaign(db_session: Session, test_agent, test_template):
    """Create a test campaign and return just the ID"""
    campaign = Campaign(
        nom_campagne="Test Campaign",
        date_debut=datetime.now() + timedelta(hours=1),
        date_fin=datetime.now() + timedelta(days=7),
        statut="draft",
        type_campagne="promotional",
        id_agent=test_agent,
        id_modele=test_template
    )
    db_session.add(campaign)
    db_session.commit()
    campaign_id = campaign.id_campagne  # Extract ID
    return campaign_id


@pytest.fixture
def test_mailing_list(db_session: Session, test_campaign):
    """Create a test mailing list and return just the ID"""
    mailing_list = MailingList(
        nom_liste="Test Mailing List",
        description="Test description",
        id_campagne=test_campaign
    )
    db_session.add(mailing_list)
    db_session.commit()
    list_id = mailing_list.id_liste  # Extract ID immediately
    return list_id


@pytest.fixture
def test_contacts(db_session: Session):
    """Create test contacts and return list of IDs"""
    contacts = [
        Contact(
            nom="Dupont",
            prenom="Jean",
            numero_telephone="+33123456789",
            email="jean.dupont@example.com",
            segment="VIP",
            zone_geographique="Paris"
        ),
        Contact(
            nom="Martin",
            prenom="Marie",
            numero_telephone="+33987654321",
            email="marie.martin@example.com",
            segment="Standard",
            zone_geographique="Lyon"
        ),
        Contact(
            nom="Bernard",
            prenom="Paul",
            numero_telephone="+33456789123",
            email="paul.bernard@example.com",
            segment="VIP",
            zone_geographique="Marseille",
            statut_opt_in=False  # Opted out contact
        )
    ]

    for contact in contacts:
        db_session.add(contact)

    db_session.commit()

    # Return list of IDs only
    contact_ids = [contact.id_contact for contact in contacts]
    return contact_ids


class TestMailingListCRUD:
    """Test basic CRUD operations for mailing lists"""

    def test_create_mailing_list(self, client: TestClient, admin_auth_headers: dict, test_campaign):
        """Test creating a new mailing list"""
        response = client.post(
            "/mailing-lists/",
            json={
                "nom_liste": "New Test List",
                "description": "A new test list",
                "id_campagne": test_campaign
            },
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["nom_liste"] == "New Test List"
        assert data["description"] == "A new test list"
        assert data["id_campagne"] == test_campaign
        assert "id_liste" in data
        assert "created_at" in data

    def test_get_mailing_lists(self, client: TestClient, admin_auth_headers: dict, test_mailing_list):
        """Test retrieving all mailing lists"""
        response = client.get("/mailing-lists/", headers=admin_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        # Find our test list
        test_list = next((item for item in data if item["id_liste"] == test_mailing_list), None)
        assert test_list is not None
        assert test_list["nom_liste"] == "Test Mailing List"

    def test_get_mailing_list_by_id(self, client: TestClient, admin_auth_headers: dict, test_mailing_list):
        """Test retrieving a specific mailing list"""
        response = client.get(f"/mailing-lists/{test_mailing_list}", headers=admin_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id_liste"] == test_mailing_list
        assert data["nom_liste"] == "Test Mailing List"
        assert "contacts" in data  # Should include contacts list

    def test_update_mailing_list(self, client: TestClient, admin_auth_headers: dict, test_mailing_list):
        """Test updating a mailing list"""
        response = client.put(
            f"/mailing-lists/{test_mailing_list}",
            json={
                "nom_liste": "Updated List Name",
                "description": "Updated description"
            },
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["nom_liste"] == "Updated List Name"
        assert data["description"] == "Updated description"

    def test_delete_mailing_list_soft_delete(self, client: TestClient, admin_auth_headers: dict,
                                           test_mailing_list, db_session: Session):
        """Test soft deleting a mailing list"""
        response = client.delete(f"/mailing-lists/{test_mailing_list}", headers=admin_auth_headers)

        assert response.status_code == 200

        # Verify soft delete - object should still exist but be marked as deleted
        deleted_list = db_session.query(MailingList).filter(
            MailingList.id_liste == test_mailing_list
        ).first()

        assert deleted_list is not None
        assert deleted_list.deleted_at is not None  # Should have deletion timestamp

    def test_get_nonexistent_mailing_list(self, client: TestClient, admin_auth_headers: dict):
        """Test retrieving a non-existent mailing list"""
        response = client.get("/mailing-lists/99999", headers=admin_auth_headers)
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestContactOperations:
    """Test contact operations within mailing lists"""

    def test_add_contacts_to_list(self, client: TestClient, admin_auth_headers: dict,
                                 test_mailing_list, test_contacts, db_session: Session):
        """Test adding contacts to a mailing list"""
        # Use only the first two contacts (including one opted-in, one opted-out)
        contacts_to_add = test_contacts[:2]

        response = client.post(
            f"/mailing-lists/{test_mailing_list}/contacts",
            json={"contact_ids": contacts_to_add},
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "contacts_added" in data

        # Re-fetch the mailing list to verify contacts were added
        updated_list = db_session.query(MailingList).filter(
            MailingList.id_liste == test_mailing_list
        ).first()
        db_session.refresh(updated_list)

        # Verify contacts were added
        contact_ids_in_list = [c.id_contact for c in updated_list.contacts]
        assert len(contact_ids_in_list) >= 1  # At least opt-in contacts should be added

        # Verify only opt-in contacts were actually added
        for contact_id in contact_ids_in_list:
            contact = db_session.query(Contact).get(contact_id)
            assert contact.statut_opt_in is True

    def test_remove_contacts_from_list(self, client: TestClient, admin_auth_headers: dict,
                                     test_mailing_list, test_contacts, db_session: Session):
        """Test removing contacts from a mailing list"""
        # First add contacts to the list
        contacts_to_add = test_contacts[:2]

        add_response = client.post(
            f"/mailing-lists/{test_mailing_list}/contacts",
            json={"contact_ids": contacts_to_add},
            headers=admin_auth_headers,
        )
        assert add_response.status_code == 200

        # Now remove one contact
        contact_to_remove = test_contacts[0]

        remove_response = client.request(
            "DELETE",
            f"/mailing-lists/{test_mailing_list}/contacts",
            json={"contact_ids": [contact_to_remove]},
            headers=admin_auth_headers,
        )

        assert remove_response.status_code == 200
        data = remove_response.json()
        assert data["success"] is True

        # Re-fetch and verify contact was removed
        updated_list = db_session.query(MailingList).filter(
            MailingList.id_liste == test_mailing_list
        ).first()
        db_session.refresh(updated_list)

        contact_ids_in_list = [c.id_contact for c in updated_list.contacts]
        assert contact_to_remove not in contact_ids_in_list

    def test_get_list_contacts(self, client: TestClient, admin_auth_headers: dict,
                              test_mailing_list, test_contacts, db_session: Session):
        """Test retrieving contacts from a mailing list"""
        # Add contacts first
        add_response = client.post(
            f"/mailing-lists/{test_mailing_list}/contacts",
            json={"contact_ids": test_contacts[:2]},
            headers=admin_auth_headers,
        )
        assert add_response.status_code == 200

        # Get contacts from list
        response = client.get(f"/mailing-lists/{test_mailing_list}/contacts",
                             headers=admin_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # At least opt-in contacts

    def test_add_invalid_contact_to_list(self, client: TestClient, admin_auth_headers: dict, test_mailing_list):
        """Test adding non-existent contact to list"""
        response = client.post(
            f"/mailing-lists/{test_mailing_list}/contacts",
            json={"contact_ids": [99999]},  # Non-existent contact ID
            headers=admin_auth_headers,
        )

        assert response.status_code == 400 or response.status_code == 404


class TestMailingListStatistics:
    """Test mailing list statistics and analytics"""

    def test_get_list_statistics(self, client: TestClient, admin_auth_headers: dict,
                                test_mailing_list, test_contacts, db_session: Session):
        """Test retrieving mailing list statistics"""
        # Add contacts first
        add_response = client.post(
            f"/mailing-lists/{test_mailing_list}/contacts",
            json={"contact_ids": test_contacts},
            headers=admin_auth_headers,
        )
        assert add_response.status_code == 200

        # Get statistics
        response = client.get(f"/mailing-lists/{test_mailing_list}/statistics",
                             headers=admin_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "total_contacts" in data
        assert "opt_in_contacts" in data
        assert "segments" in data
        assert data["total_contacts"] >= 1

    def test_preview_campaign_for_list(self, client: TestClient, admin_auth_headers: dict,
                                     test_mailing_list, test_contacts, db_session: Session):
        """Test previewing campaign messages for a mailing list"""
        # Add contacts first
        add_response = client.post(
            f"/mailing-lists/{test_mailing_list}/contacts",
            json={"contact_ids": test_contacts[:2]},
            headers=admin_auth_headers,
        )
        assert add_response.status_code == 200

        # Preview campaign
        response = client.post(
            f"/mailing-lists/{test_mailing_list}/preview",
            json={
                "message_template": "Bonjour {prenom} {nom}, message de test!",
                "sample_size": 3
            },
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "previews" in data
        assert isinstance(data["previews"], list)
        assert len(data["previews"]) >= 1

        # Check that personalization worked
        preview = data["previews"][0]
        assert "Bonjour" in preview["personalized_message"]
        assert preview["contact_name"] is not None


class TestContactFiltering:
    """Test contact filtering and selection"""

    def test_filter_contacts_by_segment(self, client: TestClient, admin_auth_headers: dict, test_contacts):
        """Test filtering contacts by segment"""
        response = client.get(
            "/contacts/",
            params={"segment": "VIP"},
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

        # All returned contacts should be VIP segment
        for contact in data:
            if contact["segment"]:  # Skip contacts without segment
                assert contact["segment"] == "VIP"

    def test_filter_contacts_by_zone(self, client: TestClient, admin_auth_headers: dict, test_contacts):
        """Test filtering contacts by geographical zone"""
        response = client.get(
            "/contacts/",
            params={"zone_geographique": "Paris"},
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_filter_contacts_by_opt_in_status(self, client: TestClient, admin_auth_headers: dict, test_contacts):
        """Test filtering contacts by opt-in status"""
        response = client.get(
            "/contacts/",
            params={"statut_opt_in": True},
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

        # All returned contacts should be opted in
        for contact in data:
            assert contact["statut_opt_in"] is True


class TestBulkOperations:
    """Test bulk operations on contacts within mailing lists"""

    def test_bulk_add_contacts_by_filter(self, client: TestClient, admin_auth_headers: dict,
                                        test_mailing_list, test_contacts, db_session: Session):
        """Test adding contacts to list using filter criteria"""
        response = client.post(
            f"/mailing-lists/{test_mailing_list}/contacts/bulk-add",
            json={
                "filters": {
                    "segment": "VIP",
                    "statut_opt_in": True
                }
            },
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "contacts_added" in data

        # Verify contacts were added by re-fetching
        updated_list = db_session.query(MailingList).filter(
            MailingList.id_liste == test_mailing_list
        ).first()
        db_session.refresh(updated_list)

        # Check that only VIP, opted-in contacts were added
        for contact in updated_list.contacts:
            db_session.refresh(contact)  # Refresh contact object too
            assert contact.segment == "VIP"
            assert contact.statut_opt_in is True

    def test_bulk_remove_contacts_by_segment(self, client: TestClient, admin_auth_headers: dict,
                                           test_mailing_list, test_contacts, db_session: Session):
        """Test removing contacts from list by segment"""
        # First add all contacts
        add_response = client.post(
            f"/mailing-lists/{test_mailing_list}/contacts",
            json={"contact_ids": test_contacts},
            headers=admin_auth_headers,
        )
        assert add_response.status_code == 200

        # Remove contacts by segment
        response = client.request(
            "DELETE",
            f"/mailing-lists/{test_mailing_list}/contacts/bulk-remove",
            json={
                "filters": {
                    "segment": "Standard"
                }
            },
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

        # Verify Standard segment contacts were removed
        updated_list = db_session.query(MailingList).filter(
            MailingList.id_liste == test_mailing_list
        ).first()
        db_session.refresh(updated_list)

        for contact in updated_list.contacts:
            db_session.refresh(contact)
            assert contact.segment != "Standard"  # No Standard contacts should remain


class TestListStatisticsAndAnalytics:
    """Test mailing list statistics and analytics functionality"""

    def test_comprehensive_list_statistics(self, client: TestClient, admin_auth_headers: dict,
                                         test_mailing_list, test_contacts, db_session: Session):
        """Test detailed mailing list statistics"""
        # Add diverse contacts first
        add_response = client.post(
            f"/mailing-lists/{test_mailing_list}/contacts",
            json={"contact_ids": test_contacts},
            headers=admin_auth_headers,
        )
        assert add_response.status_code == 200

        # Get detailed statistics
        response = client.get(f"/mailing-lists/{test_mailing_list}/statistics",
                             headers=admin_auth_headers)

        assert response.status_code == 200
        data = response.json()

        # Verify all expected statistics are present
        assert "total_contacts" in data
        assert "opt_in_contacts" in data
        assert "opt_out_contacts" in data
        assert "segments" in data
        assert "zones" in data
        assert "contact_types" in data

        # Verify statistics are accurate
        assert data["total_contacts"] >= 2  # We added at least 2 contacts
        assert data["opt_in_contacts"] + data["opt_out_contacts"] == data["total_contacts"]

        # Verify segment breakdown
        segments = data["segments"]
        assert isinstance(segments, dict)
        assert "VIP" in segments or "Standard" in segments


class TestCampaignPreview:
    """Test campaign preview functionality"""

    def test_preview_personalized_messages(self, client: TestClient, admin_auth_headers: dict,
                                         test_mailing_list, test_contacts, db_session: Session):
        """Test previewing personalized messages for list contacts"""
        # Add contacts to list first
        add_response = client.post(
            f"/mailing-lists/{test_mailing_list}/contacts",
            json={"contact_ids": test_contacts[:3]},
            headers=admin_auth_headers,
        )
        assert add_response.status_code == 200

        # Request message preview
        response = client.post(
            f"/mailing-lists/{test_mailing_list}/preview",
            json={
                "message_template": "Bonjour {prenom} {nom}, vous êtes dans le segment {segment}!",
                "sample_size": 5
            },
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        assert "previews" in data
        assert "total_contacts" in data
        assert "estimated_cost" in data

        previews = data["previews"]
        assert isinstance(previews, list)
        assert len(previews) >= 1

        # Verify personalization worked correctly
        for preview in previews:
            assert "contact_name" in preview
            assert "personalized_message" in preview
            assert "phone_number" in preview

            # Check that variables were replaced
            personalized_msg = preview["personalized_message"]
            assert "Bonjour" in personalized_msg
            assert "{prenom}" not in personalized_msg  # Variables should be replaced
            assert "{nom}" not in personalized_msg

    def test_preview_with_missing_variables(self, client: TestClient, admin_auth_headers: dict,
                                          test_mailing_list, test_contacts):
        """Test preview with template containing undefined variables"""
        # Add contacts first
        add_response = client.post(
            f"/mailing-lists/{test_mailing_list}/contacts",
            json={"contact_ids": test_contacts[:1]},
            headers=admin_auth_headers,
        )
        assert add_response.status_code == 200

        # Try to preview with undefined variable
        response = client.post(
            f"/mailing-lists/{test_mailing_list}/preview",
            json={
                "message_template": "Hello {prenom}, your {undefined_variable} is ready!",
                "sample_size": 1
            },
            headers=admin_auth_headers,
        )

        # Should handle gracefully - either return error or show placeholder
        assert response.status_code in [200, 400]

        if response.status_code == 200:
            data = response.json()
            # If successful, should handle undefined variables gracefully
            preview = data["previews"][0]
            assert "undefined_variable" not in preview["personalized_message"] or \
                   "{undefined_variable}" in preview["personalized_message"]


class TestErrorHandling:
    """Test error handling scenarios"""

    def test_add_contacts_to_nonexistent_list(self, client: TestClient, admin_auth_headers: dict, test_contacts):
        """Test adding contacts to non-existent mailing list"""
        response = client.post(
            "/mailing-lists/99999/contacts",
            json={"contact_ids": test_contacts[:1]},
            headers=admin_auth_headers,
        )

        assert response.status_code == 404

    def test_get_statistics_for_empty_list(self, client: TestClient, admin_auth_headers: dict, test_mailing_list):
        """Test getting statistics for empty mailing list"""
        response = client.get(f"/mailing-lists/{test_mailing_list}/statistics",
                             headers=admin_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["total_contacts"] == 0
        assert data["opt_in_contacts"] == 0

    def test_preview_empty_list(self, client: TestClient, admin_auth_headers: dict, test_mailing_list):
        """Test previewing campaign for empty mailing list"""
        response = client.post(
            f"/mailing-lists/{test_mailing_list}/preview",
            json={
                "message_template": "Test message {prenom}",
                "sample_size": 3
            },
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_contacts"] == 0
        assert len(data["previews"]) == 0


from app.core.security import get_password_hash


class TestPermissions:
    """Test role-based permissions for mailing list operations"""

    def test_agent_can_read_lists(self, client: TestClient, db_session: Session, test_mailing_list):
        """Test that agents can read mailing lists"""
        # Create agent user
        agent = Agent(
            nom_agent="Test Agent",
            identifiant="agent_user",
            mot_de_passe=get_password_hash("password"),
            role="agent",
            is_active=True
        )
        db_session.add(agent)
        db_session.commit()

        # Login as agent
        login_response = client.post("/auth/login",
                                   json={"identifiant": "agent_user", "password": "password"})
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Agent should be able to read lists
        response = client.get("/mailing-lists/", headers=headers)
        assert response.status_code == 200

    def test_agent_cannot_delete_lists(self, client: TestClient, db_session: Session, test_mailing_list):
        """Test that regular agents cannot delete mailing lists"""
        # Create agent user (if not already done)
        agent = db_session.query(Agent).filter(Agent.identifiant == "agent_user").first()
        if not agent:
            agent = Agent(
                nom_agent="Test Agent",
                identifiant="agent_user",
                mot_de_passe=get_password_hash("password"),
                role="agent",
                is_active=True
            )
            db_session.add(agent)
            db_session.commit()

        # Login as agent
        login_response = client.post("/auth/login",
                                   json={"identifiant": "agent_user", "password": "password"})
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Agent should NOT be able to delete lists (depending on your business rules)
        response = client.delete(f"/mailing-lists/{test_mailing_list}", headers=headers)
        assert response.status_code in [403, 401]  # Forbidden or Unauthorized


# Additional helper functions for complex testing scenarios
def verify_list_contents(db_session: Session, list_id: int, expected_contact_ids: list):
    """Helper function to verify mailing list contents after API operations"""
    mailing_list = db_session.query(MailingList).filter(
        MailingList.id_liste == list_id
    ).first()

    if mailing_list:
        db_session.refresh(mailing_list)
        actual_contact_ids = [contact.id_contact for contact in mailing_list.contacts]
        return set(actual_contact_ids) == set(expected_contact_ids)

    return False


def get_fresh_mailing_list(db_session: Session, list_id: int):
    """Helper function to get a fresh mailing list object"""
    mailing_list = db_session.query(MailingList).filter(
        MailingList.id_liste == list_id
    ).first()

    if mailing_list:
        db_session.refresh(mailing_list)
        # Refresh all related objects too
        for contact in mailing_list.contacts:
            db_session.refresh(contact)

    return mailing_list
