"""Main FastAPI application entry point for DropGuard."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, SessionLocal
from models import User
from routers import auth, students, analytics, evaluator
from services.ml_service import load_model
import seed_data

app = FastAPI(
    title="DropGuard API",
    description="Early-Warning System for Student Dropout Risk — SIH 2026",
    version="1.0.0",
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(analytics.router)
app.include_router(evaluator.router)


@app.on_event("startup")
async def startup():
    """Initialize database, seed demo data if empty, and load ML model on startup."""
    init_db()
    
    # Auto-seed database if empty
    db = SessionLocal()
    try:
        if db.query(User).first() is None:
            print("[INFO] Database empty — automatically seeding demo data...")
            seed_data.seed()
            print("[INFO] Auto-seeding completed.")
    except Exception as e:
        print(f"[WARN] Error during auto-seeding: {e}")
    finally:
        db.close()

    try:
        load_model()
    except Exception as e:
        print(f"[WARN] Could not load ML model: {e}")
        print("   Run `python -m ml.train` to train the model first.")


@app.get("/")
async def root():
    return {
        "name": "DropGuard API",
        "version": "1.0.0",
        "description": "Early-Warning System for Student Dropout Risk",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health():
    return {"status": "healthy"}
