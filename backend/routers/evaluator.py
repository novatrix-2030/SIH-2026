"""
Class 12 Drop-Year Evaluator Router — Assesses student eligibility & success probability for taking a JEE drop year.
Integrates with Groq AI for personalized guidance reports.
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from services.groq_service import generate_groq_guidance

router = APIRouter(prefix="/api/evaluator", tags=["evaluator"])


class DropYearEvaluationRequest(BaseModel):
    physics_pct: float = Field(75.0, ge=0.0, le=100.0)
    chemistry_pct: float = Field(75.0, ge=0.0, le=100.0)
    maths_pct: float = Field(75.0, ge=0.0, le=100.0)
    overall_12th_pct: float = Field(78.0, ge=0.0, le=100.0)
    jee_percentile: float = Field(82.0, ge=0.0, le=100.0)
    coaching_type: str = "Online Batch (PW/Unacademy)"
    coaching_financial_strain: str = "low"  # low, medium, severe
    burnout_index: float = Field(4.0, ge=0.0, le=10.0)


@router.post("/evaluate-dropyear")
async def evaluate_drop_year(req: DropYearEvaluationRequest) -> Dict[str, Any]:
    """Evaluate Class 12 drop-year success probability and return Groq AI guidance."""
    
    pcm_avg = (req.physics_pct + req.chemistry_pct + req.maths_pct) / 3.0
    base_potential = (pcm_avg * 0.40) + (req.jee_percentile * 0.45) + (req.overall_12th_pct * 0.15)
    
    # Risk factors & penalties
    financial_penalty = 18.0 if req.coaching_financial_strain == "severe" else (8.0 if req.coaching_financial_strain == "medium" else 0.0)
    burnout_penalty = req.burnout_index * 3.5
    
    raw_prob = base_potential - financial_penalty - burnout_penalty
    success_prob = round(max(8.0, min(98.5, raw_prob)), 1)
    
    if success_prob >= 75:
        projected_tier = "IIT Tier-1 (Bombay / Delhi / Madras / Kanpur / Kharagpur)"
        recommendation = "Strongly Recommended for Drop Year"
    elif success_prob >= 58:
        projected_tier = "Top NIT / IIIT Tier-1 Rank (Top 15,000 JEE Advanced)"
        recommendation = "Recommended for Drop Year with Focused Prep"
    elif success_prob >= 40:
        projected_tier = "Tier-2 State Govt / Reputed Private Engineering College"
        recommendation = "Conditional Drop Year (High Burnout / Debt Risk)"
    else:
        projected_tier = "High Drop Risk — Direct 4-Year B.Tech + Skill Track Recommended"
        recommendation = "Alternative Pathway Recommended (Avoid Full Drop Year)"
        
    ai_guidance = generate_groq_guidance(
        physics_pct=req.physics_pct,
        chemistry_pct=req.chemistry_pct,
        maths_pct=req.maths_pct,
        overall_12th_pct=req.overall_12th_pct,
        jee_percentile=req.jee_percentile,
        coaching_type=req.coaching_type,
        financial_strain=req.coaching_financial_strain,
        burnout_index=req.burnout_index,
        success_prob=success_prob,
        projected_tier=projected_tier,
    )
    
    return {
        "success_probability": success_prob,
        "pcm_average": round(pcm_avg, 1),
        "projected_institution": projected_tier,
        "recommendation": recommendation,
        "ai_guidance": ai_guidance,
    }
