from pydantic_settings import BaseSettings
from typing import List, Optional
from pathlib import Path

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_PHONE_NUMBER: str

    # SMS Service Settings
    BASE_URL: str
    SMS_RATE_LIMIT: Optional[str] = None

    # Celery Settings
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    REDIS_URL: str = "redis://localhost:6379"
    MAX_FILE_SIZE: int = 10485760
    UPLOAD_DIRECTORY: str = "./uploads"

    class Config:
        env_file = ".env"

settings = Settings()
