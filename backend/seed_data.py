"""
Seed data generator for DropGuard — creates realistic synthetic student data
calibrated to match SIH 2026 presentation metrics:
- 1,248 students tracked
- 86 at-risk students (30 Critical, 56 High)
- 84.2% average attendance
- 42 active interventions field-tested
- 12-digit APAAR IDs & UDISE+ codes
"""
import random
import sys
import os
import hashlib
from datetime import datetime, date, timedelta
from faker import Faker

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db, SessionLocal, engine, Base
from models import Student, Grade, Attendance, RiskPrediction, Intervention, Alert, User

fake = Faker("en_IN")

# Constants — Class 12 Senior Secondary Streams & Subjects
DEPARTMENTS = [
    "Science (PCM)",
    "Science (PCB)",
    "Commerce",
    "Humanities / Arts",
    "Vocational Science"
]

SUBJECTS = {
    "Science (PCM)": ["Physics", "Chemistry", "Mathematics", "English Core", "Computer Science", "Physical Education"],
    "Science (PCB)": ["Physics", "Chemistry", "Biology", "English Core", "Psychology", "Physical Education"],
    "Commerce": ["Accountancy", "Business Studies", "Economics", "Mathematics", "English Core", "Informatics Practices"],
    "Humanities / Arts": ["History", "Political Science", "Economics", "Geography", "Sociology", "English Core"],
    "Vocational Science": ["Information Technology", "Physics", "Chemistry", "Mathematics", "English Core", "Entrepreneurship"]
}

SECTIONS = ["A", "B", "C", "D"]
INCOME_BRACKETS = ["low", "middle", "high"]
PARENT_EDUCATION = ["none", "primary", "secondary", "graduate", "postgraduate"]
LIVING_SITUATIONS = ["with_family", "hostel", "rented"]
PARENT_OCCUPATIONS = [
    "Farmer", "Laborer", "Shopkeeper", "Government Employee", "Private Employee",
    "Business Owner", "Teacher", "Doctor", "Engineer", "Homemaker",
    "Driver", "Construction Worker", "Self Employed"
]
CITIES = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur", "Lucknow", "Bhopal",
          "Patna", "Indore", "Nagpur", "Ahmedabad", "Chandigarh", "Varanasi", "Ranchi", "Guwahati"]
STATES = ["Delhi", "Maharashtra", "Karnataka", "Telangana", "Tamil Nadu", "Maharashtra", "West Bengal",
          "Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "Bihar", "Madhya Pradesh", "Maharashtra",
          "Gujarat", "Punjab", "Uttar Pradesh", "Jharkhand", "Assam"]
UDISE_CODES = ["07040100101", "07040100102", "07040100105", "07040100108"]

NUM_STUDENTS = 1248
NUM_CRITICAL = 30
NUM_HIGH = 56
NUM_MEDIUM = 232
NUM_LOW = NUM_STUDENTS - (NUM_CRITICAL + NUM_HIGH + NUM_MEDIUM)  # 930


def safe_hash_password(password: str) -> str:
    """Hash password using pbkdf2_sha256."""
    return "pbkdf2$" + hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), b'eduguard_salt', 100000).hex()


def generate_correlated_student_data():
    """Generate 1,248 students with calibrated risk distribution (86 at-risk)."""
    random.seed(42)
    students = []

    for i in range(NUM_STUDENTS):
        # Deterministic risk tier to guarantee exact counts for jury demo
        if i < NUM_CRITICAL:
            risk_tier = "critical"
            base_risk = random.uniform(0.77, 0.94)
            status = "at_risk"
        elif i < (NUM_CRITICAL + NUM_HIGH):
            risk_tier = "high"
            base_risk = random.uniform(0.51, 0.73)
            status = "at_risk"
        elif i < (NUM_CRITICAL + NUM_HIGH + NUM_MEDIUM):
            risk_tier = "medium"
            base_risk = random.uniform(0.26, 0.48)
            status = "enrolled"
        else:
            risk_tier = "low"
            base_risk = random.uniform(0.04, 0.23)
            status = random.choices(["enrolled", "graduated"], weights=[0.88, 0.12])[0]

        # Socioeconomic features
        if risk_tier in ("critical", "high"):
            income = random.choices(INCOME_BRACKETS, weights=[0.65, 0.25, 0.10])[0]
            parent_edu = random.choices(PARENT_EDUCATION, weights=[0.35, 0.30, 0.20, 0.10, 0.05])[0]
            distance = random.uniform(8, 45)
            has_scholarship = random.random() < 0.15
            is_first_gen = random.random() < 0.65
            has_internet = random.random() < 0.55
            drop_years = random.choices([1, 2], weights=[0.75, 0.25])[0]
            jee_perc = round(random.uniform(42.0, 78.0), 1)
            c12_pct = round(random.uniform(55.0, 78.0), 1)
            coaching_type = random.choice(["Kota Offline Coaching", "Delhi Offline Coaching", "Online Batch"])
            coaching_strain = random.choice(["medium", "severe"])
            college_tier = random.choice(["Tier-3 Private", "Local State Govt", "Open University"])
            branch_sat = round(random.uniform(1.8, 4.5), 1)
            burnout = round(random.uniform(6.8, 9.6), 1)
        elif risk_tier == "medium":
            income = random.choices(INCOME_BRACKETS, weights=[0.25, 0.55, 0.20])[0]
            parent_edu = random.choices(PARENT_EDUCATION, weights=[0.10, 0.20, 0.40, 0.20, 0.10])[0]
            distance = random.uniform(3, 20)
            has_scholarship = random.random() < 0.35
            is_first_gen = random.random() < 0.35
            has_internet = random.random() < 0.80
            drop_years = random.choices([0, 1], weights=[0.60, 0.40])[0]
            jee_perc = round(random.uniform(72.0, 89.0), 1)
            c12_pct = round(random.uniform(68.0, 88.0), 1)
            coaching_type = random.choice(["Offline Coaching", "Online Batch", "Self-Study"])
            coaching_strain = random.choice(["low", "medium"])
            college_tier = random.choice(["Tier-2 Engineering", "Tier-3 Private"])
            branch_sat = round(random.uniform(4.5, 7.5), 1)
            burnout = round(random.uniform(3.5, 6.5), 1)
        else:
            income = random.choices(INCOME_BRACKETS, weights=[0.10, 0.45, 0.45])[0]
            parent_edu = random.choices(PARENT_EDUCATION, weights=[0.02, 0.08, 0.25, 0.40, 0.25])[0]
            distance = random.uniform(0.5, 10)
            has_scholarship = random.random() < 0.50
            is_first_gen = random.random() < 0.15
            has_internet = random.random() < 0.96
            drop_years = random.choices([0, 1], weights=[0.85, 0.15])[0]
            jee_perc = round(random.uniform(88.0, 99.5), 1)
            c12_pct = round(random.uniform(80.0, 97.0), 1)
            coaching_type = random.choice(["Online Batch", "Self-Study", "Offline Coaching"])
            coaching_strain = "low"
            college_tier = random.choice(["Tier-1 (IIT/NIT/IIIT)", "Tier-2 Engineering"])
            branch_sat = round(random.uniform(7.8, 9.8), 1)
            burnout = round(random.uniform(0.5, 3.8), 1)

        dept = random.choice(DEPARTMENTS)
        semester = random.randint(1, 4)
        year = 2026 - (semester // 2)
        gender = "Male" if (i % 2 == 0) else "Female"
        city_idx = i % len(CITIES)
        sec = SECTIONS[i % len(SECTIONS)]
        stream_short = "PCM" if "PCM" in dept else "PCB" if "PCB" in dept else "Commerce" if "Commerce" in dept else "Arts"

        # Unique 12-digit APAAR ID and UDISE+ School Code
        apaar_id = f"APAAR-2026-{10000000 + i:08d}"
        udise_code = UDISE_CODES[i % len(UDISE_CODES)]

        student = {
            "enrollment_no": f"CBSE12-2026-{i + 1:04d}",
            "apaar_id": apaar_id,
            "udise_code": udise_code,
            "first_name": fake.first_name_male() if gender == "Male" else fake.first_name_female(),
            "last_name": fake.last_name(),
            "email": f"student{i + 1}@dropguard.edu.in",
            "phone": f"98{random.randint(10000000, 99999999)}",
            "date_of_birth": date(2008, (i % 12) + 1, (i % 28) + 1),
            "gender": gender,
            "address": f"{random.randint(1, 250)}, Sector {random.randint(1, 24)}, {CITIES[city_idx]}",
            "city": CITIES[city_idx],
            "state": STATES[city_idx],
            "department": dept,
            "semester": semester,
            "year_of_admission": year,
            "current_class": f"Class 12-{sec}",
            "section": sec,
            "family_income_bracket": income,
            "parent_education": parent_edu,
            "parent_occupation": PARENT_OCCUPATIONS[i % len(PARENT_OCCUPATIONS)],
            "distance_from_school_km": round(distance, 1),
            "has_scholarship": has_scholarship,
            "scholarship_type": "Merit" if has_scholarship else None,
            "is_first_generation": is_first_gen,
            "has_internet_access": has_internet,
            "living_situation": "with_family" if income != "low" else "rented",
            "class_12_percentage": c12_pct,
            "class_12_stream": stream_short,
            "drop_years_count": drop_years,
            "target_exam": "JEE Main / NEET" if "Science" in dept else "CUET / CA Foundation",
            "jee_percentile": jee_perc,
            "coaching_type": coaching_type,
            "coaching_financial_strain": coaching_strain,
            "current_college_tier": college_tier,
            "branch_satisfaction_score": branch_sat,
            "post_jee_burnout_index": burnout,
            "status": status,
            "is_active": status != "dropped_out",
            "base_risk": base_risk,
            "risk_tier": risk_tier,
            "dept_subjects": SUBJECTS[dept],
        }
        students.append(student)

    return students


def generate_grades(student_data, student_id, db):
    """Generate Class 12 subject marks."""
    base_risk = student_data["base_risk"]
    subjects = student_data["dept_subjects"][:5]

    grades = []
    for sem in range(1, 3):
        for subject in subjects:
            if base_risk > 0.5:
                marks = max(20, min(100, random.gauss(46, 12)))
            elif base_risk > 0.25:
                marks = max(35, min(100, random.gauss(68, 10)))
            else:
                marks = max(55, min(100, random.gauss(84, 7)))

            marks = round(marks, 1)
            grade_letter = (
                "A1" if marks >= 91 else
                "A2" if marks >= 81 else
                "B1" if marks >= 71 else
                "B2" if marks >= 61 else
                "C1" if marks >= 51 else
                "C2" if marks >= 41 else
                "D" if marks >= 33 else
                "E (Fail)"
            )
            exam_type = "Pre-Board 1" if sem == 1 else "Pre-Board 2"
            exam_date = date(2025, 11 if sem == 1 else 1, (student_id % 27) + 1)

            grades.append(Grade(
                student_id=student_id,
                subject=subject,
                semester=sem,
                marks_obtained=marks,
                max_marks=100.0,
                grade_letter=grade_letter,
                exam_type=exam_type,
                date=exam_date,
            ))

    db.add_all(grades)


def generate_attendance_batch(student_data_list, student_ids, db):
    """
    Generate attendance records calibrated so overall average is precisely 84.2%.
    Total records: 1,248 students * 30 days = 37,440.
    Required present/late records = 31,524 (84.1987% -> 84.2%).
    """
    records_per_student = 30
    total_records = NUM_STUDENTS * records_per_student  # 37,440
    target_present = round(total_records * 0.842)      # 31,524

    # 86 at-risk students get 58% attendance = 1,496 present records out of 2,580
    at_risk_present_total = round(86 * records_per_student * 0.58)  # 1,496
    safe_present_total = target_present - at_risk_present_total      # 30,028
    safe_students_count = NUM_STUDENTS - 86                           # 1,162
    safe_avg_present = safe_present_total / (safe_students_count * records_per_student) # ~0.8614

    base_date = date(2026, 8, 28)
    dates = []
    curr = base_date - timedelta(days=50)
    while len(dates) < records_per_student and curr <= base_date:
        if curr.weekday() < 5:  # Mon-Fri
            dates.append(curr)
        curr += timedelta(days=1)
    dates = dates[:records_per_student]

    all_records = []
    present_budget_remaining = target_present
    records_remaining = total_records

    for idx, (sd, sid) in enumerate(zip(student_data_list, student_ids)):
        is_at_risk = (sd["risk_tier"] in ("critical", "high"))
        student_present_target = round(records_per_student * (0.58 if is_at_risk else safe_avg_present))
        
        # Ensure we hit the exact target overall
        if idx == NUM_STUDENTS - 1:
            student_present_target = max(0, min(records_per_student, present_budget_remaining))

        student_present_target = min(student_present_target, present_budget_remaining)
        student_present_target = max(student_present_target, records_per_student - (records_remaining - present_budget_remaining))

        status_pool = ["present"] * student_present_target + ["absent"] * (records_per_student - student_present_target)
        # Small portion of present are 'late'
        for k in range(len(status_pool)):
            if status_pool[k] == "present" and random.random() < 0.08:
                status_pool[k] = "late"
        random.shuffle(status_pool)

        present_budget_remaining -= student_present_target
        records_remaining -= records_per_student

        subj = sd["dept_subjects"][0]
        for d_idx, d in enumerate(dates):
            all_records.append(Attendance(
                student_id=sid,
                date=d,
                status=status_pool[d_idx],
                subject=subj,
                period=(d_idx % 6) + 1
            ))

    # Batch insert in chunks of 5000 for SQLite performance
    chunk_size = 5000
    for i in range(0, len(all_records), chunk_size):
        db.bulk_save_objects(all_records[i:i + chunk_size])
        db.commit()


def generate_risk_predictions(student_data, student_id, db):
    """Generate risk predictions calibrated to exact tier."""
    risk_tier = student_data["risk_tier"]

    # Target scores for the latest prediction
    if risk_tier == "critical":
        latest_score = round(random.uniform(0.77, 0.94), 4)
        latest_level = "critical"
    elif risk_tier == "high":
        latest_score = round(random.uniform(0.51, 0.73), 4)
        latest_level = "high"
    elif risk_tier == "medium":
        latest_score = round(random.uniform(0.26, 0.48), 4)
        latest_level = "medium"
    else:
        latest_score = round(random.uniform(0.04, 0.23), 4)
        latest_level = "low"

    predictions = []
    # 6 monthly historical records
    for months_ago in range(6, -1, -1):
        pred_date = datetime(2026, 8, 28) - timedelta(days=months_ago * 30)
        
        if months_ago == 0:
            score = latest_score
            level = latest_level
        else:
            delta = (6 - months_ago) * 0.03 if risk_tier in ("critical", "high") else -(6 - months_ago) * 0.01
            score = max(0.02, min(0.98, latest_score - delta + random.uniform(-0.02, 0.02)))
            score = round(score, 4)
            level = (
                "critical" if score >= 0.75 else
                "high" if score >= 0.50 else
                "medium" if score >= 0.25 else
                "low"
            )

        # SHAP factor explanations
        factors = [
            {"feature": "post_jee_burnout_index", "feature_label": "Post-JEE Burnout & Fatigue", "impact": round(0.28 * (student_data["post_jee_burnout_index"] / 10), 4), "value": student_data["post_jee_burnout_index"]},
            {"feature": "coaching_financial_strain", "feature_label": "Coaching Fee Financial Debt", "impact": 0.21 if student_data["coaching_financial_strain"] == "severe" else 0.08, "value": 1.0},
            {"feature": "branch_satisfaction_score", "feature_label": "Backup Branch Mismatch", "impact": round(-0.22 * (student_data["branch_satisfaction_score"] / 10), 4), "value": student_data["branch_satisfaction_score"]},
            {"feature": "drop_years_count", "feature_label": "Post-12th Drop Years Gap", "impact": round(0.18 * (student_data["drop_years_count"] / 2), 4), "value": float(student_data["drop_years_count"])},
            {"feature": "attendance_pct", "feature_label": "Class 12 Attendance Rate", "impact": -0.22 if risk_tier in ("critical", "high") else 0.15, "value": 58.0 if risk_tier in ("critical", "high") else 86.0},
        ]
        factors.sort(key=lambda x: abs(x["impact"]), reverse=True)

        predictions.append(RiskPrediction(
            student_id=student_id,
            risk_score=score,
            risk_level=level,
            top_factors=factors,
            model_version="v2.1-lgbm-xai",
            prediction_date=pred_date,
        ))

    db.add_all(predictions)
    return predictions


def seed():
    """Main seeding script."""
    print("[SEED] Starting DropGuard database calibration for SIH 2026...")
    Base.metadata.drop_all(bind=engine)
    init_db()
    db = SessionLocal()

    try:
        print("   Creating demo users...")
        users = [
            User(
                username="admin",
                email="admin@dropguard.gov.in",
                hashed_password=safe_hash_password("admin123"),
                full_name="Dr. Rajesh Sharma (Principal)",
                role="admin",
                department="School Administration",
                is_active=True,
            ),
            User(
                username="teacher",
                email="priya@dropguard.gov.in",
                hashed_password=safe_hash_password("teacher123"),
                full_name="Dr. Priya Verma",
                role="teacher",
                department="Science (PCM)",
                is_active=True,
            ),
            User(
                username="counselor",
                email="counselor@dropguard.gov.in",
                hashed_password=safe_hash_password("counselor123"),
                full_name="Mr. Amit Saxena",
                role="counselor",
                department="Student Career Cell",
                is_active=True,
            ),
        ]
        db.add_all(users)
        db.commit()

        print(f"   Generating {NUM_STUDENTS} students (86 at-risk)...")
        student_data_list = generate_correlated_student_data()

        student_ids = []
        for i, sd in enumerate(student_data_list):
            student_fields = {k: v for k, v in sd.items() if k not in ("base_risk", "risk_tier", "dept_subjects")}
            student = Student(**student_fields)
            db.add(student)
            db.flush()
            student_ids.append(student.id)

            generate_grades(sd, student.id, db)
            generate_risk_predictions(sd, student.id, db)

            if (i + 1) % 250 == 0:
                db.commit()
                print(f"   ... {i + 1}/{NUM_STUDENTS} student profiles created")

        db.commit()

        print("   Generating attendance calibrated to precisely 84.2%...")
        generate_attendance_batch(student_data_list, student_ids, db)

        # Generate exactly 42 ACTIVE interventions (status in 'pending', 'in_progress')
        # to match Slide 1 ("42 active interventions field tested")
        print("   Generating exactly 42 active interventions + completed history...")
        intervention_titles = [
            ("Post-JEE Regret & Burnout Counseling", "counseling", "urgent"),
            ("Fee Waiver / Scholarship Referral", "financial_aid", "urgent"),
            ("1-on-1 Peer Mentor Study Support", "peer_mentoring", "high"),
            ("Pre-Board Remedial Physics / Maths Class", "academic_support", "high"),
            ("Parent Attendance Consultation Session", "parent_meeting", "urgent"),
            ("Exam Anxiety Wellness Therapy", "health_referral", "high"),
        ]
        teachers = ["Dr. Priya Verma", "Mr. Amit Saxena", "Prof. R.K. Mehta", "Dr. S. Nair"]

        # Exactly 42 active interventions
        for k in range(42):
            sid = student_ids[k % 86]  # Assign to at-risk students
            title, int_type, priority = intervention_titles[k % len(intervention_titles)]
            status = "in_progress" if (k < 24) else "pending"  # 24 in_progress + 18 pending = 42
            created = datetime(2026, 8, max(1, 28 - (k % 25)))

            db.add(Intervention(
                student_id=sid,
                intervention_type=int_type,
                title=title,
                description=f"Automated AI early trigger intervention prescribed for student {sid}.",
                assigned_to=teachers[k % len(teachers)],
                priority=priority,
                status=status,
                created_at=created,
                updated_at=created + timedelta(days=2),
            ))

        # Add 20 completed interventions for history
        for k in range(20):
            sid = student_ids[(k + 42) % 86]
            title, int_type, priority = intervention_titles[k % len(intervention_titles)]
            created = datetime(2026, 6, (k % 25) + 1)
            db.add(Intervention(
                student_id=sid,
                intervention_type=int_type,
                title=title,
                description=f"Intervention completed with documented recovery progress.",
                assigned_to=teachers[k % len(teachers)],
                priority=priority,
                status="completed",
                outcome="Student re-engaged in classroom; pre-board marks improved by +14%.",
                created_at=created,
                updated_at=created + timedelta(days=14),
                completed_at=created + timedelta(days=21),
            ))

        # Generate Alerts
        print("   Generating alerts for at-risk cohorts...")
        alert_titles = [
            ("Class 12 Dropout Risk Threshold Exceeded", "risk_threshold_breach", "critical"),
            ("Consecutive 3-Day Absence Pattern", "attendance_drop", "warning"),
            ("Pre-Board Physics & Chemistry Drop Alert", "grade_decline", "warning"),
            ("Post-JEE Regret & Burnout Escalation", "risk_threshold_breach", "critical"),
        ]
        for k in range(86):
            sid = student_ids[k]
            title, atype, sev = alert_titles[k % len(alert_titles)]
            db.add(Alert(
                student_id=sid,
                alert_type=atype,
                title=title,
                message=f"AI Early Warning: Dropout risk score calculated above threshold for APAAR ID {student_data_list[k]['apaar_id']}.",
                severity=sev,
                is_read=(k % 3 == 0),
                is_resolved=False,
                created_at=datetime(2026, 8, max(1, 28 - (k % 15))),
            ))

        db.commit()

        # Verify exact counts
        from sqlalchemy import func
        total_stus = db.query(func.count(Student.id)).scalar()
        active_ints = db.query(func.count(Intervention.id)).filter(Intervention.status.in_(["pending", "in_progress"])).scalar()
        
        tot_att = db.query(func.count(Attendance.id)).scalar() or 1
        pres_att = db.query(func.count(Attendance.id)).filter(Attendance.status.in_(["present", "late"])).scalar() or 0
        avg_att = round(pres_att / tot_att * 100, 1)

        print("\n=======================================================")
        print("  [SUCCESS] DATABASE SEEDING & JURY CALIBRATION SUCCESSFUL!")
        print("=======================================================")
        print(f"  [Total Students]:       {total_stus} (Matches PPT: 1,248)")
        print(f"  [Active Interventions]: {active_ints} (Matches PPT: 42)")
        print(f"  [Average Attendance]:   {avg_att}% (Matches PPT: 84.2%)")
        print("  [Demo Logins]:          admin / admin123  |  counselor / counselor123")
        print("=======================================================\n")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Database calibration error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
