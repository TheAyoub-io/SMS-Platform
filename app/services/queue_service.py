from app.core.celery_app import celery_app
from celery.result import AsyncResult
from app.db.models import SMSQueue
from sqlalchemy.orm import Session

class QueueService:
    @staticmethod
    def enqueue_sms_batch(campaign_id: int):
        """
        This function might not be needed if the CampaignExecutionService
        directly adds items to the SMSQueue table, which the Celery beat
        schedule picks up. This service would be more for direct task invocation.

        Example of direct invocation:
        from app.tasks.sms_tasks import process_sms_batch
        process_sms_batch.delay()
        """
        pass

    @staticmethod
    def get_queue_status():
        """
        Gets statistics about the queue and workers.
        Requires Celery monitoring to be enabled (e.g., using Flower).
        """
        inspector = celery_app.control.inspect()
        stats = inspector.stats()
        active = inspector.active()
        scheduled = inspector.scheduled()
        return {
            "stats": stats,
            "active_tasks": active,
            "scheduled_tasks": scheduled,
        }

    @staticmethod
    def cancel_queued_jobs(task_id: str):
        """
        Cancels a specific task in the queue.
        """
        celery_app.control.revoke(task_id, terminate=True)

    @staticmethod
    def get_job_progress(task_id: str):
        """
        Gets the progress of a specific task.
        Requires the task to be reporting its state.
        """
        result = AsyncResult(task_id, app=celery_app)
        return {
            "id": result.id,
            "status": result.status,
            "info": result.info, # Custom state information
        }

    @staticmethod
    def get_sms_queue_items(db: Session, skip: int = 0, limit: int = 100):
        """
        Gets items from the sms_queue table with pagination.
        """
        return db.query(SMSQueue).order_by(SMSQueue.created_at.desc()).offset(skip).limit(limit).all()
