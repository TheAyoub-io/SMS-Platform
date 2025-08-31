import io
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.models import CampaignReport, Campaign, Contact, Message

def get_campaign_report(db: Session, campaign_id: int):
    return db.query(CampaignReport).filter(CampaignReport.id_campagne == campaign_id).first()

def get_dashboard_stats(db: Session):
    total_campaigns = db.query(func.count(Campaign.id_campagne)).scalar()
    total_contacts = db.query(func.count(Contact.id_contact)).scalar()
    total_sms_sent = db.query(func.sum(CampaignReport.total_sent)).scalar() or 0
    total_cost = db.query(func.sum(CampaignReport.total_cost)).scalar() or 0
    return {
        "total_campaigns": total_campaigns,
        "total_contacts": total_contacts,
        "total_sms_sent": total_sms_sent,
        "total_cost": total_cost,
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
