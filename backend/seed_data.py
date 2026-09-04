"""
Seed data generator for EduGuard — creates realistic synthetic student data
with correlated features that model real-world dropout patterns.
"""
import random
import sys
import os
from datetime import datetime, date, timedelta
from faker import Faker

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db, SessionLocal
from models import Student, Grade, Attendance, RiskPrediction, Intervention, Alert, User
from passlib.context import CryptContext

fake = Faker("en_IN")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
SECTIONS = ["A", "B", "C"]
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

NUM_STUDENTS = 250


def generate_correlated_student_data():
    """Generate student data with realistic correlations between features and dropout risk."""
    students = []

    for i in range(NUM_STUDENTS):
        # Base risk factor (hidden) — determines how other features correlate
        # Higher base_risk = more likely to have poor attendance, grades, etc.
        base_risk = random.random()

        # Socioeconomic factors (correlated with risk)
        if base_risk > 0.7:
            income = random.choices(INCOME_BRACKETS, weights=[0.6, 0.3, 0.1])[0]
            parent_edu = random.choices(PARENT_EDUCATION, weights=[0.3, 0.3, 0.25, 0.1, 0.05])[0]
            distance = random.uniform(5, 50)
            has_scholarship = random.random() < 0.15
            is_first_gen = random.random() < 0.6
            has_internet = random.random() < 0.5
        elif base_risk > 0.4:
            income = random.choices(INCOME_BRACKETS, weights=[0.3, 0.5, 0.2])[0]
            parent_edu = random.choices(PARENT_EDUCATION, weights=[0.1, 0.2, 0.35, 0.25, 0.1])[0]
            distance = random.uniform(2, 25)
            has_scholarship = random.random() < 0.3
            is_first_gen = random.random() < 0.35
            has_internet = random.random() < 0.75
        else:
            income = random.choices(INCOME_BRACKETS, weights=[0.1, 0.4, 0.5])[0]
            parent_edu = random.choices(PARENT_EDUCATION, weights=[0.02, 0.08, 0.2, 0.4, 0.3])[0]
            distance = random.uniform(0.5, 10)
            has_scholarship = random.random() < 0.5
            is_first_gen = random.random() < 0.15
            has_internet = random.random() < 0.95

        dept = random.choice(DEPARTMENTS)
        semester = random.randint(1, 8)
        year = 2026 - (semester // 2)
        gender = random.choice(["Male", "Female"])
        city_idx = random.randint(0, len(CITIES) - 1)

        # Determine dropout status based on risk
        if base_risk > 0.8:
            status = random.choices(["dropped_out", "at_risk", "enrolled"], weights=[0.3, 0.5, 0.2])[0]
        elif base_risk > 0.5:
            status = random.choices(["dropped_out", "at_risk", "enrolled"], weights=[0.05, 0.35, 0.6])[0]
        else:
            status = random.choices(["enrolled", "graduated", "at_risk"], weights=[0.65, 0.25, 0.1])[0]

        living = random.choices(LIVING_SITUATIONS,
                                weights=[0.4, 0.35, 0.25] if income != "low" else [0.6, 0.15, 0.25])[0]

        # Class 12 & Competitive Exam (JEE) Drop-Year Factors
        if base_risk > 0.6:  # High risk droppers
            drop_years = random.choices([1, 2], weights=[0.7, 0.3])[0]
            jee_perc = round(random.uniform(35.0, 82.0), 1)  # Missed NIT/IIT cutoff after drop
            c12_pct = round(random.uniform(55.0, 85.0), 1)
            coaching_type = random.choice(["Kota Offline Coaching", "Delhi Offline Coaching", "Online Batch (PW/Unacademy)"])
            coaching_strain = random.choice(["medium", "severe"])
            college_tier = random.choice(["Tier-3 Private", "Local State Govt", "Open University"])
            branch_sat = round(random.uniform(1.5, 5.0), 1)  # Low satisfaction with non-IIT backup branch
            burnout = round(random.uniform(6.5, 9.8), 1)     # High post-JEE burnout & fatigue
        elif base_risk > 0.3:  # Moderate risk droppers
            drop_years = random.choices([0, 1], weights=[0.5, 0.5])[0]
            jee_perc = round(random.uniform(72.0, 92.0), 1)
            c12_pct = round(random.uniform(68.0, 90.0), 1)
            coaching_type = random.choice(["Offline Coaching", "Online Batch", "Self-Study"])
            coaching_strain = random.choice(["low", "medium"])
            college_tier = random.choice(["Tier-2 Engineering", "Tier-3 Private", "Local State Govt"])
            branch_sat = round(random.uniform(4.5, 8.0), 1)
            burnout = round(random.uniform(3.5, 7.0), 1)
        else:  # Low risk droppers / high achievers
            drop_years = random.choices([0, 1], weights=[0.8, 0.2])[0]
            jee_perc = round(random.uniform(88.0, 99.2), 1)
            c12_pct = round(random.uniform(78.0, 96.0), 1)
            coaching_type = random.choice(["Online Batch", "Self-Study", "Offline Coaching"])
            coaching_strain = "low"
            college_tier = random.choice(["Tier-1 (IIT/NIT/IIIT)", "Tier-2 Engineering"])
            branch_sat = round(random.uniform(7.5, 9.8), 1)
            burnout = round(random.uniform(0.5, 4.0), 1)

        stream_short = "PCM" if "PCM" in dept else "PCB" if "PCB" in dept else "Commerce" if "Commerce" in dept else "Arts"
        sec = random.choice(["A", "B", "C", "D"])

        student = {
            "enrollment_no": f"CBSE12-2026-{i + 1:04d}",
            "first_name": fake.first_name_male() if gender == "Male" else fake.first_name_female(),
            "last_name": fake.last_name(),
            "email": fake.email(),
            "phone": fake.phone_number()[:10],
            "date_of_birth": fake.date_of_birth(minimum_age=16, maximum_age=19),
            "gender": gender,
            "address": fake.address().replace("\n", ", "),
            "city": CITIES[city_idx],
            "state": STATES[city_idx],
            "department": dept,
            "semester": semester,
            "year_of_admission": year,
            "current_class": f"Class 12-{sec}",
            "section": sec,
            "family_income_bracket": income,
            "parent_education": parent_edu,
            "parent_occupation": random.choice(PARENT_OCCUPATIONS),
            "distance_from_school_km": round(distance, 1),
            "has_scholarship": has_scholarship,
            "scholarship_type": random.choice(["Merit", "Need-based", "Sports", "SC/ST", "OBC"]) if has_scholarship else None,
            "is_first_generation": is_first_gen,
            "has_internet_access": has_internet,
            "living_situation": living,
            # Class 12 & Competitive Exam (JEE/NEET) Drop-Year Risk Factors
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
            "base_risk": base_risk,  # Keep for grade/attendance generation
            "dept_subjects": SUBJECTS[dept],
        }
        students.append(student)

    return students


def generate_grades(student_data, student_id, db):
    """Generate Class 12 subject marks correlated with risk."""
    base_risk = student_data["base_risk"]
    subjects = student_data["dept_subjects"]
    semester = student_data["semester"]

    grades = []
    for sem in range(1, 3):
        # Select 5 subjects for Class 12
        sem_subjects = subjects[:5]
        for subject in sem_subjects:
            # Higher risk = lower marks (with noise)
            if base_risk > 0.7:
                marks = max(15, min(100, random.gauss(38, 12)))
            elif base_risk > 0.4:
                marks = max(25, min(100, random.gauss(62, 10)))
            else:
                marks = max(45, min(100, random.gauss(82, 8)))

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
            exam_date = date(2025, 11 if sem == 1 else 1, random.randint(1, 28))

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


def generate_attendance(student_data, student_id, db):
    """Generate attendance records correlated with risk."""
    base_risk = student_data["base_risk"]

    # Generate last 6 months of attendance
    today = date(2026, 8, 28)
    start_date = today - timedelta(days=180)
    current = start_date

    records = []
    while current <= today:
        # Skip weekends
        if current.weekday() >= 5:
            current += timedelta(days=1)
            continue

        # Determine attendance based on risk
        if base_risk > 0.7:
            status = random.choices(
                ["present", "absent", "late"],
                weights=[0.45, 0.40, 0.15]
            )[0]
        elif base_risk > 0.4:
            status = random.choices(
                ["present", "absent", "late"],
                weights=[0.70, 0.20, 0.10]
            )[0]
        else:
            status = random.choices(
                ["present", "absent", "late"],
                weights=[0.88, 0.07, 0.05]
            )[0]

        # Consecutive absence streaks for high-risk students
        if base_risk > 0.6 and random.random() < 0.15:
            for streak_day in range(random.randint(2, 5)):
                streak_date = current + timedelta(days=streak_day)
                if streak_date.weekday() < 5 and streak_date <= today:
                    records.append(Attendance(
                        student_id=student_id,
                        date=streak_date,
                        status="absent",
                        subject=random.choice(student_data["dept_subjects"]),
                        period=random.randint(1, 6),
                    ))
            current += timedelta(days=5)
            continue

        records.append(Attendance(
            student_id=student_id,
            date=current,
            status=status,
            subject=random.choice(student_data["dept_subjects"]),
            period=random.randint(1, 6),
        ))
        current += timedelta(days=1)

    db.add_all(records)


def generate_risk_predictions(student_data, student_id, db):
    """Generate historical risk predictions to show trends."""
    base_risk = student_data["base_risk"]

    predictions = []
    # Generate monthly predictions for last 6 months
    for months_ago in range(6, -1, -1):
        pred_date = datetime(2026, 8, 28) - timedelta(days=months_ago * 30)

        # Risk evolves over time (generally increasing for at-risk students)
        noise = random.uniform(-0.1, 0.1)
        time_factor = (6 - months_ago) * 0.02 if base_risk > 0.5 else -(6 - months_ago) * 0.01
        risk_score = max(0.0, min(1.0, base_risk + noise + time_factor))

        risk_level = (
            "critical" if risk_score >= 0.75 else
            "high" if risk_score >= 0.50 else
            "medium" if risk_score >= 0.25 else
            "low"
        )

        # Generate plausible SHAP-like factor explanations for drop-year non-IIT students
        factors = []
        feature_impacts = {
            "post_jee_burnout_index": ("Post-JEE Burnout & Fatigue", 0.28 * (student_data["post_jee_burnout_index"] / 10)),
            "coaching_financial_strain": ("Coaching Fee Financial Debt", 0.22 if student_data["coaching_financial_strain"] == "severe" else 0.10 if student_data["coaching_financial_strain"] == "medium" else -0.05),
            "branch_satisfaction_score": ("Backup Branch Mismatch", -0.24 * (student_data["branch_satisfaction_score"] / 10)),
            "drop_years_count": ("Post-12th Drop Years Gap", 0.18 * (student_data["drop_years_count"] / 2)),
            "jee_percentile": ("JEE Main Percentile Setback", -0.20 * (student_data["jee_percentile"] / 100)),
            "attendance_pct": ("College Attendance Rate", -0.25 * base_risk + random.uniform(-0.04, 0.04)),
            "avg_grade": ("College Academic Grade", -0.20 * base_risk + random.uniform(-0.04, 0.04)),
            "current_college_tier": ("Non-IIT Tier Disillusionment", 0.15 if "Tier-3" in student_data["current_college_tier"] else 0.05),
            "family_income": ("Family Income Bracket", -0.10 if student_data["family_income_bracket"] == "high" else 0.12 if student_data["family_income_bracket"] == "low" else 0),
        }

        for feature, (label, impact) in feature_impacts.items():
            if abs(impact) > 0.01:
                factors.append({
                    "feature": feature,
                    "feature_label": label,
                    "impact": round(impact, 4),
                    "value": round(float(student_data.get(feature, 5.0) if type(student_data.get(feature)) in (int, float) else 0), 1) if type(student_data.get(feature)) in (int, float) else None,
                })

        # Sort by absolute impact
        factors.sort(key=lambda x: abs(x["impact"]), reverse=True)

        predictions.append(RiskPrediction(
            student_id=student_id,
            risk_score=round(risk_score, 4),
            risk_level=risk_level,
            top_factors=factors[:7],
            model_version="v2.0-jee-dropyear",
            prediction_date=pred_date,
        ))

    db.add_all(predictions)
    return predictions


def generate_interventions(student_data, student_id, risk_level, db):
    """Generate tailored interventions for post-12th drop-year non-IIT high-risk students."""
    if risk_level not in ("high", "critical"):
        return

    intervention_templates = {
        "counseling": [
            ("Post-JEE Regret & Burnout Counseling", "1-on-1 session with student affairs counselor to process post-drop year exam grief and rebuild confidence."),
            ("Branch Realignment & Alternative Path Meeting", "Discuss career pivoting options beyond IIT/NIT and mapping current college branch to high-growth tech roles."),
        ],
        "academic_support": [
            ("Semester Adaptation Remedial Bootcamp", "Extra tutorial support for 1st-year core engineering math/physics to help gap-year students re-adapt to university pace."),
            ("Peer Study Circle Placement", "Connect with high-performing seniors who also transitioned successfully after a drop year."),
        ],
        "financial_aid": [
            ("Coaching Debt Relief Micro-Grant", "Assist student in applying for college emergency financial aid to offset drop-year coaching debt."),
            ("Skill-Bootcamp Scholarship Application", "Provide 100% sponsored access to industry certification courses (Cloud/Web Dev)."),
        ],
        "peer_mentoring": [
            ("Ex-JEE Aspirant Peer Mentor Network", "Pair student with a senior mentor who successfully built a 15+ LPA career from a non-IIT college."),
        ],
        "parent_meeting": [
            ("Parent Expectation Alignment Session", "Counsel family on reducing pressure regarding non-IIT admission and focusing on skill-based outcomes."),
        ],
        "health_referral": [
            ("Post-Exam Fatigue & Anxiety Assessment", "Refer student to campus wellness center for Kota/Coaching burnout recovery and stress management."),
        ],
    }

    num_interventions = random.randint(1, 3) if risk_level == "critical" else random.randint(0, 2)
    teachers = ["Dr. Sharma", "Prof. Patel", "Dr. Singh", "Prof. Kumar", "Dr. Gupta", "Prof. Reddy"]

    for _ in range(num_interventions):
        int_type = random.choice(list(intervention_templates.keys()))
        title, desc = random.choice(intervention_templates[int_type])

        status = random.choices(
            ["pending", "in_progress", "completed"],
            weights=[0.4, 0.35, 0.25]
        )[0]

        created = datetime(2026, random.randint(1, 8), random.randint(1, 28))

        db.add(Intervention(
            student_id=student_id,
            intervention_type=int_type,
            title=title,
            description=desc,
            assigned_to=random.choice(teachers),
            priority="urgent" if risk_level == "critical" else "high",
            status=status,
            outcome="Positive response observed" if status == "completed" else None,
            created_at=created,
            updated_at=created + timedelta(days=random.randint(0, 14)),
            completed_at=created + timedelta(days=random.randint(7, 30)) if status == "completed" else None,
        ))


def generate_alerts(student_data, student_id, risk_score, db):
    """Generate alerts for students exceeding thresholds."""
    if risk_score < 0.45:
        return

    alert_templates = [
        ("high_dropout_warning", "Critical Class 12 Dropout Warning",
         f"Student dropout risk score ({risk_score:.0%}) has reached a critical warning level.", "critical" if risk_score > 0.75 else "warning"),
        ("preboard_attendance_drop", "Pre-Board Attendance Drop",
         "Class 12 pre-board exam attendance has dropped below 65%.", "warning"),
        ("consecutive_absences", "3+ Consecutive Days Absent",
         "Student has been absent from Class 12 coaching/school for 3+ consecutive days.", "warning"),
        ("board_marks_decline", "Pre-Board Marks Decline",
         "Marks in Physics/Chemistry/Maths pre-board exams declined significantly.", "warning"),
        ("post_jee_burnout_alert", "Severe Post-Exam Burnout Alert",
         "High burnout index & study fatigue detected following entrance exams.", "critical" if risk_score > 0.75 else "warning"),
    ]

    num_alerts = random.randint(1, 3) if risk_score > 0.6 else 1
    selected = random.sample(alert_templates, min(num_alerts, len(alert_templates)))

    for alert_type, title, message, severity in selected:
        days_ago = random.randint(0, 30)
        db.add(Alert(
            student_id=student_id,
            alert_type=alert_type,
            title=title,
            message=message,
            severity=severity,
            is_read=random.random() < 0.3,
            is_resolved=random.random() < 0.15,
            created_at=datetime(2026, 8, 28) - timedelta(days=days_ago),
        ))


from database import init_db, SessionLocal, engine, Base
from models import Student, Grade, Attendance, RiskPrediction, Intervention, Alert, User
import hashlib

fake = Faker("en_IN")

def safe_hash_password(password: str) -> str:
    return "pbkdf2$" + hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), b'eduguard_salt', 100000).hex()


def seed():
    """Main seeding function."""
    print("[SEED] Starting database seeding...")
    Base.metadata.drop_all(bind=engine)
    init_db()
    db = SessionLocal()

    try:
        print("   Cleared and recreated database tables.")

        # Create demo users
        users = [
            User(
                username="admin",
                email="admin@eduguard.com",
                hashed_password=safe_hash_password("admin123"),
                full_name="Admin User",
                role="admin",
                department="Administration",
                is_active=True,
            ),
            User(
                username="teacher",
                email="teacher@eduguard.com",
                hashed_password=safe_hash_password("teacher123"),
                full_name="Dr. Priya Sharma",
                role="teacher",
                department="Computer Science",
                is_active=True,
            ),
            User(
                username="counselor",
                email="counselor@eduguard.com",
                hashed_password=safe_hash_password("counselor123"),
                full_name="Mr. Rajesh Kumar",
                role="counselor",
                department="Student Affairs",
                is_active=True,
            ),
        ]
        db.add_all(users)
        db.commit()
        print(f"   [OK] Created {len(users)} demo users")

        # Generate students
        print(f"   Generating {NUM_STUDENTS} students with correlated data...")
        student_data_list = generate_correlated_student_data()

        for i, sd in enumerate(student_data_list):
            # Create student object (exclude helper fields)
            student_fields = {k: v for k, v in sd.items() if k not in ("base_risk", "dept_subjects")}
            student = Student(**student_fields)
            db.add(student)
            db.flush()  # Get ID

            # Generate related data
            generate_grades(sd, student.id, db)
            generate_attendance(sd, student.id, db)
            predictions = generate_risk_predictions(sd, student.id, db)

            # Use latest prediction for interventions/alerts
            latest_risk = predictions[-1].risk_score if predictions else 0
            latest_level = predictions[-1].risk_level if predictions else "low"

            generate_interventions(sd, student.id, latest_level, db)
            generate_alerts(sd, student.id, latest_risk, db)

            if (i + 1) % 50 == 0:
                db.commit()
                print(f"   ... {i + 1}/{NUM_STUDENTS} students created")

        db.commit()

        # Print summary
        total_students = db.query(Student).count()
        total_grades = db.query(Grade).count()
        total_attendance = db.query(Attendance).count()
        total_predictions = db.query(RiskPrediction).count()
        total_interventions = db.query(Intervention).count()
        total_alerts = db.query(Alert).count()

        print(f"\n[OK] Seeding complete!")
        print(f"   [Students]:     {total_students}")
        print(f"   [Grades]:       {total_grades}")
        print(f"   [Attendance]:   {total_attendance}")
        print(f"   [Predictions]:  {total_predictions}")
        print(f"   [Interventions]:{total_interventions}")
        print(f"   [Alerts]:       {total_alerts}")
        print(f"\n   Demo login: admin / admin123")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
