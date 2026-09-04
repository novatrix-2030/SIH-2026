from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    intervention_type = Column(String(50), nullable=False)
    # Types: counseling, academic_support, financial_aid, peer_mentoring,
    #        parent_meeting, schedule_adjustment, health_referral
    title = Column(String(200), nullable=False)
    description = Column(Text)
    assigned_to = Column(String(100))  # Teacher/counselor name
    priority = Column(String(20), default="medium")  # low, medium, high, urgent
    status = Column(String(20), default="pending")  # pending, in_progress, completed, cancelled
    outcome = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime)

    student = relationship("Student", back_populates="interventions")
