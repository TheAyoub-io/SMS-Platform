from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.v1.schemas.auth import UserLogin, Token
from app.core.security import verify_password, create_access_token
from app.db.session import get_db
from app.db.models import Agent

router = APIRouter()

@router.post("/login", response_model=Token)
def login(form_data: UserLogin, db: Session = Depends(get_db)):
    """
    Logs in a user and returns an access token.
    """
    user = db.query(Agent).filter(Agent.identifiant == form_data.identifiant).first()
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
