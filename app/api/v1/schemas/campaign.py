from pydantic import BaseModel, ConfigDict
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

    model_config = ConfigDict(from_attributes=True)

class Campaign(CampaignInDBBase):
    pass


from typing import List

class CampaignStatus(BaseModel):
    total_messages: int = 0
    sent: int = 0
    delivered: int = 0
    failed: int = 0
    pending: int = 0


class CampaignPreviewItem(BaseModel):
    contact_name: str
    phone_number: str
    personalized_message: str


class CampaignPreview(BaseModel):
    preview_count: int
    items: List[CampaignPreviewItem]
