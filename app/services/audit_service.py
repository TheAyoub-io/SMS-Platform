from sqlalchemy.orm import Session
from app.db.models import ActivityLog, Agent

class AuditService:
    @staticmethod
    def log_activity(
        db: Session,
        user: Agent,
        action: str,
        table_affected: str = None,
        record_id: int = None,
    ):
        """
        Creates a new activity log entry.
        """
        log_entry = ActivityLog(
            user_id=user.id_agent,
            action=action,
            table_affected=table_affected,
            record_id=record_id,
            # In a real app, you would get the IP from the request
            # ip_address=request.client.host
        )
        db.add(log_entry)
        db.commit()

    @staticmethod
    def get_audit_logs(db: Session, skip: int = 0, limit: int = 100):
        """
        Retrieves a paginated list of audit logs.
        """
        return db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).offset(skip).limit(limit).all()
