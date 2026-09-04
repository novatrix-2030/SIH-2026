"""
ML Service — handles model loading, prediction, and SHAP explanations.
"""
import joblib
import numpy as np
import shap
from pathlib import Path
from typing import Dict, List, Any, Optional

ARTIFACTS_DIR = Path(__file__).parent.parent / "ml" / "artifacts"

# Global model cache
_model = None
_scaler = None
_feature_names = None
_feature_labels = None
_explainer = None


def load_model():
    """Load the trained model and scaler from artifacts."""
    global _model, _scaler, _feature_names, _feature_labels, _explainer

    model_path = ARTIFACTS_DIR / "model.joblib"
    if not model_path.exists():
        print("[WARN] No trained model found. Please run: python -m ml.train")
        return False

    _model = joblib.load(ARTIFACTS_DIR / "model.joblib")
    _scaler = joblib.load(ARTIFACTS_DIR / "scaler.joblib")
    _feature_names = joblib.load(ARTIFACTS_DIR / "feature_names.joblib")
    _feature_labels = joblib.load(ARTIFACTS_DIR / "feature_labels.joblib")

    # Initialize SHAP explainer
    _explainer = shap.TreeExplainer(_model)
    print("[OK] ML model loaded successfully")
    return True


def predict_risk(features: Dict[str, float]) -> Dict[str, Any]:
    """
    Predict dropout risk for a student.

    Args:
        features: Dict mapping feature names to values

    Returns:
        Dict with risk_score, risk_level, and top_factors (SHAP explanations)
    """
    if _model is None:
        load_model()

    if _model is None:
        return {"error": "Model not loaded"}

    # Build feature vector in correct order
    feature_vector = np.array([[features.get(f, 0.0) for f in _feature_names]])

    # Scale
    feature_scaled = _scaler.transform(feature_vector)

    # Predict probability
    risk_score = float(_model.predict_proba(feature_scaled)[0][1])

    # Determine risk level
    if risk_score >= 0.75:
        risk_level = "critical"
    elif risk_score >= 0.50:
        risk_level = "high"
    elif risk_score >= 0.25:
        risk_level = "medium"
    else:
        risk_level = "low"

    # SHAP explanation
    shap_values = _explainer.shap_values(feature_scaled)
    if isinstance(shap_values, list):
        shap_vals = shap_values[1][0]  # Class 1 (dropout) SHAP values
    else:
        shap_vals = shap_values[0]

    # Build factor explanations
    factors = []
    for i, fname in enumerate(_feature_names):
        impact = float(shap_vals[i])
        if abs(impact) > 0.005:  # Only include meaningful factors
            factors.append({
                "feature": fname,
                "feature_label": _feature_labels.get(fname, fname),
                "impact": round(impact, 4),
                "value": round(float(features.get(fname, 0)), 2),
            })

    # Sort by absolute impact (most influential first)
    factors.sort(key=lambda x: abs(x["impact"]), reverse=True)

    return {
        "risk_score": round(risk_score, 4),
        "risk_level": risk_level,
        "top_factors": factors[:8],  # Top 8 factors
    }


def extract_student_features(student, grades, attendance_records) -> Dict[str, float]:
    """
    Extract ML features from student data.

    Args:
        student: Student ORM object
        grades: List of Grade ORM objects
        attendance_records: List of Attendance ORM objects

    Returns:
        Dict of feature name -> value
    """
    # Attendance metrics
    total_records = len(attendance_records)
    if total_records > 0:
        present = sum(1 for a in attendance_records if a.status == "present")
        late = sum(1 for a in attendance_records if a.status == "late")
        absent = sum(1 for a in attendance_records if a.status == "absent")
        attendance_pct = (present + late * 0.5) / total_records * 100
        late_pct = late / total_records * 100

        # Calculate max consecutive absences
        max_streak = 0
        current_streak = 0
        sorted_records = sorted(attendance_records, key=lambda a: a.date)
        for record in sorted_records:
            if record.status == "absent":
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0
    else:
        attendance_pct = 75.0
        late_pct = 10.0
        max_streak = 0

    # Grade metrics
    if grades:
        avg_grade = np.mean([g.marks_obtained / g.max_marks * 100 for g in grades])
        failed = sum(1 for g in grades if g.marks_obtained / g.max_marks < 0.4)

        # Grade trend (slope across semesters)
        semesters = sorted(set(g.semester for g in grades))
        if len(semesters) >= 2:
            sem_avgs = []
            for s in semesters:
                sem_grades = [g.marks_obtained for g in grades if g.semester == s]
                sem_avgs.append(np.mean(sem_grades))
            grade_trend = (sem_avgs[-1] - sem_avgs[0]) / len(semesters)
        else:
            grade_trend = 0.0

        # Credits completion rate
        total_subjects = len(grades)
        passed = sum(1 for g in grades if g.marks_obtained / g.max_marks >= 0.4)
        credits_rate = (passed / total_subjects * 100) if total_subjects > 0 else 75.0
    else:
        avg_grade = 60.0
        failed = 0
        grade_trend = 0.0
        credits_rate = 75.0

    # Encode categorical features
    income_map = {"low": 0, "middle": 1, "high": 2}
    edu_map = {"none": 0, "primary": 1, "secondary": 2, "graduate": 3, "postgraduate": 4}
    gender_map = {"Male": 0, "Female": 1, "Other": 0}

    income_encoded = income_map.get(student.family_income_bracket, 1)
    edu_encoded = edu_map.get(student.parent_education, 2)
    gender_encoded = gender_map.get(student.gender, 0)

    # Calculate age
    from datetime import date
    if student.date_of_birth:
        today = date.today()
        age = today.year - student.date_of_birth.year
    else:
        age = 20

    # Engagement score (simulated based on available data)
    engagement = min(100, attendance_pct * 0.5 + avg_grade * 0.3 + credits_rate * 0.2)

    # Financial stress index
    financial_stress = (
        (2 - income_encoded) * 0.4 +
        (0 if student.has_scholarship else 1) * 0.3 +
        min((student.distance_from_school_km or 5) / 50, 1) * 0.3
    )

    # Encoded coaching & tier maps
    coaching_strain_map = {"low": 0, "medium": 1, "severe": 2}
    coaching_strain_encoded = coaching_strain_map.get(student.coaching_financial_strain, 0)

    tier_str = student.current_college_tier or ""
    if "Tier-1" in tier_str:
        tier_encoded = 0
    elif "Tier-2" in tier_str:
        tier_encoded = 1
    elif "Tier-3" in tier_str:
        tier_encoded = 2
    elif "Local" in tier_str:
        tier_encoded = 3
    else:
        tier_encoded = 4

    return {
        "attendance_pct": round(attendance_pct, 2),
        "avg_grade": round(avg_grade, 2),
        "grade_trend": round(grade_trend, 2),
        "failed_subjects": int(failed),
        "absence_streaks": int(max_streak),
        "late_arrivals_pct": round(late_pct, 2),
        "semester": student.semester or 1,
        "age": age,
        "gender_encoded": gender_encoded,
        "family_income_encoded": income_encoded,
        "parent_education_encoded": edu_encoded,
        "distance_from_school_km": student.distance_from_school_km or 5.0,
        "has_scholarship": 1 if student.has_scholarship else 0,
        "is_first_generation": 1 if student.is_first_generation else 0,
        "has_internet_access": 1 if student.has_internet_access else 0,
        "credits_completion_rate": round(credits_rate, 2),
        "engagement_score": round(engagement, 2),
        "financial_stress_index": round(financial_stress, 4),
        # Class 12 Drop-Year Features
        "drop_years_count": int(student.drop_years_count or 0),
        "jee_percentile": float(student.jee_percentile or 75.0),
        "class_12_percentage": float(student.class_12_percentage or 75.0),
        "coaching_financial_strain_encoded": int(coaching_strain_encoded),
        "current_college_tier_encoded": int(tier_encoded),
        "branch_satisfaction_score": float(student.branch_satisfaction_score or 5.0),
        "post_jee_burnout_index": float(student.post_jee_burnout_index or 4.0),
    }
