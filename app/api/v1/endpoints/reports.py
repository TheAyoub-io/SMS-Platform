from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
import io

from app.api.v1.schemas import report as report_schema
from app.services import report_service
from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_user

router = APIRouter()

@router.get("/dashboard", response_model=report_schema.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get dashboard statistics.
    """
    stats = report_service.get_dashboard_stats(db)
    return stats

@router.get("/campaign/{campaign_id}", response_model=report_schema.Report)
def get_campaign_report(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get a report for a specific campaign.
    """
    report = report_service.get_campaign_report(db, campaign_id=campaign_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found for this campaign")
    return report

@router.get("/export/{format}")
def export_report(
    format: str,
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Export a campaign report in a specific format (csv or pdf).
    """
    if format not in ["csv", "pdf"]:
        raise HTTPException(status_code=400, detail="Unsupported format. Use 'csv' or 'pdf'.")

    export_result = report_service.export_campaign_report(db, campaign_id=campaign_id, format=format)
    if export_result is None:
        raise HTTPException(status_code=404, detail="Report not found for this campaign")

    if format == "csv":
        return StreamingResponse(
            iter([export_result]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=report_{campaign_id}.csv"}
        )
    else: # pdf
        # This part is still a placeholder
        return {"message": export_result}
