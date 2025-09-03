from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.schemas import campaign as campaign_schema
from app.services import campaign_service
from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_user
from app.services.sms_service import SmsService


router = APIRouter()

@router.post("/", response_model=campaign_schema.Campaign)
def create_campaign(
    campaign: campaign_schema.CampaignCreate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Create new campaign.
    """
    return campaign_service.create_campaign(db=db, campaign=campaign, agent_id=current_user.id_agent)

@router.post("/{campaign_id}/launch", response_model=dict)
def launch_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Launch a campaign.
    """
    sms_service = SmsService(db=db)
    result = sms_service.launch_campaign(campaign_id=campaign_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@router.get("/", response_model=List[campaign_schema.Campaign])
def read_campaigns(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Retrieve campaigns.
    """
    campaigns = campaign_service.get_campaigns(db, skip=skip, limit=limit)
    return campaigns


@router.get("/{campaign_id}", response_model=campaign_schema.Campaign)
def read_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get campaign by ID.
    """
    db_campaign = campaign_service.get_campaign(db, campaign_id=campaign_id)
    if db_campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return db_campaign


@router.put("/{campaign_id}", response_model=campaign_schema.Campaign)
def update_campaign(
    campaign_id: int,
    campaign: campaign_schema.CampaignUpdate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Update a campaign.
    """
    db_campaign = campaign_service.get_campaign(db, campaign_id=campaign_id)
    if db_campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    # Add authorization logic here if needed, e.g. check if current_user is the owner
    return campaign_service.update_campaign(db=db, campaign_id=campaign_id, campaign=campaign)


@router.delete("/{campaign_id}", response_model=campaign_schema.Campaign)
def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Delete a campaign.
    """
    db_campaign = campaign_service.get_campaign(db, campaign_id=campaign_id)
    if db_campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    # Add authorization logic here if needed
    return campaign_service.delete_campaign(db=db, campaign_id=campaign_id)
