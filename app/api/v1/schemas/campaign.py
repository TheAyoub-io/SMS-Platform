from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Literal

class CampaignBase(BaseModel):
    nom_campagne: str
    date_debut: datetime
    date_fin: datetime
    statut: Literal['draft', 'scheduled', 'active', 'completed', 'paused']
    type_campagne: Literal['promotional', 'informational', 'follow_up']
    id_modele: Optional[int] = None

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    nom_campagne: Optional[str] = None
    date_debut: Optional[datetime] = None
    date_fin: Optional[datetime] = None
    statut: Optional[Literal['draft', 'scheduled', 'active', 'completed', 'paused']] = None
    type_campagne: Optional[Literal['promotional', 'informational', 'follow_up']] = None
    id_modele: Optional[int] = None

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
