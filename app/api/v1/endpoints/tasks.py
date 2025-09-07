from fastapi import APIRouter, Depends
from app.services.queue_service import QueueService
from app.core.security import get_current_active_admin
from app.db.models import Agent

router = APIRouter()

@router.get("/status", summary="Get Celery queue and worker status")
def get_queue_status(current_user: Agent = Depends(get_current_active_admin)):
    """
    Retrieves the status of Celery workers and active/scheduled tasks.
    Requires admin privileges.
    """
    status = QueueService.get_queue_status()
    return status

@router.post("/retry/{task_id}", summary="Retry a failed task")
def retry_task(task_id: str, current_user: Agent = Depends(get_current_active_admin)):
    """
    Manually retries a failed Celery task by its ID.
    (Note: This is a placeholder for a more robust retry mechanism).
    """
    # This is a simplified retry. A real implementation would need
    # to find the failed task, get its original arguments, and re-queue it.
    # For now, we can re-queue the generic retry task.
    from app.tasks.sms_tasks import retry_failed_messages
    retry_failed_messages.delay()
    return {"message": f"Retry signal sent for tasks. Check worker logs."}

@router.get("/progress/{task_id}", summary="Get progress of a specific task")
def get_task_progress(task_id: str, current_user: Agent = Depends(get_current_active_admin)):
    """
    Retrieves the progress of a specific background task.
    """
    progress = QueueService.get_job_progress(task_id)
    return progress
