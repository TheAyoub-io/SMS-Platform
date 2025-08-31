from sqlalchemy.orm import Session
from app.db.models import Campaign
from app.api.v1.schemas.campaign import CampaignCreate, CampaignUpdate

def create_campaign(db: Session, campaign: CampaignCreate, agent_id: int):
    db_campaign = Campaign(**campaign.model_dump(), id_agent=agent_id)
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

def get_campaign(db: Session, campaign_id: int):
    return db.query(Campaign).filter(Campaign.id_campagne == campaign_id).first()

def get_campaigns(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Campaign).offset(skip).limit(limit).all()

def update_campaign(db: Session, campaign_id: int, campaign: CampaignUpdate):
    db_campaign = get_campaign(db, campaign_id)
    if db_campaign:
        for key, value in campaign.model_dump().items():
            setattr(db_campaign, key, value)
        db.commit()
        db.refresh(db_campaign)
    return db_campaign

def delete_campaign(db: Session, campaign_id: int):
    db_campaign = get_campaign(db, campaign_id)
    if db_campaign:
        db.delete(db_campaign)
        db.commit()
    return db_campaign
