from sqlalchemy.orm import Session
from app.db.session import SessionLocal

def check_database_health():
    """
    Performs a simple query to check if the database is responsive.
    """
    db: Session = None
    try:
        db = SessionLocal()
        # A simple, fast query to check connectivity
        db.execute('SELECT 1')
        return {"status": "ok", "service": "database"}
    except Exception as e:
        return {"status": "error", "service": "database", "details": str(e)}
    finally:
        if db:
            db.close()

def check_redis_health():
    """
    Checks if the Redis server is responsive.
    Requires redis-py to be installed.
    """
    # Placeholder for Redis health check
    # You would use the redis-py library to ping the server
    return {"status": "ok", "service": "redis", "details": "Not implemented"}

def get_application_health():
    """
    Aggregates health checks from various services.
    """
    health_checks = [
        check_database_health(),
        check_redis_health(),
    ]

    overall_status = "ok"
    for check in health_checks:
        if check["status"] == "error":
            overall_status = "error"
            break

    return {"overall_status": overall_status, "checks": health_checks}
