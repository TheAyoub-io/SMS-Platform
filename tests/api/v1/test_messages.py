from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, UTC

from app.db.models import Message, Campaign, Contact, MailingList, MessageTemplate

def test_read_messages(client: TestClient, db_session: Session, admin_auth_headers: dict):
    # --- Setup ---
    template = MessageTemplate(nom_modele="Test Template", contenu_modele="Hello {prenom}!")
    contact = Contact(nom="Test", prenom="User", numero_telephone="+33612345678", statut_opt_in=True)
    campaign = Campaign(
        nom_campagne="Test Campaign for Messages",
        template=template,
        statut="draft",
        date_debut=datetime(2025, 1, 1), date_fin=datetime(2025, 1, 31),
        type_campagne="promotional", id_agent=1
    )
    # Add and commit to get IDs
    db_session.add_all([template, contact, campaign])
    db_session.commit()

    mailing_list = MailingList(nom_liste="Test List for Messages", campaign=campaign, contacts=[contact])
    db_session.add(mailing_list)
    db_session.commit()

    message = Message(
        contenu="Test message content",
        date_envoi=datetime.now(UTC),
        statut_livraison='sent',
        identifiant_expediteur='test-sender',
        id_liste=mailing_list.id_liste,
        id_contact=contact.id_contact,
        id_campagne=campaign.id_campagne
    )
    db_session.add(message)
    db_session.commit()

    # --- Execute ---
    response = client.get("/messages/", headers=admin_auth_headers)

    # --- Assert ---
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # The list might contain messages from other tests, so we check if our message is present
    assert any(m["contenu"] == "Test message content" for m in data)


def test_read_messages_by_campaign(client: TestClient, db_session: Session, admin_auth_headers: dict):
    # --- Setup ---
    template = MessageTemplate(nom_modele="Test Template 2", contenu_modele="Hello {prenom}!")
    contact = Contact(nom="Test", prenom="User 2", numero_telephone="+33687654321", statut_opt_in=True)
    db_session.add_all([template, contact])
    db_session.commit()

    campaign1 = Campaign(
        nom_campagne="Campaign 1", template=template, statut="completed",
        date_debut=datetime(2025, 2, 1), date_fin=datetime(2025, 2, 28),
        type_campagne="promotional", id_agent=1
    )
    db_session.add(campaign1)
    db_session.commit()
    mailing_list1 = MailingList(nom_liste="List for Campaign 1", campaign=campaign1, contacts=[contact])
    db_session.add(mailing_list1)
    db_session.commit()
    message1 = Message(
        contenu="Message for campaign 1", date_envoi=datetime.now(UTC), statut_livraison='delivered',
        identifiant_expediteur='sender1', id_liste=mailing_list1.id_liste, id_contact=contact.id_contact, id_campagne=campaign1.id_campagne
    )

    campaign2 = Campaign(
        nom_campagne="Campaign 2", template=template, statut="completed",
        date_debut=datetime(2025, 3, 1), date_fin=datetime(2025, 3, 31),
        type_campagne="promotional", id_agent=1
    )
    db_session.add(campaign2)
    db_session.commit()
    mailing_list2 = MailingList(nom_liste="List for Campaign 2", campaign=campaign2, contacts=[contact])
    db_session.add(mailing_list2)
    db_session.commit()
    message2 = Message(
        contenu="Message for campaign 2", date_envoi=datetime.now(UTC), statut_livraison='delivered',
        identifiant_expediteur='sender2', id_liste=mailing_list2.id_liste, id_contact=contact.id_contact, id_campagne=campaign2.id_campagne
    )

    db_session.add_all([message1, message2])
    db_session.commit()

    # --- Execute ---
    response = client.get(f"/messages/campaign/{campaign1.id_campagne}", headers=admin_auth_headers)

    # --- Assert ---
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["contenu"] == "Message for campaign 1"
    assert data[0]["id_campagne"] == campaign1.id_campagne


def test_get_message_status(client: TestClient, db_session: Session, admin_auth_headers: dict):
    # --- Setup ---
    template = MessageTemplate(nom_modele="Status Template", contenu_modele="Hello!")
    contact = Contact(nom="Status", prenom="Test", numero_telephone="+33698765432", statut_opt_in=True)
    campaign = Campaign(
        nom_campagne="Status Campaign", template=template, statut="completed",
        date_debut=datetime(2025, 4, 1), date_fin=datetime(2025, 4, 30),
        type_campagne="informational", id_agent=1
    )
    db_session.add_all([template, contact, campaign])
    db_session.commit()

    mailing_list = MailingList(nom_liste="Status List", campaign=campaign, contacts=[contact])
    db_session.add(mailing_list)
    db_session.commit()

    message = Message(
        contenu="Check status message", date_envoi=datetime.now(UTC), statut_livraison='failed',
        identifiant_expediteur='status-sender', id_liste=mailing_list.id_liste, id_contact=contact.id_contact, id_campagne=campaign.id_campagne
    )
    db_session.add(message)
    db_session.commit()

    # --- Execute ---
    response = client.get(f"/messages/{message.id_message}/status", headers=admin_auth_headers)

    # --- Assert ---
    assert response.status_code == 200
    data = response.json()
    assert data["statut_livraison"] == "failed"


def test_resend_message(client: TestClient, db_session: Session, admin_auth_headers: dict):
    # --- Setup ---
    template = MessageTemplate(nom_modele="Resend Template", contenu_modele="Hello again!")
    contact = Contact(nom="Resend", prenom="User", numero_telephone="+33611223344", statut_opt_in=True)
    campaign = Campaign(
        nom_campagne="Resend Campaign", template=template, statut="completed",
        date_debut=datetime(2025, 5, 1), date_fin=datetime(2025, 5, 31),
        type_campagne="informational", id_agent=1
    )
    db_session.add_all([template, contact, campaign])
    db_session.commit()

    mailing_list = MailingList(nom_liste="Resend List", campaign=campaign, contacts=[contact])
    db_session.add(mailing_list)
    db_session.commit()

    message = Message(
        contenu="Failed message to resend", date_envoi=datetime.now(UTC), statut_livraison='failed',
        identifiant_expediteur='resend-sender', id_liste=mailing_list.id_liste, id_contact=contact.id_contact, id_campagne=campaign.id_campagne
    )
    db_session.add(message)
    db_session.commit()

    # --- Execute ---
    response = client.post(f"/messages/resend/{message.id_message}", headers=admin_auth_headers)

    # --- Assert ---
    assert response.status_code == 200
    data = response.json()
    assert data["statut_livraison"] == "pending"

    # Verify in DB
    db_message = db_session.query(Message).get(message.id_message)
    assert db_message.statut_livraison == "pending"
