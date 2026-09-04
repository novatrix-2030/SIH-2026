import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Database
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'eduguard.db'}")

# JWT Auth
SECRET_KEY = os.getenv("SECRET_KEY", "eduguard-sih2026-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# ML Model
MODEL_PATH = BASE_DIR / "ml" / "artifacts" / "model.joblib"
SCALER_PATH = BASE_DIR / "ml" / "artifacts" / "scaler.joblib"
FEATURE_NAMES_PATH = BASE_DIR / "ml" / "artifacts" / "feature_names.joblib"

# Risk Thresholds
RISK_THRESHOLDS = {
    "low": (0, 0.25),
    "medium": (0.25, 0.50),
    "high": (0.50, 0.75),
    "critical": (0.75, 1.0),
}

# Alert settings
ALERT_THRESHOLD = 0.50  # Alert when risk >= 50%

# Groq AI Settings
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "groq/compound")
