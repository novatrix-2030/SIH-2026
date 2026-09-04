"""
ML Model Training Pipeline for EduGuard
"""
import sys
import os
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from xgboost import XGBClassifier

ARTIFACTS_DIR = Path(__file__).parent / "artifacts"
ARTIFACTS_DIR.mkdir(exist_ok=True)

FEATURE_NAMES = [
    "attendance_pct", "avg_grade", "grade_trend", "failed_subjects",
    "absence_streaks", "late_arrivals_pct", "semester", "age",
    "gender_encoded", "family_income_encoded", "parent_education_encoded",
    "distance_from_school_km", "has_scholarship", "is_first_generation",
    "has_internet_access", "credits_completion_rate", "engagement_score",
    "financial_stress_index",
    # Class 12 Drop-Year JEE Non-IIT Risk Features
    "drop_years_count", "jee_percentile", "class_12_percentage",
    "coaching_financial_strain_encoded", "current_college_tier_encoded",
    "branch_satisfaction_score", "post_jee_burnout_index"
]

FEATURE_LABELS = {
    "attendance_pct": "Attendance Rate (%)",
    "avg_grade": "Average Grade (%)",
    "grade_trend": "Grade Trend",
    "failed_subjects": "Failed Subjects",
    "absence_streaks": "Consecutive Absences",
    "late_arrivals_pct": "Late Arrivals (%)",
    "semester": "Current Semester",
    "age": "Student Age",
    "gender_encoded": "Gender",
    "family_income_encoded": "Family Income Level",
    "parent_education_encoded": "Parent Education Level",
    "distance_from_school_km": "Distance from College (km)",
    "has_scholarship": "Has Scholarship",
    "is_first_generation": "First Generation Student",
    "has_internet_access": "Internet Access",
    "credits_completion_rate": "Credits Completion Rate (%)",
    "engagement_score": "LMS Engagement Score",
    "financial_stress_index": "Financial Stress Index",
    "drop_years_count": "Post-12th Drop Years Count",
    "jee_percentile": "JEE Main Percentile",
    "class_12_percentage": "Class 12 Board Percentage (%)",
    "coaching_financial_strain_encoded": "Coaching Financial Debt/Strain",
    "current_college_tier_encoded": "Current College Tier",
    "branch_satisfaction_score": "Branch Alignment Satisfaction (0-10)",
    "post_jee_burnout_index": "Post-JEE Burnout & Regret Index (0-10)"
}


def generate_training_data(n_samples=3500):
    np.random.seed(42)
    data = []
    for _ in range(n_samples):
        base_risk = np.random.random()
        if base_risk > 0.6:  # High Risk Cohort (Post-drop year non-IIT struggle)
            att = np.clip(np.random.normal(52, 18), 10, 90)
            grade = np.clip(np.random.normal(42, 15), 5, 80)
            trend = np.random.normal(-6, 3)
            failed = np.random.poisson(3.2)
            streaks = np.random.poisson(4)
            late = np.clip(np.random.normal(28, 10), 0, 50)
            cr = np.clip(np.random.normal(50, 20), 10, 85)
            eng = np.clip(np.random.normal(28, 15), 5, 75)
            inc = np.random.choice([0, 1, 2], p=[0.60, 0.30, 0.10])
            pedu = np.random.choice([0, 1, 2, 3, 4], p=[0.30, 0.30, 0.25, 0.10, 0.05])
            dist = np.clip(np.random.normal(22, 12), 1, 60)
            schol = int(np.random.random() < 0.12)
            fg = int(np.random.random() < 0.60)
            inet = int(np.random.random() < 0.55)

            # Drop-year specific factors for high-risk
            drop_years = np.random.choice([1, 2], p=[0.70, 0.30])
            jee_perc = np.clip(np.random.normal(68, 12), 35, 84)  # Missed NIT/IIT cutoff after drop
            c12_pct = np.clip(np.random.normal(72, 8), 55, 88)
            coaching_strain = np.random.choice([1, 2], p=[0.35, 0.65])  # Moderate to severe coaching debt
            college_tier = np.random.choice([2, 3, 4], p=[0.50, 0.35, 0.15])  # Tier-3, Local, Open Univ
            branch_sat = np.clip(np.random.normal(3.2, 1.5), 0, 6)  # Unhappy with forced branch
            burnout = np.clip(np.random.normal(8.1, 1.2), 5, 10)  # High post-JEE regret & fatigue
        elif base_risk > 0.3:  # Moderate Risk Cohort
            att = np.clip(np.random.normal(74, 10), 40, 95)
            grade = np.clip(np.random.normal(64, 10), 30, 90)
            trend = np.random.normal(-1, 3)
            failed = np.random.poisson(1.1)
            streaks = np.random.poisson(1.5)
            late = np.clip(np.random.normal(14, 6), 0, 35)
            cr = np.clip(np.random.normal(74, 12), 40, 95)
            eng = np.clip(np.random.normal(55, 15), 20, 90)
            inc = np.random.choice([0, 1, 2], p=[0.25, 0.55, 0.20])
            pedu = np.random.choice([0, 1, 2, 3, 4], p=[0.08, 0.15, 0.35, 0.30, 0.12])
            dist = np.clip(np.random.normal(12, 7), 0.5, 35)
            schol = int(np.random.random() < 0.30)
            fg = int(np.random.random() < 0.30)
            inet = int(np.random.random() < 0.80)

            # Drop-year specific factors for moderate-risk
            drop_years = np.random.choice([0, 1], p=[0.50, 0.50])
            jee_perc = np.clip(np.random.normal(83, 8), 70, 92)
            c12_pct = np.clip(np.random.normal(80, 7), 65, 92)
            coaching_strain = np.random.choice([0, 1, 2], p=[0.40, 0.45, 0.15])
            college_tier = np.random.choice([1, 2, 3], p=[0.15, 0.60, 0.25])
            branch_sat = np.clip(np.random.normal(6.1, 1.5), 3, 9)
            burnout = np.clip(np.random.normal(5.2, 1.5), 2, 8)
        else:  # Low Risk / Resilient Cohort
            att = np.clip(np.random.normal(91, 5), 75, 100)
            grade = np.clip(np.random.normal(82, 8), 60, 100)
            trend = np.random.normal(2, 2)
            failed = np.random.poisson(0.2)
            streaks = np.random.poisson(0.5)
            late = np.clip(np.random.normal(5, 3), 0, 15)
            cr = np.clip(np.random.normal(93, 5), 75, 100)
            eng = np.clip(np.random.normal(80, 10), 55, 100)
            inc = np.random.choice([0, 1, 2], p=[0.10, 0.40, 0.50])
            pedu = np.random.choice([0, 1, 2, 3, 4], p=[0.02, 0.05, 0.18, 0.40, 0.35])
            dist = np.clip(np.random.normal(5, 3), 0.5, 15)
            schol = int(np.random.random() < 0.50)
            fg = int(np.random.random() < 0.12)
            inet = int(np.random.random() < 0.95)

            # Drop-year specific factors for low-risk
            drop_years = np.random.choice([0, 1], p=[0.80, 0.20])
            jee_perc = np.clip(np.random.normal(94, 4), 85, 99.5)
            c12_pct = np.clip(np.random.normal(88, 6), 75, 98)
            coaching_strain = np.random.choice([0, 1], p=[0.80, 0.20])
            college_tier = np.random.choice([0, 1, 2], p=[0.40, 0.45, 0.15])
            branch_sat = np.clip(np.random.normal(8.6, 1.0), 6, 10)
            burnout = np.clip(np.random.normal(2.1, 1.0), 0, 5)

        sem = np.random.randint(1, 9)
        age = 18 + drop_years + (sem // 2)
        gender = np.random.choice([0, 1])
        fs = (2 - inc) * 0.3 + (1 - schol) * 0.2 + (coaching_strain / 2) * 0.5

        # Target prediction: high dropout risk if base_risk combined with burnout, coaching strain, and branch mismatch
        combined_risk = (base_risk * 0.5 + (burnout / 10) * 0.25 + (coaching_strain / 2) * 0.15 + (1 - branch_sat / 10) * 0.10)
        target = 1 if (combined_risk + 0.05 * np.random.random()) > 0.52 else 0

        data.append([
            round(att, 2), round(grade, 2), round(trend, 2), int(failed),
            int(streaks), round(late, 2), sem, age, gender, inc, pedu,
            round(dist, 1), schol, fg, inet, round(cr, 2), round(eng, 2),
            round(fs, 4), int(drop_years), round(jee_perc, 2), round(c12_pct, 2),
            int(coaching_strain), int(college_tier), round(branch_sat, 1), round(burnout, 1),
            target
        ])

    return pd.DataFrame(data, columns=FEATURE_NAMES + ["dropout"])


def train_model():
    print("Training ML model...")
    df = generate_training_data(3000)
    X, y = df[FEATURE_NAMES], df["dropout"]
    print(f"  Dataset: {len(df)} samples, {len(FEATURE_NAMES)} features")
    print(f"  Class distribution: {dict(y.value_counts())}")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    model = XGBClassifier(
        n_estimators=200, max_depth=6, learning_rate=0.1,
        subsample=0.8, colsample_bytree=0.8, min_child_weight=3,
        gamma=0.1, reg_alpha=0.1, reg_lambda=1.0,
        random_state=42, eval_metric="logloss",
    )
    model.fit(X_train_s, y_train)

    y_pred = model.predict(X_test_s)
    y_prob = model.predict_proba(X_test_s)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)

    print(f"\n  Model Performance:")
    print(f"    Accuracy:  {acc:.4f}")
    print(f"    Precision: {prec:.4f}")
    print(f"    Recall:    {rec:.4f}")
    print(f"    F1 Score:  {f1:.4f}")
    print(f"    AUC-ROC:   {auc:.4f}")

    cv = cross_val_score(model, X_train_s, y_train, cv=5, scoring="roc_auc")
    print(f"    CV AUC:    {cv.mean():.4f} (+/- {cv.std():.4f})")

    imp = pd.DataFrame({"feature": FEATURE_NAMES, "importance": model.feature_importances_}).sort_values("importance", ascending=False)
    print(f"\n  Top Features:")
    for _, r in imp.head(6).iterrows():
        print(f"    {FEATURE_LABELS.get(r['feature'], r['feature'])}: {r['importance']:.4f}")

    print(f"\n  Saving artifacts to {ARTIFACTS_DIR}...")
    joblib.dump(model, ARTIFACTS_DIR / "model.joblib")
    joblib.dump(scaler, ARTIFACTS_DIR / "scaler.joblib")
    joblib.dump(FEATURE_NAMES, ARTIFACTS_DIR / "feature_names.joblib")
    joblib.dump(FEATURE_LABELS, ARTIFACTS_DIR / "feature_labels.joblib")

    metrics = {"accuracy": round(acc, 4), "precision": round(prec, 4), "recall": round(rec, 4),
               "f1_score": round(f1, 4), "auc_roc": round(auc, 4), "cv_auc_mean": round(cv.mean(), 4)}
    with open(ARTIFACTS_DIR / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print("  Model training complete!")
    return model, scaler


if __name__ == "__main__":
    train_model()
