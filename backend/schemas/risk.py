from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class RiskFactor(BaseModel):
    feature: str
    feature_label: str  # Human-readable name
    impact: float  # SHAP value (positive = increases risk)
    value: Any  # Actual feature value


class RiskPredictionResponse(BaseModel):
    id: int
    student_id: int
    risk_score: float
    risk_level: str
    top_factors: List[RiskFactor]
    model_version: str
    prediction_date: datetime

    class Config:
        from_attributes = True


class RiskOverview(BaseModel):
    student_id: int
    student_name: str
    enrollment_no: str
    risk_score: float
    risk_level: str
    department: Optional[str] = None
    current_class: Optional[str] = None
    top_factor: Optional[str] = None
