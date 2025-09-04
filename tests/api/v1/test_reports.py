import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models import Campaign, Message, Agent, MailingList, Contact
from datetime import datetime, timedelta

@pytest.fixture
def setup_comparison_data(db_session: Session):
    """
    Set up data for campaign comparison tests.
    Creates two campaigns and adds messages to them.
    """
    # Create a test agent if one doesn't exist
    agent = db_session.query(Agent).filter(Agent.id_agent == 1).first()
    if not agent:
        agent = Agent(id_agent=1, nom_agent="Test Agent", identifiant="test_reports_agent", mot_de_passe="password", role="admin")
        db_session.add(agent)
        db_session.commit()

    now = datetime.now()
    # Campaign 1: High delivery rate
    campaign1 = Campaign(
        nom_campagne="High Delivery Campaign",
        type_campagne="promotional",
        id_agent=agent.id_agent,
        date_debut=now,
        date_fin=now + timedelta(days=1),
        statut="active",
    )
    # Campaign 2: Lower delivery rate
    campaign2 = Campaign(
        nom_campagne="Low Delivery Campaign",
        type_campagne="promotional",
        id_agent=agent.id_agent,
        date_debut=now,
        date_fin=now + timedelta(days=1),
        statut="active",
    )
    db_session.add_all([campaign1, campaign2])
    db_session.commit()

    # Create mailing lists for each campaign
    mailing_list1 = MailingList(nom_liste="List C1", id_campagne=campaign1.id_campagne)
    mailing_list2 = MailingList(nom_liste="List C2", id_campagne=campaign2.id_campagne)
    db_session.add_all([mailing_list1, mailing_list2])
    db_session.commit()

    # Create contacts
    contacts = [
        Contact(nom="User", prenom="1", numero_telephone="1111", segment="VIP"),
        Contact(nom="User", prenom="2", numero_telephone="2222", segment="VIP"),
        Contact(nom="User", prenom="3", numero_telephone="3333", segment="Standard"),
        Contact(nom="User", prenom="4", numero_telephone="4444", segment="Standard"),
        Contact(nom="User", prenom="5", numero_telephone="5555", segment="New"),
        Contact(nom="User", prenom="6", numero_telephone="6666", segment="VIP"),
        Contact(nom="User", prenom="7", numero_telephone="7777", segment="Standard"),
        Contact(nom="User", prenom="8", numero_telephone="8888", segment="New"),
    ]
    db_session.add_all(contacts)
    db_session.commit()

    now = datetime.now()
    messages_c1 = [
        Message(id_campagne=campaign1.id_campagne, id_liste=mailing_list1.id_liste, id_contact=contacts[0].id_contact, statut_livraison="delivered", contenu=".", date_envoi=now, identifiant_expediteur="sender", cost=0.05),
        Message(id_campagne=campaign1.id_campagne, id_liste=mailing_list1.id_liste, id_contact=contacts[1].id_contact, statut_livraison="delivered", contenu=".", date_envoi=now, identifiant_expediteur="sender", cost=0.05),
        Message(id_campagne=campaign1.id_campagne, id_liste=mailing_list1.id_liste, id_contact=contacts[2].id_contact, statut_livraison="delivered", contenu=".", date_envoi=now, identifiant_expediteur="sender", cost=0.05),
        Message(id_campagne=campaign1.id_campagne, id_liste=mailing_list1.id_liste, id_contact=contacts[3].id_contact, statut_livraison="sent", contenu=".", date_envoi=now, identifiant_expediteur="sender", cost=0.05),
    ]
    messages_c2 = [
        Message(id_campagne=campaign2.id_campagne, id_liste=mailing_list2.id_liste, id_contact=contacts[4].id_contact, statut_livraison="delivered", contenu=".", date_envoi=now, identifiant_expediteur="sender", cost=0.05),
        Message(id_campagne=campaign2.id_campagne, id_liste=mailing_list2.id_liste, id_contact=contacts[5].id_contact, statut_livraison="sent", contenu=".", date_envoi=now, identifiant_expediteur="sender", cost=0.05),
        Message(id_campagne=campaign2.id_campagne, id_liste=mailing_list2.id_liste, id_contact=contacts[6].id_contact, statut_livraison="sent", contenu=".", date_envoi=now, identifiant_expediteur="sender", cost=0.05),
        Message(id_campagne=campaign2.id_campagne, id_liste=mailing_list2.id_liste, id_contact=contacts[7].id_contact, statut_livraison="failed", contenu=".", date_envoi=now, identifiant_expediteur="sender", cost=0.05),
    ]
    db_session.add_all(messages_c1 + messages_c2)
    db_session.commit()

    return campaign1.id_campagne, campaign2.id_campagne

class TestAnalyticsEndpoints:
    def test_get_dashboard_stats(self, client: TestClient, admin_auth_headers: dict, setup_comparison_data):
        """
        Test the main dashboard statistics endpoint.
        """
        response = client.get("/reports/dashboard", headers=admin_auth_headers)

        assert response.status_code == 200
        data = response.json()

        assert "total_campaigns" in data
        assert "total_contacts" in data
        assert "total_sms_sent" in data
        assert "total_cost" in data
        assert "overall_delivery_rate" in data
        assert "total_messages_delivered" in data
        assert "total_messages_failed" in data

        # Check that the values are plausible based on the fixture
        assert data["total_campaigns"] >= 2
        assert data["total_contacts"] >= 8
        assert data["total_sms_sent"] >= 8

    def test_get_campaign_comparison(
        self, client: TestClient, admin_auth_headers: dict, setup_comparison_data
    ):
        """
        Test the campaign comparison endpoint with valid data.
        """
        c1_id, c2_id = setup_comparison_data

        response = client.get(
            f"/reports/campaign-comparison?campaign_ids={c1_id}&campaign_ids={c2_id}",
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        assert "comparison_data" in data
        assert len(data["comparison_data"]) == 2

        c1_data = next((item for item in data["comparison_data"] if item["campaign_id"] == c1_id), None)
        c2_data = next((item for item in data["comparison_data"] if item["campaign_id"] == c2_id), None)

        assert c1_data is not None
        assert c2_data is not None

        # Verify Campaign 1 data
        assert c1_data["campaign_name"] == "High Delivery Campaign"
        assert c1_data["messages_sent"] == 4
        assert pytest.approx(c1_data["delivery_rate"]) == 75.0 # 3 of 4 delivered

        # Verify Campaign 2 data
        assert c2_data["campaign_name"] == "Low Delivery Campaign"
        assert c2_data["messages_sent"] == 4
        assert pytest.approx(c2_data["delivery_rate"]) == 25.0 # 1 of 4 delivered

    def test_get_campaign_comparison_empty(
        self, client: TestClient, admin_auth_headers: dict
    ):
        """
        Test the campaign comparison endpoint with no campaign IDs.
        """
        response = client.get(
            "/reports/campaign-comparison",
            headers=admin_auth_headers,
        )
        # Expect a 422 Unprocessable Entity because the query parameter is required
        assert response.status_code == 422

    def test_get_delivery_timeline(
        self, client: TestClient, admin_auth_headers: dict, setup_comparison_data
    ):
        """
        Test the delivery timeline endpoint.
        """
        c1_id, _ = setup_comparison_data

        response = client.get(
            f"/reports/delivery-timeline/{c1_id}",
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "timeline" in data
        assert len(data["timeline"]) > 0
        assert "timestamp" in data["timeline"][0]
        assert "delivered_count" in data["timeline"][0]

    def test_get_segment_analysis(
        self, client: TestClient, admin_auth_headers: dict, setup_comparison_data
    ):
        """
        Test the segment analysis endpoint.
        """
        c1_id, _ = setup_comparison_data

        response = client.get(
            f"/reports/segment-analysis/{c1_id}",
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "analysis" in data
        # In the fixture, we need to add segments to contacts for this to be meaningful
        assert isinstance(data["analysis"], list)
        assert len(data["analysis"]) > 0 # We added segments, so it shouldn't be empty
        assert "segment_name" in data["analysis"][0]
        assert data["analysis"][0]["messages_sent"] > 0

    def test_get_cost_analysis(
        self, client: TestClient, admin_auth_headers: dict, setup_comparison_data
    ):
        """
        Test the cost analysis endpoint.
        """
        c1_id, _ = setup_comparison_data

        response = client.get(
            f"/reports/cost-analysis/{c1_id}",
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "total_cost" in data
        assert "cost_per_message" in data
        assert "cost_per_delivered_message" in data
        assert data["total_cost"] > 0

    def test_get_contact_engagement(
        self, client: TestClient, admin_auth_headers: dict, setup_comparison_data
    ):
        """
        Test the contact engagement endpoint.
        """
        c1_id, _ = setup_comparison_data

        response = client.get(
            f"/reports/contact-engagement/{c1_id}",
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "report" in data
        assert len(data["report"]) > 0
        assert "contact_id" in data["report"][0]
        assert "engagement_score" in data["report"][0]

    def test_export_pdf(
        self, client: TestClient, admin_auth_headers: dict, setup_comparison_data
    ):
        """
        Test exporting a report in PDF format.
        """
        c1_id, _ = setup_comparison_data

        response = client.get(
            f"/reports/export/pdf/{c1_id}",
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert len(response.content) > 0

    def test_export_excel(
        self, client: TestClient, admin_auth_headers: dict, setup_comparison_data
    ):
        """
        Test exporting a report in Excel format.
        """
        c1_id, _ = setup_comparison_data

        response = client.get(
            f"/reports/export/excel/{c1_id}",
            headers=admin_auth_headers,
        )

        assert response.status_code == 200
        assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        assert len(response.content) > 0

    def test_export_invalid_format(
        self, client: TestClient, admin_auth_headers: dict, setup_comparison_data
    ):
        """
        Test exporting a report with an invalid format.
        """
        c1_id, _ = setup_comparison_data

        response = client.get(
            f"/reports/export/invalid/{c1_id}",
            headers=admin_auth_headers,
        )

        assert response.status_code == 400
