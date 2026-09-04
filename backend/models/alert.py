from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)
    # Types: risk_threshold_breach, attendance_drop, grade_decline,
    #        payment_overdue, consecutive_absences, rapid_risk_increase
    title = Column(String(200), nullable=False)
    message = Column(Text)
    severity = Column(String(20), default="warning")  # info, warning, critical
    is_read = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)
    resolved_by = Column(String(100))

    student = relationship("Student", back_populates="alerts")
