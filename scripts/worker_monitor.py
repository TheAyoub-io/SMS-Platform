import time
import sys
from app.core.celery_app import celery_app

def check_workers():
    """
    Checks if there are any active Celery workers.
    """
    try:
        inspector = celery_app.control.inspect(timeout=1)
        active_workers = inspector.ping()

        if not active_workers:
            print("ALERT: No active Celery workers found!", file=sys.stderr)
            return False

        print(f"OK: Found {len(active_workers)} active worker(s): {list(active_workers.keys())}")
        return True

    except Exception as e:
        print(f"CRITICAL: Could not connect to Celery broker. Error: {e}", file=sys.stderr)
        return False

def main():
    """
    Main monitoring loop.
    In a real system, this might be run by a system like cron or systemd.
    For this example, it runs a check once.
    """
    print("Running Celery worker health check...")
    is_healthy = check_workers()

    if is_healthy:
        print("Health check passed.")
        sys.exit(0)
    else:
        print("Health check failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
