from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum


class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    subject = Column(String(100), nullable=False)
    semester = Column(Integer, nullable=False)
    marks_obtained = Column(Float, nullable=False)
    max_marks = Column(Float, default=100.0)
    grade_letter = Column(String(5))
    exam_type = Column(String(20), default="final")  # midterm, final, assignment, quiz
    date = Column(Date)

    student = relationship("Student", back_populates="grades")

    @property
    def percentage(self):
        if self.max_marks > 0:
            return (self.marks_obtained / self.max_marks) * 100
        return 0.0


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    status = Column(String(10), default="present")  # present, absent, late, excused
    subject = Column(String(100))
    period = Column(Integer)  # 1-8

    student = relationship("Student", back_populates="attendance_records")
