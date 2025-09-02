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
celery_app.autodiscover_tasks(['app.services'])

# Optional configuration
celery_app.conf.update(
    task_track_started=True,
    broker_connection_retry_on_startup=True,
)

if __name__ == '__main__':
    celery_app.start()
