from pydantic import BaseModel, ConfigDict
from typing import Optional

class UserBase(BaseModel):
    nom_agent: str
    identifiant: str
    role: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    nom_agent: Optional[str] = None
    identifiant: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class User(UserBase):
    id_agent: int
    model_config = ConfigDict(from_attributes=True)
