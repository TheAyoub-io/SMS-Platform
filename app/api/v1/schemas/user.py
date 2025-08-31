from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class UserBase(BaseModel):
    nom_agent: str
    username: str = Field(validation_alias='identifiant')
    role: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    nom_agent: Optional[str] = None
    username: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class User(UserBase):
    id_agent: int
    model_config = ConfigDict(from_attributes=True)
