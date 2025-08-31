from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    nom_agent: str
    username: str
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

    class Config:
        from_attributes = True # This fixes the 'orm_mode' warning
