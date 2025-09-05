import pytest
from app.db.models import Campaign
from datetime import datetime

class TestCampaignModel:
    @pytest.mark.parametrize(
        "status, expected",
        [
            ("draft", True),
            ("scheduled", False),
            ("active", False),
            ("completed", False),
            ("paused", False),
        ],
    )
    def test_can_be_modified(self, status, expected):
        """
        Tests that a campaign can only be modified if its status is 'draft'.
        """
        campaign = Campaign(
            nom_campagne="Test Campaign",
            date_debut=datetime.utcnow(),
            date_fin=datetime.utcnow(),
            statut=status,
            type_campagne="promotional",
            id_agent=1
        )
        assert campaign.can_be_modified() is expected
