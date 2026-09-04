from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    risk_score = Column(Float, nullable=False)  # 0.0 to 1.0
    risk_level = Column(String(20), nullable=False)  # low, medium, high, critical
    top_factors = Column(JSON)  # [{"feature": "attendance_pct", "impact": -0.3, "value": 45.0}, ...]
    model_version = Column(String(20), default="v1.0")
    prediction_date = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="risk_predictions")
