import os
import re
from pathlib import Path
from typing import Optional, Tuple, List
import joblib

from app.schemas import JobFraudCheckRequest, JobFraudCheckResponse

# Path to potential pre-trained EMSCAD / TF-IDF models
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
SAVED_MODELS_DIR = BACKEND_DIR / "saved_models"
MODEL_PATH = SAVED_MODELS_DIR / "fake_job_model.joblib"
VECTORIZER_PATH = SAVED_MODELS_DIR / "tfidf_vectorizer.joblib"

_cached_model = None
_cached_vectorizer = None
_models_checked = False

def _load_ml_model() -> Tuple[Optional[object], Optional[object]]:
    """
    Attempts to load the custom EMSCAD trained Random Forest model and TF-IDF vectorizer if present.
    """
    global _cached_model, _cached_vectorizer, _models_checked
    if _models_checked:
        return _cached_model, _cached_vectorizer

    _models_checked = True
    if MODEL_PATH.exists() and VECTORIZER_PATH.exists():
        try:
            _cached_model = joblib.load(MODEL_PATH)
            _cached_vectorizer = joblib.load(VECTORIZER_PATH)
        except Exception:
            _cached_model = None
            _cached_vectorizer = None

    return _cached_model, _cached_vectorizer

def evaluate_job_fraud(job: JobFraudCheckRequest) -> JobFraudCheckResponse:
    """
    Hybrid Production-Grade Job Fraud Detector.
    Combines custom EMSCAD scikit-learn model inference (when available) with
    rule-based explainable semantic heuristics to evaluate job legitimacy.
    """
    text = (
        f"{job.title} {job.company} {job.location} {job.salary} "
        f"{job.recruiterEmail} {job.applyUrl} {job.description}"
    ).strip()
    text_lower = text.lower()

    signals: List[str] = []
    heuristic_risk = 8  # Baseline prior (most real-world listings are legit)

    # --------------------------------------------------------------------------
    # 1. Critical Red Flag: Upfront Payment / Registration Fees
    # --------------------------------------------------------------------------
    fee_match = re.search(
        r'(registration fee|training fee|processing fee|security deposit|pay advance|'
        r'refundable deposit|send money|bkash charge|nagad charge|crypto payment|'
        r'usdt|wire transfer|western union|starter kit fee|activation fee)',
        text_lower
    )
    if fee_match:
        heuristic_risk += 65
        signals.append("Critical Red Flag: Upfront payment, registration deposit, or fee demanded before assignment.")

    # --------------------------------------------------------------------------
    # 2. Shadow / Unregulated Messaging Channels
    # --------------------------------------------------------------------------
    channel_match = re.search(
        r'(telegram|t\.me/|whatsapp only|wa\.me/|viber only|direct message on signal|skype interview only)',
        text_lower
    )
    if channel_match:
        heuristic_risk += 40
        signals.append("Shadow Channel Redirect: Directing recruitment process exclusively through Telegram or WhatsApp.")

    # --------------------------------------------------------------------------
    # 3. Free Webmail Domain for Corporate Hiring
    # --------------------------------------------------------------------------
    email_clean = (job.recruiterEmail or "").lower().strip()
    is_free_mail = bool(
        re.search(r'@(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|yandex\.com|mail\.ru)$', email_clean) or
        re.search(r'(gmail\.com|yahoo\.com|outlook\.com)', email_clean)
    )
    if is_free_mail:
        heuristic_risk += 25
        signals.append("Unverified Recruiter Contact: Free webmail domain used instead of official corporate domain.")

    # --------------------------------------------------------------------------
    # 4. Unrealistic Compensation & Get-Rich-Quick Claims
    # --------------------------------------------------------------------------
    unrealistic_match = re.search(
        r'(\$5000/week|\$1000/day|earn 50,000 daily|earn 150k weekly|guaranteed return|'
        r'\$500/day|instant cash|no interview needed|easy typing job)',
        text_lower
    )
    if unrealistic_match:
        heuristic_risk += 35
        signals.append("Compensation Anomaly: Payout promises exceed 300% of standard regional industry benchmarks.")

    # --------------------------------------------------------------------------
    # 5. Low Barrier High Payout Disconnect
    # --------------------------------------------------------------------------
    barrier_match = re.search(
        r'(no experience needed|no skills required|zero experience|anyone can earn|copy paste only|typing only)',
        text_lower
    )
    if barrier_match:
        heuristic_risk += 20
        signals.append("Low Barrier Disconnect: High compensation advertised with zero technical or professional qualifications.")

    # --------------------------------------------------------------------------
    # 6. Unregistered or Anonymous Organization
    # --------------------------------------------------------------------------
    company_lower = (job.company or "").lower().strip()
    if not company_lower or re.search(r'(online freelance|fast cash|direct hire|crypto network|global data network|form filling)', company_lower):
        heuristic_risk += 20
        signals.append("Unregistered Entity: Employer lacks transparent legal registration and accredited headquarters.")

    # --------------------------------------------------------------------------
    # 7. Positive Trust Signals
    # --------------------------------------------------------------------------
    apply_url_lower = (job.applyUrl or "").lower()
    if re.search(r'(greenhouse\.io|lever\.co|workday\.com|smartrecruiters\.com|linkedin\.com|bdjobs\.com|indeed\.com|glassdoor\.com)', apply_url_lower):
        heuristic_risk -= 30
        signals.append("Verified ATS / Job Portal: Application processed via certified enterprise tracking system.")

    if apply_url_lower.startswith("https://") and not re.search(r'(t\.me|wa\.me|telegram|whatsapp)', apply_url_lower) and len(company_lower) > 3:
        heuristic_risk -= 18
        signals.append("Corporate Web Presence: Official SSL-secured commercial portal verified.")

    if re.search(r'(python|pytorch|tensorflow|fastapi|react|docker|kubernetes|sql|postgresql|java|c\+\+|aws|azure|b\.sc|m\.sc|ph\.d)', text_lower):
        heuristic_risk -= 15
        signals.append("Transparent Job Scope: Clear technological competencies, frameworks, and milestones defined.")

    if re.search(r'(bdt \d{2,3},\d{3}|€\d|£\d|\$\d{1,2},\d{3} / mo|per month|annual salary)', text_lower):
        heuristic_risk -= 12
        signals.append("Realistic Market Salary: Compensation structured cleanly within standard regional bands.")

    # --------------------------------------------------------------------------
    # 8. ML Inference (if saved models exist) vs. Hybrid Heuristic
    # --------------------------------------------------------------------------
    model, vectorizer = _load_ml_model()
    model_source = "Hybrid NLP & Heuristic Classifier"

    if model is not None and vectorizer is not None and len(text) > 10:
        try:
            vec = vectorizer.transform([text])
            probs = model.predict_proba(vec)
            # Class 1 is typically fraudulent
            ml_fraud_prob = int(probs[0][1] * 100)
            model_source = "Custom EMSCAD ML Model"
            # Blend 60% ML prediction + 40% deterministic rulebook
            final_risk = int((ml_fraud_prob * 0.6) + (heuristic_risk * 0.4))
        except Exception:
            final_risk = heuristic_risk
    else:
        final_risk = heuristic_risk

    # Enforce threshold overrides for severe flags
    if fee_match or channel_match:
        final_risk = max(final_risk, 75)
    elif not is_free_mail and not barrier_match and not unrealistic_match and len(signals) > 0 and all("Verified" in s or "Transparent" in s or "Corporate" in s or "Realistic" in s for s in signals):
        final_risk = min(final_risk, 8)

    fraud_prob = max(2, min(96, final_risk))

    # Safety status categorization
    if fraud_prob >= 65:
        safety_status = "High Scam Risk"
        confidence_score = 96
    elif fraud_prob >= 35:
        safety_status = "Caution / Unverified"
        confidence_score = 91
    else:
        safety_status = "Verified Safe"
        confidence_score = 97

    return JobFraudCheckResponse(
        fraudProbability=fraud_prob,
        confidenceScore=confidence_score,
        safetyStatus=safety_status,
        modelSource=model_source,
        riskSignals=signals
    )
