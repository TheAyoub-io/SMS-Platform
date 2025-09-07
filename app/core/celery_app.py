from celery import Celery
from app.core.config import settings

# Initialize the Celery application
celery_app = Celery(
    "tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

# Load task modules from all registered Django app configs.
# For FastAPI, we explicitly include the modules that contain our tasks.
celery_app.autodiscover_tasks(['app.tasks'])

# Optional configuration
celery_app.conf.update(
    task_track_started=True,
    broker_connection_retry_on_startup=True,
    beat_schedule={
        'process-sms-batch-every-minute': {
            'task': 'app.tasks.sms_tasks.process_sms_batch',
            'schedule': 60.0,
        },
        'send-scheduled-campaigns-every-minute': {
            'task': 'app.tasks.sms_tasks.send_scheduled_campaigns',
            'schedule': 60.0,
        },
    },
)

if __name__ == '__main__':
    celery_app.start()
