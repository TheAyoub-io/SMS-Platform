from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
import io
from typing import List

from app.api.v1.schemas import report as report_schema, analytics as analytics_schema
from app.services.analytics_service import AnalyticsService
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

@router.get("/campaign-comparison", response_model=analytics_schema.CampaignComparison)
def get_campaign_comparison(
    campaign_ids: List[int] = Query(..., description="A list of campaign IDs to compare."),
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Compare performance metrics across multiple campaigns.
    """
    analytics_service = AnalyticsService(db)
    comparison_data = analytics_service.get_campaign_performance_comparison(campaign_ids=campaign_ids)
    return comparison_data

@router.get("/delivery-timeline/{campaign_id}", response_model=analytics_schema.DeliveryTimeline)
def get_delivery_timeline(
    campaign_id: int,
    interval: str = 'day',
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get the delivery timeline for a campaign.
    """
    analytics_service = AnalyticsService(db)
    timeline_data = analytics_service.get_delivery_timeline(campaign_id=campaign_id, interval=interval)
    return timeline_data

@router.get("/segment-analysis/{campaign_id}", response_model=analytics_schema.SegmentAnalysis)
def get_segment_analysis(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get the performance analysis by contact segment for a campaign.
    """
    analytics_service = AnalyticsService(db)
    analysis_data = analytics_service.get_segment_performance(campaign_id=campaign_id)
    return analysis_data

@router.get("/cost-analysis/{campaign_id}", response_model=analytics_schema.CostAnalysis)
def get_cost_analysis(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get a cost analysis report for a campaign.
    """
    analytics_service = AnalyticsService(db)
    cost_data = analytics_service.get_cost_analysis(campaign_id=campaign_id)
    return cost_data

@router.get("/contact-engagement/{campaign_id}", response_model=analytics_schema.ContactEngagementReport)
def get_contact_engagement(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get a report of contact engagement scores for a campaign.
    """
    analytics_service = AnalyticsService(db)
    engagement_data = analytics_service.get_contact_engagement_scores(campaign_id=campaign_id)
    return engagement_data

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

from app.services.report_generation_service import ReportGenerationService

@router.get("/export/{format}/{campaign_id}")
def export_report(
    format: str,
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Export a campaign report in the specified format (csv, pdf, or excel).
    """
    if format.lower() == 'csv':
        csv_data = report_service.export_campaign_report(db, campaign_id=campaign_id, format="csv")
        if csv_data is None:
            raise HTTPException(status_code=404, detail="Report not found for this campaign")
        return StreamingResponse(
            iter([csv_data]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=report_{campaign_id}.csv"}
        )

    generation_service = ReportGenerationService(db)
    if format.lower() == 'pdf':
        buffer = generation_service.export_to_pdf(campaign_id)
        media_type = "application/pdf"
        filename = f"report_{campaign_id}.pdf"
    elif format.lower() == 'excel':
        buffer = generation_service.export_to_excel(campaign_id)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = f"report_{campaign_id}.xlsx"
    else:
        raise HTTPException(status_code=400, detail="Invalid format specified. Use 'csv', 'pdf', or 'excel'.")

    return StreamingResponse(
        buffer,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
