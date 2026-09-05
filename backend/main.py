"""
backend/main.py
---------------
FastAPI Production REST Backend for PlaceMint AI.
Exposes ML predictions, feature configurations, model benchmark metrics,
resume parsing (PDF upload & structured extraction), and actionable suggestions.
"""

from __future__ import annotations

import io
import sys
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure root directory is on PYTHONPATH so config and utils can be imported
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from config.settings import APP_NAME, APP_TAGLINE, BRANCH_LABELS, FEATURE_DISPLAY_NAMES
from utils.feature_engineering import PlacementFeatureEngineer  # noqa: F401
from utils.model_utils import (
    artifacts_ready,
    fill_defaults,
    load_feature_config,
    load_model_metrics,
    predict_placement,
)
from utils.resume_parser import (
    extract_text_from_pdf,
    map_resume_to_features,
    parse_resume_text_heuristic,
)
from utils.suggestions import generate_suggestions

app = FastAPI(
    title=APP_NAME,
    description=APP_TAGLINE,
    version="2.0.0",
)

# Enable CORS for Next.js frontend (default port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic Request Models ──────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    features: dict[str, Any] = Field(
        default_factory=dict,
        description="Dictionary of raw student features (numeric and categorical)",
    )

    class Config:
        extra = "allow"


class SuggestionsRequest(BaseModel):
    features: dict[str, Any] = Field(
        default_factory=dict,
        description="Dictionary of student features",
    )
    max_suggestions: Optional[int] = 5


class ResumeBuildRequest(BaseModel):
    resume_data: dict[str, Any] = Field(
        description="Structured resume data matching resume_schema",
    )


# ── Health & Config Endpoints ────────────────────────────────────────────────

@app.get("/api/health")
def get_health():
    """Verify backend status and model readiness."""
    ready = artifacts_ready()
    return {
        "status": "ok" if ready else "degraded",
        "app_name": APP_NAME,
        "app_tagline": APP_TAGLINE,
        "model_ready": ready,
    }


@app.get("/api/config")
def get_config():
    """Return feature definitions, ranges, dropdowns, dataset defaults, and cohort statistics."""
    config = load_feature_config()
    return {
        "config": config,
        "branch_labels": BRANCH_LABELS,
        "feature_display_names": FEATURE_DISPLAY_NAMES,
    }


@app.get("/api/metrics")
def get_metrics():
    """Return the saved 7-model comparison leaderboard, confusion matrix, ROC curve data, and feature importances."""
    metrics = load_model_metrics()
    if not metrics:
        raise HTTPException(status_code=404, detail="Model metrics artifact not found.")
    return metrics


# ── Prediction & Suggestions Endpoints ─────────────────────────────────────

@app.post("/api/predict")
def run_predict(req: PredictionRequest):
    """Run placement prediction for a given set of student features."""
    try:
        user_vals = req.features or {}
        if not user_vals:
            extra = {k: v for k, v in req.model_dump().items() if k != "features" and v is not None}
            if extra:
                user_vals = extra
        res = predict_placement(user_vals)
        full_features = res["input_features"]

        # Calculate composite scores for rich UI gauges based on actual user values
        cgpa = float(user_vals.get("cgpa", full_features.get("cgpa", 0)))
        t10 = float(user_vals.get("tenth_percentage", full_features.get("tenth_percentage", 0)))
        t12 = float(user_vals.get("twelfth_percentage", full_features.get("twelfth_percentage", 0)))
        academic_score = round(((cgpa / 10.0) * 0.5 + (t10 / 100.0) * 0.25 + (t12 / 100.0) * 0.25) * 100, 1)

        proj = float(user_vals.get("projects_completed", full_features.get("projects_completed", 0)))
        intern = float(user_vals.get("internships_completed", full_features.get("internships_completed", 0)))
        coding = float(user_vals.get("coding_skill_rating", full_features.get("coding_skill_rating", 0)))
        practical_score = round(min(100.0, (proj * 8 + intern * 20 + coding * 12)), 1)

        comm = float(user_vals.get("communication_skill_rating", full_features.get("communication_skill_rating", 0)))
        extrac = 1.2 if user_vals.get("extracurricular_involvement", full_features.get("extracurricular_involvement")) == "High" else (1.0 if user_vals.get("extracurricular_involvement", full_features.get("extracurricular_involvement")) == "Medium" else 0.8)
        soft_index = round(min(100.0, comm * 16 * extrac), 1)

        # Generate actionable advice
        suggestions = generate_suggestions(full_features, max_suggestions=5)

        return {
            "prediction": res["prediction"],
            "placed_probability": res["placed_probability"],
            "not_placed_probability": res["not_placed_probability"],
            "confidence": res["confidence"],
            "composite_scores": {
                "academic_score": academic_score,
                "practical_score": practical_score,
                "soft_index": soft_index,
            },
            "input_features": full_features,
            "suggestions": suggestions,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/api/suggestions")
def run_suggestions(req: SuggestionsRequest):
    """Generate suggestions for student feature improvements."""
    full_features = fill_defaults(req.features)
    suggestions = generate_suggestions(full_features, max_suggestions=req.max_suggestions or 5)
    return {"suggestions": suggestions}


def calculate_ats_breakdown(resume_data: dict[str, Any], full_features: dict[str, Any], mapped_features: dict[str, Any] = None) -> dict[str, Any]:
    mapped = mapped_features or {}
    metrics = []

    # 1. Technical Skills Depth (Max 25 pts)
    tech_skills = resume_data.get("skills_technical", [])
    n_tech = len(tech_skills)
    skill_score = min(25, n_tech * 2 if n_tech < 10 else 25)
    metrics.append({
        "category": "Technical Skills Depth",
        "score": skill_score,
        "max_score": 25,
        "status": "Excellent" if skill_score >= 20 else ("Good" if skill_score >= 12 else "Needs Improvement"),
        "details": f"Identified {n_tech} high-demand technical skills ({', '.join(tech_skills[:4]) if tech_skills else 'None'})."
    })

    # 2. Academic Profile & CGPA (Max 20 pts)
    cgpa = float(full_features.get("cgpa", 0))
    has_t10 = "tenth_percentage" in mapped or any(e.get("level") == "10th" for e in resume_data.get("education", []))
    has_t12 = "twelfth_percentage" in mapped or any(e.get("level") == "12th" for e in resume_data.get("education", []))

    t10_val = mapped.get("tenth_percentage", full_features.get("tenth_percentage")) if has_t10 else None
    t12_val = mapped.get("twelfth_percentage", full_features.get("twelfth_percentage")) if has_t12 else None

    # Base academic score calculation
    acad_pts = (cgpa / 10.0) * 12.0
    if has_t10 and t10_val:
        acad_pts += (t10_val / 100.0) * 4.0
    else:
        acad_pts += 2.0  # slight penalty for missing 10th
    
    if has_t12 and t12_val:
        acad_pts += (t12_val / 100.0) * 4.0
    else:
        acad_pts += 2.0  # slight penalty for missing 12th

    acad_score = round(min(20.0, acad_pts))
    
    details_str = f"CGPA: {cgpa}/10.0"
    details_str += f" | 10th: {t10_val}%" if has_t10 and t10_val else " | 10th: Not Mentioned"
    details_str += f" | 12th: {t12_val}%" if has_t12 and t12_val else " | 12th: Not Mentioned in CV"

    metrics.append({
        "category": "Academic Profile & CGPA",
        "score": acad_score,
        "max_score": 20,
        "status": "Outstanding" if acad_score >= 16 else ("Satisfactory" if acad_score >= 10 else "Low"),
        "details": details_str
    })

    # 3. Projects Impact & Tech Stacks (Max 25 pts)
    projects = resume_data.get("projects", [])
    n_proj = len(projects)
    proj_score = min(25, n_proj * 8 if n_proj < 3 else 25)
    metrics.append({
        "category": "Projects Impact & Tech Stacks",
        "score": proj_score,
        "max_score": 25,
        "status": "Outstanding" if proj_score >= 20 else ("Moderate" if proj_score >= 12 else "Basic"),
        "details": f"Extracted {n_proj} technical projects with defined stack labels and description bullets."
    })

    # 4. Work Experience & Internships (Max 15 pts)
    experience = resume_data.get("experience", [])
    n_exp = len(experience)
    exp_score = min(15, n_exp * 7.5)
    metrics.append({
        "category": "Work Experience & Internships",
        "score": round(exp_score),
        "max_score": 15,
        "status": "Strong" if exp_score >= 10 else ("Basic" if exp_score > 0 else "None Identified"),
        "details": f"Extracted {n_exp} professional experience and internship entries."
    })

    # 5. Certifications & Degree (Max 10 pts)
    certs = resume_data.get("certifications", [])
    n_certs = len(certs)
    cert_score = min(10, n_certs * 5) if n_certs > 0 else 0
    metrics.append({
        "category": "Certifications & Qualifications",
        "score": cert_score,
        "max_score": 10,
        "status": "Verified" if cert_score >= 5 else ("Basic" if cert_score > 0 else "Needs Improvement"),
        "details": f"Attached {n_certs} industry certifications and formal degree coursework." if n_certs else "No formal certifications listed in CV."
    })

    # 6. Contact & Link Integrity (Max 5 pts)
    contact_pts = 0
    if resume_data.get("full_name"): contact_pts += 1
    if resume_data.get("email"): contact_pts += 1
    if resume_data.get("phone"): contact_pts += 1
    if resume_data.get("github") or resume_data.get("linkedin"): contact_pts += 2
    metrics.append({
        "category": "Contact & Links Integrity",
        "score": contact_pts,
        "max_score": 5,
        "status": "Complete" if contact_pts >= 4 else "Incomplete",
        "details": "Parsed essential contact channels (Email, Phone, GitHub/LinkedIn links)."
    })

    total_score = sum(m["score"] for m in metrics)
    return {
        "total_score": total_score,
        "max_total": 100,
        "metrics": metrics
    }


# ── Resume Parsing & Building Endpoints ─────────────────────────────────────

@app.post("/api/resume/parse")
async def parse_resume_file(file: UploadFile = File(...)):
    """Accept PDF resume file upload, extract text, parse sections & skills, map to features, and run placement prediction."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        raw_text = extract_text_from_pdf(io.BytesIO(contents))
        if not raw_text or len(raw_text.strip()) < 20:
            raise HTTPException(
                status_code=422,
                detail="Could not extract readable text from PDF. It may be scanned or image-only."
            )

        resume_data = parse_resume_text_heuristic(raw_text)
        mapped_features = map_resume_to_features(resume_data)
        full_features = fill_defaults(mapped_features)
        pred_res = predict_placement(full_features)
        suggestions = generate_suggestions(full_features, max_suggestions=5)
        ats_breakdown = calculate_ats_breakdown(resume_data, full_features, mapped_features)

        return {
            "filename": file.filename,
            "char_count": len(raw_text),
            "resume_data": resume_data,
            "extracted_features": mapped_features,
            "full_features": full_features,
            "prediction": pred_res,
            "suggestions": suggestions,
            "ats_breakdown": ats_breakdown,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume parsing failed: {str(e)}")


@app.post("/api/resume/build")
def build_resume(req: ResumeBuildRequest):
    """Process structured resume builder input, map features, and run placement prediction."""
    resume_data = req.resume_data
    mapped_features = map_resume_to_features(resume_data)
    full_features = fill_defaults(mapped_features)
    pred_res = predict_placement(full_features)
    suggestions = generate_suggestions(full_features, max_suggestions=5)
    ats_breakdown = calculate_ats_breakdown(resume_data, full_features, mapped_features)

    return {
        "resume_data": resume_data,
        "extracted_features": mapped_features,
        "full_features": full_features,
        "prediction": pred_res,
        "suggestions": suggestions,
        "ats_breakdown": ats_breakdown,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
