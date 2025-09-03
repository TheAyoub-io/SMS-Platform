# This file will contain the Pydantic schemas for the analytics and reporting data structures.
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

class CampaignPerformanceMetrics(BaseModel):
    campaign_id: int
    campaign_name: str
    messages_sent: int
    delivery_rate: float
    click_through_rate: float # Assuming we can track this in the future
    cost: float
    roi: float

class CampaignComparison(BaseModel):
    comparison_data: List[CampaignPerformanceMetrics]

class TimelineDataPoint(BaseModel):
    timestamp: datetime
    delivered_count: int
    failed_count: int

class DeliveryTimeline(BaseModel):
    timeline: List[TimelineDataPoint]

class SegmentPerformance(BaseModel):
    segment_name: str
    messages_sent: int
    delivery_rate: float
    # Add other relevant metrics later if needed

class SegmentAnalysis(BaseModel):
    analysis: List[SegmentPerformance]

class CostAnalysis(BaseModel):
    total_cost: float
    cost_per_message: float
    cost_per_delivered_message: float

class ContactEngagement(BaseModel):
    contact_id: int
    contact_name: str
    engagement_score: float

class ContactEngagementReport(BaseModel):
    report: List[ContactEngagement]

# Other schemas for analytics will be defined here.
