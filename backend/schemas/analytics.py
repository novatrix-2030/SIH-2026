from pydantic import BaseModel
from typing import List, Dict, Optional


class DashboardStats(BaseModel):
    total_students: int
    at_risk_count: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    avg_attendance: float
    avg_grade: float
    active_interventions: int
    unread_alerts: int
    dropout_rate: float  # percentage
    risk_trend: str  # improving, stable, worsening


class RiskDistribution(BaseModel):
    low: int
    medium: int
    high: int
    critical: int


class TrendDataPoint(BaseModel):
    label: str  # month or date
    value: float


class TrendData(BaseModel):
    labels: List[str]
    risk_scores: List[float]
    attendance: List[float]
    grades: List[float]


class DepartmentRisk(BaseModel):
    department: str
    avg_risk: float
    student_count: int
    at_risk_count: int
