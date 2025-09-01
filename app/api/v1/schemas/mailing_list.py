from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional

from app.api.v1.schemas.contact import Contact

class MailingListBase(BaseModel):
    nom_liste: str
    description: Optional[str] = None

class MailingListCreate(MailingListBase):
    contact_ids: List[int] = []
    id_campagne: Optional[int] = None

class MailingListUpdate(MailingListBase):
    id_campagne: Optional[int] = None

class MailingListInDBBase(MailingListBase):
    id_liste: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MailingList(MailingListInDBBase):
    contacts: List[Contact] = []
