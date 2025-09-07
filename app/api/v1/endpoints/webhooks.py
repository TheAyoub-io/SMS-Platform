from fastapi import APIRouter, Depends, Request, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated

from app.db.session import get_db
from app.services.webhook_service import WebhookService

router = APIRouter()

async def validate_twilio_request(request: Request, db: Session = Depends(get_db)):
    """Dependency to validate incoming Twilio webhooks."""
    try:
        raw_body = await request.body()
        webhook_service = WebhookService(db)
        # The URL passed to the validator must match what Twilio requested
        # including any query parameters.
        webhook_service.validate_webhook_signature(request, raw_body)
    except HTTPException as e:
        raise e # Re-raise the validation exception
    except Exception as e:
        # Catch any other exceptions during validation
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error during webhook validation")
    return raw_body


@router.post("/sms/delivery", status_code=204)
async def sms_delivery_webhook(
    request: Request,
    db: Session = Depends(get_db),
    # By using Annotated[bytes, Depends(validate_twilio_request)], we ensure validation runs first
    # but we don't consume the body here, allowing FastAPI to still parse the form.
    _=Depends(validate_twilio_request),
):
    """
    Handle incoming SMS delivery status updates from Twilio.
    Twilio sends data as application/x-www-form-urlencoded.
    """
    payload = await request.form()

    webhook_service = WebhookService(db)
    webhook_service.handle_delivery_status(payload._dict)

    return
