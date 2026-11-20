import os
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Explicitly load .env from Backend root
backend_root = Path(__file__).resolve().parent.parent
load_dotenv(backend_root / ".env")

from app.schemas import (
    CVProfile,
    CareerPredictRequest,
    CareerPredictResponse,
    CVEnhanceRequest,
    CVEnhanceResponse,
    CVAnalyzeRequest,
    CVAnalyzeResponse,
    JobFraudCheckRequest,
    JobFraudCheckResponse,
    LiveJobsSearchRequest,
    LiveJobsSearchResponse,
    RoadmapGenerateRequest,
    RoadmapGenerateResponse
)
from app.services.cv_parser import (
    extract_text_from_file,
    parse_cv_text,
    parse_cv_file,
    enhance_cv_section
)
from app.services.cv_analyzer import analyze_cv_profile
from app.services.career_graph import predict_career_paths
from app.services.fraud_detector import evaluate_job_fraud
from app.services.job_search_service import fetch_and_verify_live_jobs
from app.services.roadmap_service import generate_role_roadmap

app = FastAPI(
    title="NextJob AI Career Engine",
    description="Enterprise FastAPI backend with LangChain CV Parser and LangGraph Career Path Predictor",
    version="1.0.0"
)

# Configure CORS for local development across Vite ports
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
    "http://localhost:5177",
    "http://127.0.0.1:5177",
    "http://localhost:5178",
    "http://127.0.0.1:5178"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    """
    Health check verifying API readiness and AI engine configurations.
    """
    return {
        "status": "ok",
        "engines": ["LangGraph", "OpenAI", "Tavily"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "tavily_configured": bool(os.getenv("TAVILY_API_KEY"))
    }

@app.post("/api/cv/parse", response_model=CVProfile)
async def parse_cv_endpoint(file: UploadFile = File(...)):
    """
    Accepts an uploaded PDF or DOCX file, extracts text, and parses it into a structured CVProfile.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a valid filename."
        )

    ext = file.filename.lower().split('.')[-1]
    if ext not in ('pdf', 'docx', 'doc'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are supported."
        )

    try:
        file_bytes = await file.read()
        cv_profile = await parse_cv_file(file_bytes, file.filename)
        return cv_profile
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error parsing resume with AI engine: {str(e)}"
        )

@app.post("/api/cv/enhance", response_model=CVEnhanceResponse)
async def enhance_cv_endpoint(req: CVEnhanceRequest):
    """
    Rewrites and enhances a resume section (summary or experience) using executive action verbs and STAR metrics.
    """
    if not req.content or not req.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Content to enhance cannot be empty."
        )

    try:
        enhanced = await enhance_cv_section(
            section_type=req.section_type,
            content=req.content,
            target_role=req.target_role
        )
        return CVEnhanceResponse(enhanced_text=enhanced)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error enhancing CV section: {str(e)}"
        )

@app.post("/api/career/predict", response_model=CareerPredictResponse)
async def predict_career_endpoint(req: CareerPredictRequest):
    """
    Executes the 3-node LangGraph workflow combining candidate profile analysis,
    Tavily regional market intelligence, and structured path generation.
    """
    try:
        response = await predict_career_paths(req.cv, req.filters)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error running career prediction graph: {str(e)}"
        )

@app.post("/api/cv/analyze", response_model=CVAnalyzeResponse)
async def analyze_cv_endpoint(req: CVAnalyzeRequest):
    """
    Step 6B: Universal Multi-Sector AI CV Analysis & JD Match Engine.
    Evaluates 12 core modules across 8 weighted criteria (100 pts max)
    with real evidence quotes and ready-to-use section rewrites.
    """
    try:
        result = await analyze_cv_profile(req)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing CV profile: {str(e)}"
        )

@app.post("/api/jobs/search", response_model=LiveJobsSearchResponse)
async def search_jobs_endpoint(req: LiveJobsSearchRequest):
    """
    Real-time Tavily Job Discovery + Automated ML Scam Guard Verification.
    Searches matching live job openings and audits each against advance-fee fraud,
    shadow messaging channels, and phantom employers.
    """
    try:
        response = await fetch_and_verify_live_jobs(req)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing live jobs search & verification: {str(e)}"
        )

@app.post("/api/jobs/check-fraud", response_model=JobFraudCheckResponse)
async def check_job_fraud_endpoint(req: JobFraudCheckRequest):
    """
    Deep ML Scam & Ghost-Job Fraud Verification on any job posting or recruiter message.
    Calculates scam probability, confidence score, and explainable trust & risk signals.
    """
    try:
        verdict = evaluate_job_fraud(req)
        return verdict
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing ML fraud evaluation: {str(e)}"
        )

@app.post("/api/roadmap/generate", response_model=RoadmapGenerateResponse)
async def generate_roadmap_endpoint(req: RoadmapGenerateRequest):
    """
    Real-Time Tavily Market Intelligence + OpenAI Skill Gap & Learning Roadmap Engine.
    Generates tailored 8-week curriculum, verified strengths, critical missing gaps,
    emerging competencies, and curated multi-platform resources for the selected career path.
    """
    try:
        response = await generate_role_roadmap(req)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating skill gap roadmap: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
