"""
Groq AI Guidance Service — Provides personalized Class 12 Drop-Year counselor advice.
Integrates with Groq API (llama-3.3-70b-versatile) with intelligent offline fallback.
"""
import os
import json
import urllib.request
import urllib.error
from typing import Dict, Any

import config

GROQ_API_KEY = os.getenv("GROQ_API_KEY", getattr(config, "GROQ_API_KEY", ""))
GROQ_MODEL = os.getenv("GROQ_MODEL", getattr(config, "GROQ_MODEL", "groq/compound"))


def generate_groq_guidance(
    physics_pct: float,
    chemistry_pct: float,
    maths_pct: float,
    overall_12th_pct: float,
    jee_percentile: float,
    coaching_type: str,
    financial_strain: str,
    burnout_index: float,
    success_prob: float,
    projected_tier: str,
) -> Dict[str, Any]:
    """Generate Groq AI counselor guidance report."""
    
    prompt = f"""
Student Profile:
- Class 12 Marks: Physics {physics_pct}%, Chemistry {chemistry_pct}%, Maths {maths_pct}%, Overall {overall_12th_pct}%
- Initial JEE Percentile: {jee_percentile}%ile
- Coaching Background: {coaching_type}
- Coaching Financial Debt Strain: {financial_strain}
- Post-Exam Burnout Index (0-10): {burnout_index}
- Calculated Drop Year IIT/NIT Success Probability: {success_prob}%
- Projected Outcome: {projected_tier}

Generate a concise, professional 4-part guidance report:
1. Verdict & Analysis (Empathic evaluation of whether a drop year is viable)
2. Subject Strategy Breakdown (Specific focus areas for Physics, Chemistry, Maths)
3. 12-Month Preparation Roadmap (Key milestones)
4. Alternative Career Pathways (If drop year risk is high)
"""

    if GROQ_API_KEY:
        try:
            req_data = json.dumps({
                "model": GROQ_MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are EduGuard's AI Senior Career Counselor in India, specializing in Class 12 Board exams, JEE Main/Advanced, NEET, and IIT drop-year decisions."
                    },
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.5,
                "max_tokens": 800,
            }).encode("utf-8")

            req = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=req_data,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                    "User-Agent": "EduGuard-App/1.0",
                },
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=12) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                text = result["choices"][0]["message"]["content"]
                return {
                    "source": f"Groq AI ({GROQ_MODEL})",
                    "content": text
                }
        except Exception as e:
            print(f"[WARN] Groq API call failed: {e}. Using intelligent counselor fallback engine.")

    # Rule-based intelligent fallback counselor output
    weakest_subject = "Mathematics" if maths_pct <= min(physics_pct, chemistry_pct) else ("Physics" if physics_pct <= chemistry_pct else "Chemistry")
    strongest_subject = "Mathematics" if maths_pct >= max(physics_pct, chemistry_pct) else ("Physics" if physics_pct >= chemistry_pct else "Chemistry")

    if success_prob >= 70:
        verdict = f"Strong Candidate for Drop Year: Your solid 12th foundation ({overall_12th_pct}%) and JEE score ({jee_percentile}%ile) indicate high potential for upgrading to an IIT/NIT rank."
        advice = f"Focus 45% of your prep on {weakest_subject} problem-solving depth. Maintain your strength in {strongest_subject} with full-length mocks."
    elif success_prob >= 45:
        verdict = f"Conditional Drop Year Candidate: You have decent potential, but burnout ({burnout_index}/10) or financial strain ({financial_strain}) poses risk."
        advice = f"Take a 2-week mental reset before starting. Prioritize NCERT fundamentals in {weakest_subject} and target high-weightage topics first."
    else:
        verdict = f"Alternative Pathway Recommended: A full drop year poses high risk of burnout or financial fatigue. Consider enrolling in a top Tier-2/3 B.Tech program or B.Sc CS while preparing off-campus."
        advice = f"Focus on building core programming & software development skills alongside your degree."

    content = f"""### 🎯 Verdict & Analysis
{verdict}

### 📚 Subject Strategy Breakdown
- **{weakest_subject} (Priority Focus)**: Foundational gaps detected ({min(physics_pct, chemistry_pct, maths_pct)}%). Solve 30-40 targeted pyqs daily.
- **{strongest_subject} (Scoring Pillar)**: Leverage strength ({max(physics_pct, chemistry_pct, maths_pct)}%) for speed and accuracy in JEE Main Paper 1.

### 📅 12-Month Execution Roadmap
- **Months 1-4**: Complete syllabus revision focusing on Class 11 & 12 high-weightage chapters.
- **Months 5-8**: Chapter-wise test series & 10-year JEE Advanced pyqs.
- **Months 9-12**: Full syllabus mock tests every 3 days + error log analysis.

### 💡 Counselor Note
{advice}"""

    return {
        "source": "DropGuard AI Counselor Engine",
        "content": content
    }
