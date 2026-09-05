"""Student CRUD router."""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from database import get_db
from models import Student, Grade, Attendance, RiskPrediction
from schemas.student import StudentResponse, StudentListResponse

router = APIRouter(prefix="/api/students", tags=["students"])


def compute_student_response(student: Student, db: Session) -> dict:
    """Build StudentResponse with computed fields."""
    # Latest risk prediction
    latest_risk = db.query(RiskPrediction).filter(
        RiskPrediction.student_id == student.id
    ).order_by(desc(RiskPrediction.prediction_date)).first()

    # Attendance percentage
    total_attendance = db.query(func.count(Attendance.id)).filter(
        Attendance.student_id == student.id
    ).scalar() or 0

    present_count = db.query(func.count(Attendance.id)).filter(
        Attendance.student_id == student.id,
        Attendance.status.in_(["present", "late"])
    ).scalar() or 0

    attendance_pct = (present_count / total_attendance * 100) if total_attendance > 0 else 0

    # Average grade
    avg_grade_result = db.query(func.avg(Grade.marks_obtained)).filter(
        Grade.student_id == student.id
    ).scalar()
    avg_grade = float(avg_grade_result) if avg_grade_result else 0

    return {
        "id": student.id,
        "enrollment_no": student.enrollment_no,
        "apaar_id": student.apaar_id,
        "udise_code": student.udise_code,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "full_name": f"{student.first_name} {student.last_name}",
        "email": student.email,
        "phone": student.phone,
        "gender": student.gender,
        "department": student.department,
        "semester": student.semester,
        "year_of_admission": student.year_of_admission,
        "current_class": student.current_class,
        "section": student.section,
        "status": student.status,
        "family_income_bracket": student.family_income_bracket,
        "parent_education": student.parent_education,
        "distance_from_school_km": student.distance_from_school_km,
        "has_scholarship": student.has_scholarship,
        "is_first_generation": student.is_first_generation,
        "has_internet_access": student.has_internet_access,
        "photo_url": student.photo_url,
        "risk_score": latest_risk.risk_score if latest_risk else None,
        "risk_level": latest_risk.risk_level if latest_risk else None,
        "attendance_pct": round(attendance_pct, 1),
        "avg_grade": round(avg_grade, 1),
    }


@router.get("/", response_model=StudentListResponse)
async def list_students(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    department: Optional[str] = None,
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: Optional[str] = "risk_score",
    sort_order: Optional[str] = "desc",
    db: Session = Depends(get_db),
):
    """List students with filtering, searching, and pagination."""
    query = db.query(Student)

    # Filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Student.first_name.ilike(search_term)) |
            (Student.last_name.ilike(search_term)) |
            (Student.enrollment_no.ilike(search_term)) |
            (Student.apaar_id.ilike(search_term)) |
            (Student.udise_code.ilike(search_term))
        )
    if department:
        query = query.filter(Student.department == department)
    if status:
        query = query.filter(Student.status == status)

    total = query.count()
    students = query.offset((page - 1) * page_size).limit(page_size).all()

    # Build response with computed fields
    student_responses = [compute_student_response(s, db) for s in students]

    # Filter by risk level (post-query since it's computed)
    if risk_level:
        student_responses = [s for s in student_responses if s.get("risk_level") == risk_level]
        total = len(student_responses)

    # Sort
    if sort_by == "risk_score":
        student_responses.sort(
            key=lambda x: x.get("risk_score") or 0,
            reverse=(sort_order == "desc")
        )
    elif sort_by == "attendance":
        student_responses.sort(
            key=lambda x: x.get("attendance_pct") or 0,
            reverse=(sort_order == "desc")
        )
    elif sort_by == "name":
        student_responses.sort(
            key=lambda x: x.get("full_name", ""),
            reverse=(sort_order == "desc")
        )

    return {
        "students": student_responses,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{student_id}")
async def get_student(student_id: int, db: Session = Depends(get_db)):
    """Get detailed student profile with all related data."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    base = compute_student_response(student, db)

    # Get all risk predictions (for timeline)
    risk_history = db.query(RiskPrediction).filter(
        RiskPrediction.student_id == student_id
    ).order_by(RiskPrediction.prediction_date).all()

    # Get recent grades
    grades = db.query(Grade).filter(
        Grade.student_id == student_id
    ).order_by(Grade.semester, Grade.date).all()

    # Get attendance summary by month
    attendance = db.query(Attendance).filter(
        Attendance.student_id == student_id
    ).order_by(Attendance.date).all()

    # Get interventions
    from models import Intervention
    interventions = db.query(Intervention).filter(
        Intervention.student_id == student_id
    ).order_by(desc(Intervention.created_at)).all()

    # Format grades
    grades_data = []
    for g in grades:
        grades_data.append({
            "subject": g.subject,
            "semester": g.semester,
            "marks": g.marks_obtained,
            "max_marks": g.max_marks,
            "grade": g.grade_letter,
            "exam_type": g.exam_type,
            "date": g.date.isoformat() if g.date else None,
        })

    # Format risk history
    risk_history_data = []
    for r in risk_history:
        risk_history_data.append({
            "risk_score": r.risk_score,
            "risk_level": r.risk_level,
            "top_factors": r.top_factors,
            "date": r.prediction_date.isoformat() if r.prediction_date else None,
        })

    # Format interventions
    interventions_data = []
    for i in interventions:
        interventions_data.append({
            "id": i.id,
            "type": i.intervention_type,
            "title": i.title,
            "description": i.description,
            "assigned_to": i.assigned_to,
            "priority": i.priority,
            "status": i.status,
            "outcome": i.outcome,
            "created_at": i.created_at.isoformat() if i.created_at else None,
        })

    # Attendance summary
    from collections import defaultdict
    monthly_attendance = defaultdict(lambda: {"present": 0, "absent": 0, "late": 0, "total": 0})
    for a in attendance:
        month_key = a.date.strftime("%Y-%m") if a.date else "unknown"
        monthly_attendance[month_key][a.status] += 1
        monthly_attendance[month_key]["total"] += 1

    attendance_summary = []
    for month, counts in sorted(monthly_attendance.items()):
        total = counts["total"]
        present = counts["present"] + counts.get("late", 0)
        attendance_summary.append({
            "month": month,
            "attendance_pct": round(present / total * 100, 1) if total > 0 else 0,
            "present": counts["present"],
            "absent": counts["absent"],
            "late": counts.get("late", 0),
            "total": total,
        })

    return {
        **base,
        "date_of_birth": student.date_of_birth.isoformat() if student.date_of_birth else None,
        "address": student.address,
        "city": student.city,
        "state": student.state,
        "parent_occupation": student.parent_occupation,
        "scholarship_type": student.scholarship_type,
        "living_situation": student.living_situation,
        "grades": grades_data,
        "risk_history": risk_history_data,
        "interventions": interventions_data,
        "attendance_summary": attendance_summary,
    }


@router.get("/departments/list")
async def get_departments(db: Session = Depends(get_db)):
    """Get list of all departments."""
    departments = db.query(Student.department).distinct().all()
    return [d[0] for d in departments if d[0]]


@router.post("/", response_model=dict)
async def create_student(student_data: dict, db: Session = Depends(get_db)):
    """Create a new Class 12 student and calculate initial ML risk prediction."""
    first_name = student_data.get("first_name", "New")
    last_name = student_data.get("last_name", "Student")
    dept = student_data.get("department", "Science (PCM)")
    sec = student_data.get("section", "A")
    c12_pct = float(student_data.get("class_12_percentage", 75.0))
    jee_perc = float(student_data.get("jee_percentile", 80.0)) if student_data.get("jee_percentile") else None
    burnout = float(student_data.get("post_jee_burnout_index", 4.0))

    count = db.query(func.count(Student.id)).scalar() or 0
    enrollment_no = f"CBSE12-2026-{count + 1:04d}"

    student = Student(
        enrollment_no=enrollment_no,
        first_name=first_name,
        last_name=last_name,
        email=student_data.get("email") or f"{first_name.lower()}.{last_name.lower()}@cbse.edu.in",
        phone=student_data.get("phone") or "9876543210",
        gender=student_data.get("gender", "Male"),
        department=dept,
        semester=1,
        year_of_admission=2026,
        current_class=f"Class 12-{sec}",
        section=sec,
        class_12_percentage=c12_pct,
        class_12_stream=dept.split(" ")[0],
        drop_years_count=int(student_data.get("drop_years_count", 0)),
        target_exam=student_data.get("target_exam", "JEE Main"),
        jee_percentile=jee_perc,
        coaching_type=student_data.get("coaching_type", "Online Batch (PW/Unacademy)"),
        coaching_financial_strain=student_data.get("coaching_financial_strain", "low"),
        current_college_tier=student_data.get("current_college_tier", "Tier-3 Private"),
        post_jee_burnout_index=burnout,
        status="enrolled",
    )

    db.add(student)
    db.commit()
    db.refresh(student)

    # Compute initial ML prediction
    try:
        from services.ml_service import predict_risk, extract_student_features
        features = extract_student_features(student, db)
        pred = predict_risk(features)

        if "error" not in pred:
            risk_pred = RiskPrediction(
                student_id=student.id,
                risk_score=pred["risk_score"],
                risk_level=pred["risk_level"],
                confidence=pred.get("confidence", 0.90),
                top_factors=pred.get("top_factors", []),
                shap_values=pred.get("shap_values"),
            )
            db.add(risk_pred)
            db.commit()
    except Exception as e:
        print(f"[WARN] Failed to compute initial prediction: {e}")

    return compute_student_response(student, db)
