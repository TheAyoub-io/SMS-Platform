from pydantic import BaseModel
from .user import User

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    username: str | None = None

class UserLogin(BaseModel):
    identifiant: str
    password: str
