from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class StudentCreate(BaseModel):
    enrollment_no: str
    apaar_id: Optional[str] = None
    udise_code: Optional[str] = "07040100101"
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    year_of_admission: Optional[int] = None
    current_class: Optional[str] = None
    section: Optional[str] = None
    family_income_bracket: Optional[str] = None
    parent_education: Optional[str] = None
    distance_from_school_km: Optional[float] = None
    has_scholarship: Optional[bool] = False
    is_first_generation: Optional[bool] = False
    has_internet_access: Optional[bool] = True
    class_12_percentage: Optional[float] = 75.0
    class_12_stream: Optional[str] = "PCM"
    drop_years_count: Optional[int] = 0
    target_exam: Optional[str] = "JEE Main"
    jee_percentile: Optional[float] = None
    coaching_type: Optional[str] = "Offline Coaching"
    coaching_financial_strain: Optional[str] = "low"
    current_college_tier: Optional[str] = "Tier-3 Private"
    branch_satisfaction_score: Optional[float] = 5.0
    post_jee_burnout_index: Optional[float] = 4.0


class StudentResponse(BaseModel):
    id: int
    enrollment_no: str
    apaar_id: Optional[str] = None
    udise_code: Optional[str] = None
    first_name: str
    last_name: str
    full_name: str = ""
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    year_of_admission: Optional[int] = None
    current_class: Optional[str] = None
    section: Optional[str] = None
    status: str = "enrolled"
    family_income_bracket: Optional[str] = None
    parent_education: Optional[str] = None
    distance_from_school_km: Optional[float] = None
    has_scholarship: Optional[bool] = False
    is_first_generation: Optional[bool] = False
    has_internet_access: Optional[bool] = True
    photo_url: Optional[str] = None

    # Class 12 & Competitive Exam (JEE) Drop-Year Risk Factors
    class_12_percentage: Optional[float] = 75.0
    class_12_stream: Optional[str] = "PCM"
    drop_years_count: Optional[int] = 0
    target_exam: Optional[str] = "JEE Main"
    jee_percentile: Optional[float] = None
    coaching_type: Optional[str] = "Offline Coaching"
    coaching_financial_strain: Optional[str] = "low"
    current_college_tier: Optional[str] = "Tier-3 Private"
    branch_satisfaction_score: Optional[float] = 5.0
    post_jee_burnout_index: Optional[float] = 4.0

    # Computed fields from relationships
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    attendance_pct: Optional[float] = None
    avg_grade: Optional[float] = None

    class Config:
        from_attributes = True


class StudentListResponse(BaseModel):
    students: List[StudentResponse]
    total: int
    page: int
    page_size: int
