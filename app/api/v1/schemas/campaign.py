from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CampaignBase(BaseModel):
    nom_campagne: str
    date_debut: datetime
    date_fin: datetime
    statut: str
    type_campagne: str
    id_modele: Optional[int] = None

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(CampaignBase):
    pass

class CampaignInDBBase(CampaignBase):
    id_campagne: int
    id_agent: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Campaign(CampaignInDBBase):
    pass
