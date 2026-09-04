from sqlalchemy import Column, Integer, String, Float, Date, Boolean, Text
from sqlalchemy.orm import relationship
from database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    enrollment_no = Column(String(20), unique=True, index=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100))
    phone = Column(String(15))
    date_of_birth = Column(Date)
    gender = Column(String(10))  # Male, Female, Other
    address = Column(Text)
    city = Column(String(50))
    state = Column(String(50))

    # Academic info
    department = Column(String(100))
    semester = Column(Integer)
    year_of_admission = Column(Integer)
    current_class = Column(String(20))
    section = Column(String(5))

    # Socioeconomic factors
    family_income_bracket = Column(String(20))  # low, middle, high
    parent_education = Column(String(50))  # none, primary, secondary, graduate, postgraduate
    parent_occupation = Column(String(100))
    distance_from_school_km = Column(Float, default=0.0)
    has_scholarship = Column(Boolean, default=False)
    scholarship_type = Column(String(50))
    is_first_generation = Column(Boolean, default=False)
    has_internet_access = Column(Boolean, default=True)
    living_situation = Column(String(30))  # with_family, hostel, rented

    # Class 12 & Competitive Exam (JEE) Drop-Year Risk Factors
    class_12_percentage = Column(Float, default=75.0)
    class_12_stream = Column(String(30), default="PCM")
    drop_years_count = Column(Integer, default=0)  # 0, 1, 2 years drop
    target_exam = Column(String(50), default="JEE Main")  # JEE Main, JEE Advanced, NEET, State CET
    jee_percentile = Column(Float, nullable=True)  # e.g. 78.4
    coaching_type = Column(String(50), default="Offline Coaching")  # Kota/Offline Coaching, Online Batch, Self-Study
    coaching_financial_strain = Column(String(20), default="low")  # low, medium, severe
    current_college_tier = Column(String(30), default="Tier-3 Private")  # Tier-1 (IIT/NIT), Tier-2, Tier-3 Private, Local Govt, Open Univ
    branch_satisfaction_score = Column(Float, default=5.0)  # 0 to 10 scale
    post_jee_burnout_index = Column(Float, default=4.0)  # 0 to 10 scale

    # Status
    status = Column(String(20), default="enrolled")  # enrolled, graduated, dropped_out, at_risk
    is_active = Column(Boolean, default=True)

    # Photo URL (optional)
    photo_url = Column(String(255))

    # Relationships
    grades = relationship("Grade", back_populates="student", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    risk_predictions = relationship("RiskPrediction", back_populates="student", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="student", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="student", cascade="all, delete-orphan")

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
