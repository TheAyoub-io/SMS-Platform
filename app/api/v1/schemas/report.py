from pydantic import BaseModel, ConfigDict
from typing import Optional

class ReportBase(BaseModel):
    total_sent: int = 0
    total_delivered: int = 0
    total_failed: int = 0
    taux_ouverture: float = 0
    taux_clics: float = 0
    taux_conversion: float = 0
    nombre_desabonnements: int = 0
    total_cost: float = 0

class Report(ReportBase):
    id_rapport: int
    id_campagne: int

    model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_campaigns: int
    total_contacts: int
    total_sms_sent: int
    total_cost: float
