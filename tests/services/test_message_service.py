from sqlalchemy.orm import Session
from datetime import datetime, UTC

from app.services import message_service
from app.db.models import Message, Campaign, Contact, MailingList, MessageTemplate, Agent

def test_get_message(db_session: Session):
    # --- Setup ---
    # Create a dummy agent, template, contact, campaign, and mailing list
    agent = Agent(nom_agent="Test Agent", identifiant="test_agent", mot_de_passe="password", role="agent")
    template = MessageTemplate(nom_modele="Service Test Template", contenu_modele="Hello")
    contact = Contact(nom="Service", prenom="Test", numero_telephone="+33699999999", statut_opt_in=True)
    campaign = Campaign(
        nom_campagne="Service Test Campaign",
        template=template,
        agent=agent,
        statut="active",
        date_debut=datetime(2025, 1, 1),
        date_fin=datetime(2025, 1, 31),
        type_campagne="promotional"
    )
    db_session.add_all([agent, template, contact, campaign])
    db_session.commit()

    mailing_list = MailingList(nom_liste="Service Test List", campaign=campaign, contacts=[contact])
    db_session.add(mailing_list)
    db_session.commit()

    message = Message(
        contenu="Service test message",
        date_envoi=datetime.now(UTC),
        statut_livraison='sent',
        identifiant_expediteur='service-sender',
        id_liste=mailing_list.id_liste,
        id_contact=contact.id_contact,
        id_campagne=campaign.id_campagne
    )
    db_session.add(message)
    db_session.commit()

    # --- Execute ---
    retrieved_message = message_service.get_message(db_session, message_id=message.id_message)

    # --- Assert ---
    assert retrieved_message is not None
    assert retrieved_message.id_message == message.id_message
    assert retrieved_message.contenu == "Service test message"


def test_get_messages(db_session: Session):
    # --- Setup ---
    # Clear previous messages and create new ones to ensure a clean state
    db_session.query(Message).delete()
    db_session.commit()

    agent = Agent(nom_agent="Test Agent 2", identifiant="test_agent_2", mot_de_passe="password", role="agent")
    template = MessageTemplate(nom_modele="Service Test Template 2", contenu_modele="Hello")
    contact = Contact(nom="Service 2", prenom="Test", numero_telephone="+33699999998", statut_opt_in=True)
    campaign = Campaign(
        nom_campagne="Service Test Campaign 2",
        template=template,
        agent=agent,
        statut="active",
        date_debut=datetime(2025, 1, 1),
        date_fin=datetime(2025, 1, 31),
        type_campagne="promotional"
    )
    db_session.add_all([agent, template, contact, campaign])
    db_session.commit()

    mailing_list = MailingList(nom_liste="Service Test List 2", campaign=campaign, contacts=[contact])
    db_session.add(mailing_list)
    db_session.commit()

    message1 = Message(contenu="Msg 1", date_envoi=datetime.now(UTC), statut_livraison='sent', identifiant_expediteur='s', id_liste=mailing_list.id_liste, id_contact=contact.id_contact, id_campagne=campaign.id_campagne)
    message2 = Message(contenu="Msg 2", date_envoi=datetime.now(UTC), statut_livraison='sent', identifiant_expediteur='s', id_liste=mailing_list.id_liste, id_contact=contact.id_contact, id_campagne=campaign.id_campagne)
    db_session.add_all([message1, message2])
    db_session.commit()

    # --- Execute ---
    messages = message_service.get_messages(db_session, limit=2)

    # --- Assert ---
    assert len(messages) == 2


def test_get_messages_by_campaign(db_session: Session):
    # --- Setup ---
    agent = Agent(nom_agent="Test Agent 3", identifiant="test_agent_3", mot_de_passe="password", role="agent")
    template = MessageTemplate(nom_modele="Service Test Template 3", contenu_modele="Hello")
    contact = Contact(nom="Service 3", prenom="Test", numero_telephone="+33699999997", statut_opt_in=True)

    campaign1 = Campaign(nom_campagne="C1", template=template, agent=agent, statut="active", date_debut=datetime(2025, 1, 1), date_fin=datetime(2025, 1, 31), type_campagne="promotional")
    campaign2 = Campaign(nom_campagne="C2", template=template, agent=agent, statut="active", date_debut=datetime(2025, 2, 1), date_fin=datetime(2025, 2, 28), type_campagne="promotional")
    db_session.add_all([agent, template, contact, campaign1, campaign2])
    db_session.commit()

    list1 = MailingList(nom_liste="L1", campaign=campaign1, contacts=[contact])
    list2 = MailingList(nom_liste="L2", campaign=campaign2, contacts=[contact])
    db_session.add_all([list1, list2])
    db_session.commit()

    msg1 = Message(contenu="M1", date_envoi=datetime.now(UTC), statut_livraison='sent', identifiant_expediteur='s', id_liste=list1.id_liste, id_contact=contact.id_contact, id_campagne=campaign1.id_campagne)
    msg2 = Message(contenu="M2", date_envoi=datetime.now(UTC), statut_livraison='sent', identifiant_expediteur='s', id_liste=list2.id_liste, id_contact=contact.id_contact, id_campagne=campaign2.id_campagne)
    db_session.add_all([msg1, msg2])
    db_session.commit()

    # --- Execute ---
    campaign1_messages = message_service.get_messages_by_campaign(db_session, campaign_id=campaign1.id_campagne)

    # --- Assert ---
    assert len(campaign1_messages) == 1
    assert campaign1_messages[0].id_campagne == campaign1.id_campagne


def test_resend_message(db_session: Session):
    # --- Setup ---
    agent = Agent(nom_agent="Test Agent 4", identifiant="test_agent_4", mot_de_passe="password", role="agent")
    template = MessageTemplate(nom_modele="Service Test Template 4", contenu_modele="Hello")
    contact = Contact(nom="Service 4", prenom="Test", numero_telephone="+33699999996", statut_opt_in=True)
    campaign = Campaign(nom_campagne="C4", template=template, agent=agent, statut="active", date_debut=datetime(2025, 1, 1), date_fin=datetime(2025, 1, 31), type_campagne="promotional")
    db_session.add_all([agent, template, contact, campaign])
    db_session.commit()

    mailing_list = MailingList(nom_liste="L4", campaign=campaign, contacts=[contact])
    db_session.add(mailing_list)
    db_session.commit()

    message = Message(
        contenu="Resend test", date_envoi=datetime.now(UTC), statut_livraison='failed',
        identifiant_expediteur='s', id_liste=mailing_list.id_liste, id_contact=contact.id_contact, id_campagne=campaign.id_campagne
    )
    db_session.add(message)
    db_session.commit()

    # --- Execute ---
    resent_message = message_service.resend_message(db_session, message_id=message.id_message)

    # --- Assert ---
    assert resent_message is not None
    assert resent_message.statut_livraison == "pending"

    # Verify in DB
    db_message = db_session.query(Message).filter(Message.id_message == message.id_message).first()
    assert db_message.statut_livraison == "pending"
