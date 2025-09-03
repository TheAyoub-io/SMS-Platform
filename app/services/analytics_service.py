# This service will handle complex analytics and business intelligence queries.
from sqlalchemy.orm import Session

from sqlalchemy import func, case
from typing import List
from app.db.models import Campaign, Message

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_campaign_performance_comparison(self, campaign_ids: List[int]) -> dict:
        """
        Gathers and compares performance metrics for a list of campaigns.
        """
        if not campaign_ids:
            return {"comparison_data": []}

        # Query to get message counts and statuses for the given campaigns
        message_stats_query = (
            self.db.query(
                Message.id_campagne,
                func.count(Message.id_message).label("messages_sent"),
                func.sum(case((Message.statut_livraison == "delivered", 1), else_=0)).label("delivered_count"),
                # Placeholder for clicks, as we don't have this data yet
                func.sum(case((Message.statut_livraison == "clicked", 1), else_=0)).label("clicked_count"),
            )
            .filter(Message.id_campagne.in_(campaign_ids))
            .group_by(Message.id_campagne)
        )

        message_stats = {row.id_campagne: row for row in message_stats_query.all()}

        # Query to get campaign details
        campaigns = self.db.query(Campaign).filter(Campaign.id_campagne.in_(campaign_ids)).all()

        comparison_data = []
        for campaign in campaigns:
            stats = message_stats.get(campaign.id_campagne)

            if stats:
                messages_sent = stats.messages_sent
                delivery_rate = (stats.delivered_count / messages_sent) * 100 if messages_sent > 0 else 0
                click_through_rate = (stats.clicked_count / messages_sent) * 100 if messages_sent > 0 else 0
            else:
                messages_sent = 0
                delivery_rate = 0
                click_through_rate = 0

            # Placeholder for cost and ROI calculations
            cost = messages_sent * 0.05  # Example cost per message
            roi = (cost * 2.5) - cost # Example ROI calculation

            comparison_data.append({
                "campaign_id": campaign.id_campagne,
                "campaign_name": campaign.nom_campagne,
                "messages_sent": messages_sent,
                "delivery_rate": delivery_rate,
                "click_through_rate": click_through_rate,
                "cost": cost,
                "roi": roi,
            })

        return {"comparison_data": comparison_data}

    def get_delivery_timeline(self, campaign_id: int, interval: str = 'day') -> dict:
        """
        Calculates the delivery timeline for a campaign.
        Interval can be 'day' or 'hour'.
        """
        if interval == 'day':
            date_func = func.date(Message.date_envoi)
        elif interval == 'hour':
            # This is a simplification; for real applications, a more robust
            # timestamp truncation function would be used depending on the DB.
            date_func = func.strftime('%Y-%m-%d %H:00:00', Message.date_envoi)
        else:
            raise ValueError("Invalid interval specified. Use 'day' or 'hour'.")

        timeline_query = (
            self.db.query(
                date_func.label("timestamp"),
                func.sum(case((Message.statut_livraison == "delivered", 1), else_=0)).label("delivered_count"),
                func.sum(case((Message.statut_livraison == "failed", 1), else_=0)).label("failed_count"),
            )
            .filter(Message.id_campagne == campaign_id)
            .group_by("timestamp")
            .order_by("timestamp")
        )

        timeline_data = [
            {
                "timestamp": row.timestamp,
                "delivered_count": row.delivered_count,
                "failed_count": row.failed_count,
            }
            for row in timeline_query.all()
        ]

        return {"timeline": timeline_data}

    def get_segment_performance(self, campaign_id: int) -> dict:
        """
        Analyzes message performance across different contact segments for a campaign.
        """
        from app.db.models import Contact

        segment_query = (
            self.db.query(
                Contact.segment,
                func.count(Message.id_message).label("messages_sent"),
                func.sum(case((Message.statut_livraison == "delivered", 1), else_=0)).label("delivered_count"),
            )
            .join(Contact, Message.id_contact == Contact.id_contact)
            .filter(Message.id_campagne == campaign_id)
            .group_by(Contact.segment)
        )

        analysis_data = []
        for row in segment_query.all():
            if not row.segment:
                continue # Skip contacts with no segment

            messages_sent = row.messages_sent
            delivery_rate = (row.delivered_count / messages_sent) * 100 if messages_sent > 0 else 0

            analysis_data.append({
                "segment_name": row.segment,
                "messages_sent": messages_sent,
                "delivery_rate": delivery_rate,
            })

        return {"analysis": analysis_data}

    def get_cost_analysis(self, campaign_id: int) -> dict:
        """
        Calculates cost analysis for a specific campaign.
        """
        cost_query = (
            self.db.query(
                func.sum(Message.cost).label("total_cost"),
                func.count(Message.id_message).label("total_messages"),
                func.sum(case((Message.statut_livraison == "delivered", 1), else_=0)).label("delivered_count"),
            )
            .filter(Message.id_campagne == campaign_id)
        )

        result = cost_query.one()

        total_cost = result.total_cost or 0
        total_messages = result.total_messages or 0
        delivered_count = result.delivered_count or 0

        return {
            "total_cost": total_cost,
            "cost_per_message": total_cost / total_messages if total_messages > 0 else 0,
            "cost_per_delivered_message": total_cost / delivered_count if delivered_count > 0 else 0,
        }

    def get_contact_engagement_scores(self, campaign_id: int) -> dict:
        """
        Calculates engagement scores for contacts in a campaign.
        """
        from app.db.models import Contact

        engagement_query = (
            self.db.query(
                Message.id_contact,
                Contact.prenom,
                Contact.nom,
                func.sum(
                    case(
                        (Message.statut_livraison == "delivered", 2),
                        (Message.statut_livraison == "failed", -1),
                        else_=0
                    )
                ).label("engagement_score"),
            )
            .join(Contact, Message.id_contact == Contact.id_contact)
            .filter(Message.id_campagne == campaign_id)
            .group_by(Message.id_contact, Contact.prenom, Contact.nom)
            .order_by(func.sum(
                    case(
                        (Message.statut_livraison == "delivered", 2),
                        (Message.statut_livraison == "failed", -1),
                        else_=0
                    )
                ).desc())
        )

        report_data = [
            {
                "contact_id": row.id_contact,
                "contact_name": f"{row.prenom} {row.nom}",
                "engagement_score": row.engagement_score,
            }
            for row in engagement_query.all()
        ]

        return {"report": report_data}
