import logging
from app.core.celery_app import celery_app

logger = logging.getLogger(__name__)

from app.db.session import SessionLocal
from app.db.models import Campaign
from datetime import datetime, timezone

@celery_app.task
def auto_complete_campaigns():
    """
    Scans for campaigns whose end_date has passed and marks them as 'completed'.
    """
    logger.info("Running auto_complete_campaigns task...")
    db = SessionLocal()
    try:
        campaigns_to_complete = db.query(Campaign).filter(
            Campaign.date_fin < datetime.now(timezone.utc),
            Campaign.statut.in_(['active', 'paused'])
        ).all()

        if campaigns_to_complete:
            logger.info(f"Found {len(campaigns_to_complete)} campaigns to mark as completed.")
            for campaign in campaigns_to_complete:
                campaign.statut = 'completed'
            db.commit()
    finally:
        db.close()


@celery_app.task
def schedule_campaign_reports():
    """
    Schedules the generation of final reports for completed campaigns.
    """
    logger.info("Running schedule_campaign_reports task (placeholder)...")
    # In a real system, this might queue another task:
    # from app.tasks.sms_tasks import generate_campaign_reports
    # for campaign_id in campaigns_needing_reports:
    #     generate_campaign_reports.delay(campaign_id)
    pass

@celery_app.task
def cleanup_expired_campaigns():
    """
    Performs maintenance on old campaigns, e.g., archiving them.
    """
    logger.info("Running cleanup_expired_campaigns task (placeholder)...")
    # Logic to find campaigns completed > X days ago and set status to 'archived'
    pass

@celery_app.task
def backup_campaign_data():
    """
    Placeholder for a task that backs up campaign data.
    """
    logger.info("Running backup_campaign_data task (placeholder)...")
    pass
