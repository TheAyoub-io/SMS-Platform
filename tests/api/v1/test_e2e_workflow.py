from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.db.models import Campaign, Contact, MailingList, Message, SMSQueue

def test_full_campaign_workflow(client: TestClient, db_session: Session, admin_auth_headers: dict):
    """
    Tests a comprehensive, end-to-end user workflow for creating and managing a campaign.
    """
    # === Step 1: Create a Campaign ===
    campaign_response = client.post(
        "/campaigns/",
        json={
            "nom_campagne": "E2E Test Campaign",
            "date_debut": (datetime.now() + timedelta(days=1)).isoformat(),
            "date_fin": (datetime.now() + timedelta(days=10)).isoformat(),
            "statut": "draft",
            "type_campagne": "promotional",
        },
        headers=admin_auth_headers,
    )
    assert campaign_response.status_code == 200
    campaign_data = campaign_response.json()
    campaign_id = campaign_data["id_campagne"]
    assert campaign_data["nom_campagne"] == "E2E Test Campaign"

    # === Step 2: Create a Mailing List for the campaign ===
    list_response = client.post(
        "/mailing-lists/",
        json={
            "nom_liste": "E2E Test List",
            "description": "A list for the E2E test",
            "id_campagne": campaign_id
        },
        headers=admin_auth_headers,
    )
    assert list_response.status_code == 200
    list_data = list_response.json()
    list_id = list_data["id_liste"]
    assert list_data["nom_liste"] == "E2E Test List"

    # === Step 3: Add Contacts to the Mailing List ===
    # Create contacts first
    contact1 = Contact(nom="E2E_One", prenom="Test", numero_telephone="+33630000001")
    contact2 = Contact(nom="E2E_Two", prenom="Test", numero_telephone="+33630000002")
    db_session.add_all([contact1, contact2])
    db_session.commit()
    contact_ids = [contact1.id_contact, contact2.id_contact]

    # Add them to the list
    add_contacts_response = client.post(
        f"/mailing-lists/{list_id}/contacts",
        json={"contact_ids": contact_ids},
        headers=admin_auth_headers,
    )
    assert add_contacts_response.status_code == 200
    assert add_contacts_response.json()["contacts_added"] == 2

    # === Step 4: Preview the campaign (requires a template) ===
    # We need to associate a template with the campaign first
    from app.db.models import MessageTemplate
    template = MessageTemplate(nom_modele="E2E Template", contenu_modele="Hello {prenom} from E2E test")
    db_session.add(template)
    db_session.commit()

    # To update the campaign, we must send the full object
    campaign_obj_before_update = db_session.query(Campaign).get(campaign_id)
    update_payload = {
        "nom_campagne": campaign_obj_before_update.nom_campagne,
        "date_debut": campaign_obj_before_update.date_debut.isoformat(),
        "date_fin": campaign_obj_before_update.date_fin.isoformat(),
        "statut": campaign_obj_before_update.statut,
        "type_campagne": campaign_obj_before_update.type_campagne,
        "id_modele": template.id_modele,
    }
    update_response = client.put(
        f"/campaigns/{campaign_id}",
        json=update_payload,
        headers=admin_auth_headers
    )
    assert update_response.status_code == 200

    preview_response = client.get(f"/campaigns/{campaign_id}/preview", headers=admin_auth_headers)
    assert preview_response.status_code == 200
    preview_data = preview_response.json()
    assert preview_data["preview_count"] == 2
    assert "Hello Test from E2E test" in preview_data["items"][0]["personalized_message"]

    # === Step 5: Launch the Campaign ===
    launch_response = client.post(f"/campaigns/{campaign_id}/launch", headers=admin_auth_headers)
    assert launch_response.status_code == 200
    assert launch_response.json()["success"] is True

    # Verify campaign is now active
    campaign_obj = db_session.query(Campaign).get(campaign_id)
    assert campaign_obj.statut == "active"

    # Verify items were added to the SMS queue
    queued_items = db_session.query(SMSQueue).filter_by(campaign_id=campaign_id).all()
    assert len(queued_items) == 2

    # === Step 6: Check the real-time Status ===
    # Note: The E2E test doesn't run the Celery worker, so messages won't move from 'pending'.
    # We will simulate this by manually creating 'Message' entries as if they were processed.
    db_session.query(SMSQueue).delete() # Clear the queue
    msg1 = Message(contenu="...", date_envoi=datetime.now(timezone.utc), statut_livraison='delivered', identifiant_expediteur='test', id_liste=list_id, id_contact=contact_ids[0], id_campagne=campaign_id)
    msg2 = Message(contenu="...", date_envoi=datetime.now(timezone.utc), statut_livraison='sent', identifiant_expediteur='test', id_liste=list_id, id_contact=contact_ids[1], id_campagne=campaign_id)
    db_session.add_all([msg1, msg2])
    db_session.commit()

    status_response = client.get(f"/campaigns/{campaign_id}/status", headers=admin_auth_headers)
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["total_messages"] == 2
    assert status_data["delivered"] == 1
    assert status_data["sent"] == 1
    assert status_data["pending"] == 0

    # === Step 7: Pause the Campaign ===
    pause_response = client.post(f"/campaigns/{campaign_id}/pause", headers=admin_auth_headers)
    assert pause_response.status_code == 200

    # === Step 8: Verify the final state ===
    final_campaign_obj = db_session.query(Campaign).get(campaign_id)
    assert final_campaign_obj.statut == "paused"
