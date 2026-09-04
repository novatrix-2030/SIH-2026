from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertResponse(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    alert_type: str
    title: str
    message: Optional[str] = None
    severity: str
    is_read: bool
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True
