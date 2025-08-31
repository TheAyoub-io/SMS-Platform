from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.v1.schemas.auth import UserLogin, Token
from app.core.security import verify_password, create_access_token
from app.db.session import get_db
from app.db.models import Agent
from app.api.v1.schemas import user as user_schema
from app.services import user_service

router = APIRouter()

@router.post("/login", response_model=Token)
def login(form_data: UserLogin, db: Session = Depends(get_db)):
    """
    Logs in a user and returns an access token.
    """
    user = db.query(Agent).filter(Agent.identifiant == form_data.username).first()
    if not user or not verify_password(form_data.password, user.mot_de_passe):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = create_access_token(
        subject=user.identifiant,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=user_schema.User)
def register_user(
    user: user_schema.UserCreate,
    db: Session = Depends(get_db),
):
    """
    Create new user.
    """
    db_user = user_service.get_user_by_username(db, username=user.identifiant)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return user_service.create_user(db=db, user=user)
