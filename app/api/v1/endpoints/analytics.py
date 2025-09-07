from fastapi import APIRouter, Depends
from app.core.security import get_current_active_admin
from app.db.models import Agent
from app.services.business_intelligence_service import BusinessIntelligenceService
from app.services.recommendation_service import RecommendationService

router = APIRouter()
bi_service = BusinessIntelligenceService()
rec_service = RecommendationService()

@router.get("/roi/{campaign_id}", summary="Get Campaign ROI")
def get_campaign_roi(campaign_id: int, current_user: Agent = Depends(get_current_active_admin)):
    return bi_service.get_campaign_roi(campaign_id)

@router.get("/trends", summary="Get High-Level Trends")
def get_trends(current_user: Agent = Depends(get_current_active_admin)):
    return bi_service.get_trend_analysis()

@router.get("/segment-performance", summary="Get Performance by Segment")
def get_segment_performance(current_user: Agent = Depends(get_current_active_admin)):
    return bi_service.get_segment_performance()

@router.get("/recommendations/send-time/{campaign_id}", summary="Get Send Time Recommendation")
def get_send_time_recommendation(campaign_id: int, current_user: Agent = Depends(get_current_active_admin)):
    return rec_service.get_send_time_recommendation(campaign_id)

@router.get("/recommendations/audience/{campaign_id}", summary="Get Audience Recommendation")
def get_audience_recommendation(campaign_id: int, current_user: Agent = Depends(get_current_active_admin)):
    return rec_service.get_audience_recommendation(campaign_id)
