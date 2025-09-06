from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional

class ContactBase(BaseModel):
    nom: str
    prenom: str
    numero_telephone: str
    email: Optional[EmailStr] = None
    statut_opt_in: bool = True
    segment: Optional[str] = None
    zone_geographique: Optional[str] = None
    type_client: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(ContactBase):
    pass

class ContactInDBBase(ContactBase):
    id_contact: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

from typing import List

class Contact(ContactInDBBase):
    pass


class BulkOptInUpdate(BaseModel):
    contact_ids: List[int]
    opt_in_status: bool
