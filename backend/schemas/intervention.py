from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class InterventionCreate(BaseModel):
    student_id: int
    intervention_type: str
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: str = "medium"


class InterventionResponse(BaseModel):
    id: int
    student_id: int
    intervention_type: str
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: str
    status: str
    outcome: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
