import pytest
from sqlalchemy.orm import Session
from datetime import datetime, UTC, timedelta
from decimal import Decimal

from app.services.analytics_service import AnalyticsService
from app.db.models import Agent, MessageTemplate, Contact, Campaign, MailingList, Message

@pytest.fixture(scope="function")
def analytics_service(db_session: Session) -> AnalyticsService:
    return AnalyticsService(db_session)

def setup_test_data(db_session: Session):
    """Helper function to create a standard set of data for analytics tests."""
    agent = Agent(nom_agent="Analytics Agent", identifiant="analytics_agent", mot_de_passe="pw", role="admin")
    template = MessageTemplate(nom_modele="Analytics Template", contenu_modele="Hello {prenom}")

    contact1 = Contact(nom="Doe", prenom="John", numero_telephone="+33111111111", segment="VIP")
    contact2 = Contact(nom="Roe", prenom="Jane", numero_telephone="+33222222222", segment="New")
    contact3 = Contact(nom="Smith", prenom="Peter", numero_telephone="+33333333333", segment="VIP")

    campaign1 = Campaign(nom_campagne="Perf Test 1", template=template, agent=agent, statut="completed", date_debut=datetime.now(UTC), date_fin=datetime.now(UTC) + timedelta(days=1), type_campagne="promotional")
    campaign2 = Campaign(nom_campagne="Perf Test 2", template=template, agent=agent, statut="completed", date_debut=datetime.now(UTC), date_fin=datetime.now(UTC) + timedelta(days=1), type_campagne="promotional")

    db_session.add_all([agent, template, contact1, contact2, contact3, campaign1, campaign2])
    db_session.commit()

    list1 = MailingList(nom_liste="L1", campaign=campaign1, contacts=[contact1, contact2])
    list2 = MailingList(nom_liste="L2", campaign=campaign2, contacts=[contact3])
    db_session.add_all([list1, list2])
    db_session.commit()

    # Messages for Campaign 1
    msg1 = Message(id_campagne=campaign1.id_campagne, id_contact=contact1.id_contact, id_liste=list1.id_liste, statut_livraison="delivered", date_envoi=datetime.now(UTC), contenu=".", identifiant_expediteur="a")
    msg2 = Message(id_campagne=campaign1.id_campagne, id_contact=contact2.id_contact, id_liste=list1.id_liste, statut_livraison="failed", date_envoi=datetime.now(UTC), contenu=".", identifiant_expediteur="a")

    # Messages for Campaign 2
    msg3 = Message(id_campagne=campaign2.id_campagne, id_contact=contact3.id_contact, id_liste=list2.id_liste, statut_livraison="delivered", date_envoi=datetime.now(UTC), contenu=".", identifiant_expediteur="a")

    db_session.add_all([msg1, msg2, msg3])
    db_session.commit()

    return campaign1, campaign2

def test_get_campaign_performance_comparison(db_session: Session, analytics_service: AnalyticsService):
    # --- Setup ---
    campaign1, campaign2 = setup_test_data(db_session)

    # --- Execute ---
    result = analytics_service.get_campaign_performance_comparison(campaign_ids=[campaign1.id_campagne, campaign2.id_campagne])

    # --- Assert ---
    assert "comparison_data" in result
    data = result["comparison_data"]
    assert len(data) == 2

    # Check Campaign 1 data
    c1_data = next((item for item in data if item["campaign_id"] == campaign1.id_campagne), None)
    assert c1_data is not None
    assert c1_data["campaign_name"] == "Perf Test 1"
    assert c1_data["messages_sent"] == 2
    assert c1_data["delivery_rate"] == 50.0  # 1 delivered out of 2
    assert c1_data["click_through_rate"] == 0.0 # 'clicked' status not implemented

    # Check Campaign 2 data
    c2_data = next((item for item in data if item["campaign_id"] == campaign2.id_campagne), None)
    assert c2_data is not None
    assert c2_data["campaign_name"] == "Perf Test 2"
    assert c2_data["messages_sent"] == 1
    assert c2_data["delivery_rate"] == 100.0 # 1 delivered out of 1


def test_get_delivery_timeline(db_session: Session, analytics_service: AnalyticsService):
    # --- Setup ---
    campaign1, _ = setup_test_data(db_session)

    # --- Execute ---
    result = analytics_service.get_delivery_timeline(campaign_id=campaign1.id_campagne, interval='day')

    # --- Assert ---
    assert "timeline" in result
    data = result["timeline"]
    assert len(data) == 1

    today_str = datetime.now(UTC).strftime('%Y-%m-%d')
    assert data[0]["timestamp"] == today_str
    assert data[0]["delivered_count"] == 1
    assert data[0]["failed_count"] == 1


def test_get_segment_performance(db_session: Session, analytics_service: AnalyticsService):
    # --- Setup ---
    campaign1, _ = setup_test_data(db_session)

    # --- Execute ---
    result = analytics_service.get_segment_performance(campaign_id=campaign1.id_campagne)

    # --- Assert ---
    assert "analysis" in result
    data = result["analysis"]
    assert len(data) == 2 # VIP and New segments

    vip_data = next((s for s in data if s["segment_name"] == "VIP"), None)
    assert vip_data is not None
    assert vip_data["messages_sent"] == 1
    assert vip_data["delivery_rate"] == 100.0 # The one message to VIP was delivered

    new_data = next((s for s in data if s["segment_name"] == "New"), None)
    assert new_data is not None
    assert new_data["messages_sent"] == 1
    assert new_data["delivery_rate"] == 0.0 # The one message to New failed


def test_get_cost_analysis(db_session: Session, analytics_service: AnalyticsService):
    # --- Setup ---
    campaign1, _ = setup_test_data(db_session)
    # Add costs to messages
    messages = db_session.query(Message).filter(Message.id_campagne == campaign1.id_campagne).all()
    for msg in messages:
        msg.cost = 0.075  # 7.5 cents per message
    db_session.commit()

    # --- Execute ---
    result = analytics_service.get_cost_analysis(campaign_id=campaign1.id_campagne)

    # --- Assert ---
    assert result["total_cost"] == pytest.approx(Decimal("0.15")) # 2 messages * 0.075
    assert result["cost_per_message"] == pytest.approx(Decimal("0.075"))
    assert result["cost_per_delivered_message"] == pytest.approx(Decimal("0.15")) # 1 delivered message


def test_get_contact_engagement_scores(db_session: Session, analytics_service: AnalyticsService):
    # --- Setup ---
    campaign1, _ = setup_test_data(db_session)

    # --- Execute ---
    result = analytics_service.get_contact_engagement_scores(campaign_id=campaign1.id_campagne)

    # --- Assert ---
    assert "report" in result
    data = result["report"]
    assert len(data) == 2

    # John Doe was delivered, should have a positive score
    john_data = next((c for c in data if "John Doe" in c["contact_name"]), None)
    assert john_data is not None
    assert john_data["engagement_score"] > 0

    # Jane Roe failed, should have a negative score
    jane_data = next((c for c in data if "Jane Roe" in c["contact_name"]), None)
    assert jane_data is not None
    assert jane_data["engagement_score"] < 0
