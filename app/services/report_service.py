import io
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.db.models import CampaignReport, Campaign, Contact, Message

def get_campaign_report(db: Session, campaign_id: int):
    return db.query(CampaignReport).filter(CampaignReport.id_campagne == campaign_id).first()

def get_dashboard_stats(db: Session):
    total_campaigns = db.query(func.count(Campaign.id_campagne)).scalar()
    total_contacts = db.query(func.count(Contact.id_contact)).scalar()

    # Query message stats directly for real-time data
    message_stats = db.query(
        func.count(Message.id_message).label("total_sms_sent"),
        func.sum(Message.cost).label("total_cost"),
        func.sum(case((Message.statut_livraison == 'delivered', 1), else_=0)).label("delivered_count"),
        func.sum(case((Message.statut_livraison == 'failed', 1), else_=0)).label("failed_count")
    ).one()

    total_sms_sent = message_stats.total_sms_sent or 0
    total_cost = message_stats.total_cost or 0
    delivered_count = message_stats.delivered_count or 0
    failed_count = message_stats.failed_count or 0

    return {
        "total_campaigns": total_campaigns,
        "total_contacts": total_contacts,
        "total_sms_sent": total_sms_sent,
        "total_cost": float(total_cost), # Ensure correct type
        "overall_delivery_rate": (delivered_count / total_sms_sent) * 100 if total_sms_sent > 0 else 0,
        "total_messages_delivered": delivered_count,
        "total_messages_failed": failed_count,
    }

def export_campaign_report(db: Session, campaign_id: int, format: str):
    report = get_campaign_report(db, campaign_id)
    if report:
        report_data = {
            "id_rapport": [report.id_rapport],
            "id_campagne": [report.id_campagne],
            "total_sent": [report.total_sent],
            "total_delivered": [report.total_delivered],
            "total_failed": [report.total_failed],
            "taux_ouverture": [report.taux_ouverture],
            "taux_clics": [report.taux_clics],
            "taux_conversion": [report.taux_conversion],
            "nombre_desabonnements": [report.nombre_desabonnements],
            "total_cost": [report.total_cost],
            "last_updated": [report.last_updated],
        }
        df = pd.DataFrame(report_data)
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        return stream.getvalue()
    return None


def get_campaign_status(db: Session, campaign_id: int) -> dict:
    """
    Calculates the real-time counts of messages in each status for a given campaign.
    """
    status_counts = db.query(
        func.count(Message.id_message).label("total_messages"),
        func.sum(case((Message.statut_livraison == 'sent', 1), else_=0)).label("sent"),
        func.sum(case((Message.statut_livraison == 'delivered', 1), else_=0)).label("delivered"),
        func.sum(case((Message.statut_livraison == 'failed', 1), else_=0)).label("failed"),
        func.sum(case((Message.statut_livraison == 'pending', 1), else_=0)).label("pending")
    ).filter(Message.id_campagne == campaign_id).one()

    # The result of the query is a Row object, which can be converted to a dict
    # or handled as a named tuple. Pydantic can handle it directly.
    return status_counts
