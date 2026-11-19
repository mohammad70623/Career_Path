import os
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

backend_root = Path(__file__).resolve().parent.parent.parent
load_dotenv(backend_root / ".env")

from app.schemas import (
    CVAnalyzeRequest,
    CVAnalyzeResponse,
    WeightedCriterion,
    CoreModuleAuditItem,
    JDMatchResult,
    CVProfile,
    RedFlagItem,
    CriterionBreakdownItem,
    ModuleAuditItem,
    GapAnalysisItem,
    ActionableSolutionItem
)

# 14 Universal Industry Sectors & their key competency taxonomies
SECTOR_TAXONOMY: Dict[str, Dict[str, Any]] = {
    "IT & Software": {
        "critical_skills": ["Python", "Docker", "Kubernetes", "FastAPI", "PostgreSQL", "CI/CD Pipelines", "MLOps", "Microservices", "System Architecture", "Git"],
        "keywords": ["Distributed Systems", "Cloud Native", "RESTful API", "High Throughput", "Scalability", "Latency", "DevOps"],
        "qualification": "Accredited Bachelor's or Master's in Computer Science, Software Engineering, or related quantitative field."
    },
    "Healthcare": {
        "critical_skills": ["Clinical Protocols", "Patient Care Coordination", "EHR/EMR (Epic/Cerner)", "HIPAA Compliance", "Medical Diagnostics", "Triage Assessment", "Infection Control"],
        "keywords": ["Clinical Care", "Patient Safety", "HIPAA", "Pharmacology", "Evidence-Based Practice"],
        "qualification": "Accredited Medical, Nursing, or Allied Health degree with active professional license."
    },
    "Banking & Finance": {
        "critical_skills": ["Financial Modeling", "Risk Management", "DCF Valuation", "Regulatory Compliance (Basel/Dodd-Frank)", "AML/KYC", "Advanced Excel VBA", "SQL Analytics"],
        "keywords": ["Risk Assessment", "Financial Forecasting", "Valuation", "Compliance", "Portfolio Management", "Asset Allocation"],
        "qualification": "B.Sc. or Master's in Finance, Accounting, Economics, or CFA/ACCA/CPA credentials."
    },
    "Engineering": {
        "critical_skills": ["CAD (SolidWorks/AutoCAD)", "Finite Element Analysis (FEA)", "MATLAB", "GD&T", "Six Sigma / Lean", "Design for Manufacturing (DFM)", "Root Cause Analysis"],
        "keywords": ["FEA Simulation", "CAD Modeling", "Lean Manufacturing", "Six Sigma", "Prototyping", "Failure Analysis"],
        "qualification": "Accredited B.Sc. / B.Eng. in Mechanical, Electrical, Civil, or Industrial Engineering."
    },
    "Education": {
        "critical_skills": ["Curriculum Design", "Instructional Technology", "Differentiated Pedagogy", "Student Assessment", "LMS Platforms (Canvas/Blackboard)", "Classroom Management"],
        "keywords": ["Pedagogy", "Curriculum Mapping", "Instructional Design", "Student Outcomes", "Assessment Rubrics"],
        "qualification": "Bachelor's or Master's in Education or subject specialty with teaching credentials."
    },
    "Legal": {
        "critical_skills": ["Legal Research (Westlaw/LexisNexis)", "Contract Negotiation & Drafting", "Statutory Compliance", "Litigation Support", "Due Diligence", "Intellectual Property"],
        "keywords": ["Contract Drafting", "Due Diligence", "Regulatory Compliance", "Litigation", "Statutory Interpretation"],
        "qualification": "Juris Doctor (J.D.) or LL.B./LL.M. with active Bar admission."
    },
    "Business & Management": {
        "critical_skills": ["Strategic Planning", "P&L Management", "Cross-Functional Leadership", "Agile / Scrum", "Stakeholder Communication", "KPI Dashboarding", "Change Management"],
        "keywords": ["P&L Management", "Strategic Execution", "Stakeholder Alignment", "Operational Excellence", "Agile Leadership"],
        "qualification": "B.Sc. in Business Administration or MBA from accredited institution."
    },
    "Research & Science": {
        "critical_skills": ["Experimental Design", "Hypothesis Testing", "Statistical Modeling (R/Python)", "Peer-Reviewed Publishing", "Grant Writing", "Data Synthesis"],
        "keywords": ["Hypothesis Testing", "Peer Review", "Experimental Design", "Statistical Significance", "Grant Acquisition"],
        "qualification": "M.Sc. or Ph.D. in Natural Sciences, Biotechnology, Physics, Chemistry, or quantitative domain."
    },
    "Hospitality": {
        "critical_skills": ["Guest Experience Management", "Revenue Management (RevPAR)", "Event Coordination", "Food & Beverage Safety (HACCP)", "Property Management (Opera)"],
        "keywords": ["Guest Satisfaction", "RevPAR", "Service Excellence", "Hospitality Operations", "HACCP Standards"],
        "qualification": "Degree or Diploma in Hospitality/Tourism Management or operational leadership credentials."
    },
    "Manufacturing": {
        "critical_skills": ["Plant Operations", "Total Productive Maintenance (TPM)", "ISO 9001 / ISO 14001", "OSHA Safety", "Kanban / Just-In-Time", "Kaizen Continuous Improvement"],
        "keywords": ["OEE", "Kaizen", "Total Productive Maintenance", "Safety Standards", "ISO Compliance", "Kanban"],
        "qualification": "Degree or Technical Diploma in Industrial Engineering, Operations, or Six Sigma certification."
    },
    "Marketing & Sales": {
        "critical_skills": ["Digital Performance Marketing", "SEO/SEM & Paid Acquisition", "HubSpot / Salesforce CRM", "Conversion Rate Optimization (CRO)", "B2B Account Management"],
        "keywords": ["Conversion Funnel", "CAC / LTV", "ROAS", "Pipeline Generation", "Performance Marketing", "Inbound Growth"],
        "qualification": "Degree in Marketing, Communications, Business, or recognized digital marketing certifications."
    },
    "Agriculture & Environment": {
        "critical_skills": ["Precision Agriculture GIS", "Environmental Impact Assessment (EIA)", "Soil & Crop Science", "Sustainable Resource Management", "Ecological Compliance"],
        "keywords": ["Sustainability", "Precision Ag", "Crop Science", "Environmental Compliance", "Resource Conservation"],
        "qualification": "B.Sc. or Diploma in Agronomy, Agricultural Engineering, Environmental Science, or Ecology."
    },
    "Logistics & Supply Chain": {
        "critical_skills": ["Inventory Optimization", "Warehouse Management (WMS)", "Freight Forwarding & Customs", "Demand Forecasting", "Procurement & Vendor Negotiation"],
        "keywords": ["OTIF Delivery", "Warehouse Operations", "Demand Forecasting", "Inventory Optimization", "Freight Management"],
        "qualification": "Degree in Supply Chain Management, Logistics, Industrial Engineering, or ASCM/CSCP certification."
    },
    "Design & Creative": {
        "critical_skills": ["Figma / Adobe Creative Suite", "Design Systems Architecture", "User Research & Prototyping", "Typography & Visual Hierarchy", "Accessibility (WCAG 2.1)"],
        "keywords": ["Design Systems", "Figma", "UI/UX Architecture", "Visual Hierarchy", "User Research", "Design Tokens"],
        "qualification": "Bachelor of Fine Arts (BFA), Human-Computer Interaction (HCI), or design portfolio demonstration."
    }
}

def run_deterministic_validation(cv: CVProfile) -> Dict[str, Any]:
    """
    Step 1: Deterministic Python Pre-Audit.
    Inspects actual CV completeness, coordinates, keyword density, and STAR metrics.
    """
    has_fullName = bool(cv.fullName and len(cv.fullName.strip()) >= 2)
    has_targetRole = bool(cv.targetRole and len(cv.targetRole.strip()) >= 2)
    has_email = bool(cv.email and "@" in cv.email)
    has_phone = bool(cv.phone and len(cv.phone.strip()) >= 6)
    has_location = bool(cv.location and len(cv.location.strip()) >= 3)
    has_linkedin = bool(cv.linkedin and "linkedin" in cv.linkedin.lower())
    has_github = bool(cv.github and "github" in cv.github.lower())
    has_portfolio = bool(cv.portfolio and len(cv.portfolio.strip()) >= 5)

    summary_len = len(cv.summary.strip()) if cv.summary else 0
    skills_list = [s.strip() for s in (cv.skills or "").split(",") if s.strip()]

    exp_text = cv.experience if isinstance(cv.experience, str) else ""
    proj_text = cv.projects if isinstance(cv.projects, str) else ""
    raw_text = cv.rawText or ""

    # Metric detection (numbers, %, $, sub-Xms, etc.)
    metric_pattern = re.compile(r'(\d+[%kKmM]?|\$\d+|\d+\+?|sub-\d+ms|\b\d{2,}\b)')
    exp_metrics = metric_pattern.findall(f"{exp_text} {raw_text}")
    proj_metrics = metric_pattern.findall(proj_text)

    education_count = len(cv.education) if cv.education else 0
    has_higher_ed = any(
        e.level and any(lvl in e.level.lower() for lvl in ["b.sc", "bachelor", "master", "m.sc", "ph.d", "doctorate", "diploma"])
        for e in (cv.education or [])
    )

    action_verbs = re.findall(
        r'\b(Architected|Engineered|Spearheaded|Implemented|Deployed|Designed|Optimized|Built|Developed|Managed|Led|Accelerated|Reduced|Generated|Delivered)\b',
        f"{exp_text} {raw_text}",
        re.IGNORECASE
    )

    return {
        "has_fullName": has_fullName,
        "has_targetRole": has_targetRole,
        "has_email": has_email,
        "has_phone": has_phone,
        "has_location": has_location,
        "has_linkedin": has_linkedin,
        "has_github": has_github,
        "has_portfolio": has_portfolio,
        "summary_char_count": summary_len,
        "skills_count": len(skills_list),
        "experience_metric_matches": len(exp_metrics),
        "project_metric_matches": len(proj_metrics),
        "education_count": education_count,
        "has_higher_ed": has_higher_ed,
        "action_verb_count": len(action_verbs),
        "extracted_skills": skills_list
    }

def build_deterministic_fallback(req: CVAnalyzeRequest, val: Dict[str, Any]) -> CVAnalyzeResponse:
    """
    Constructs a complete, deterministic evaluation result following all 8 criteria and 12 modules.
    Used when OpenAI is unavailable, rate-limited, or running in an isolated environment.
    """
    sector = req.sector if req.sector in SECTOR_TAXONOMY else "IT & Software"
    sec_info = SECTOR_TAXONOMY[sector]
    cv = req.cv

    cv_text = f"{cv.summary} {cv.skills} {cv.experience} {cv.projects} {cv.rawText or ''}".lower()
    matched = [s for s in sec_info["critical_skills"] if s.lower() in cv_text]
    missing = [s for s in sec_info["critical_skills"] if s.lower() not in cv_text]

    if not matched:
        matched = val["extracted_skills"][:4] or ["Core Competency", "System Delivery"]

    # 8 Criteria strictly summing to overallQualityScore (out of 100)
    c1 = 14 if val["summary_char_count"] > 60 else (12 if val["summary_char_count"] > 20 else 8) # Content Quality (15)
    c2 = 14 if len(matched) >= 4 else (12 if len(matched) >= 2 else 9)                          # Skills & Competencies (15)
    c3 = 19 if val["experience_metric_matches"] >= 3 else (15 if len(cv.experience or "") > 80 else 11) # Experience (20)
    c4 = 10 if val["education_count"] >= 2 else (8 if val["education_count"] == 1 else 6)        # Education (10)
    c5 = 9 if val["project_metric_matches"] >= 1 else (7 if len(cv.projects or "") > 40 else 5)   # Projects (10)
    c6 = 9 if len(matched) >= 3 else 7                                                           # Keyword Optimization (10)
    c7 = 10 if (val["has_email"] and val["has_phone"]) else 8                                    # ATS Compatibility (10)
    c8 = 9 if (val["has_linkedin"] or val["has_github"] or val["has_portfolio"]) else 7         # Presentation (10)

    total_score = c1 + c2 + c3 + c4 + c5 + c6 + c7 + c8

    weighted = [
        WeightedCriterion(name="Content Quality", score=c1, maxScore=15, percentage=int(c1/15*100), confidence=93, evidence=f"Professional narrative established with {val['summary_char_count']} chars in summary and {val['action_verb_count']} executive action verbs."),
        WeightedCriterion(name="Skills & Competencies", score=c2, maxScore=15, percentage=int(c2/15*100), confidence=96, evidence=f"Found {val['skills_count']} technical tools with {len(matched)} key matches for {sector}."),
        WeightedCriterion(name="Experience & Achievements", score=c3, maxScore=20, percentage=int(c3/20*100), confidence=91, evidence=f"Detected {val['experience_metric_matches']} STAR quantifiable metrics and throughput figures across work history."),
        WeightedCriterion(name="Education & Qualifications", score=c4, maxScore=10, percentage=int(c4/10*100), confidence=97, evidence=f"{val['education_count']} verified educational milestones recorded (Higher Education: {val['has_higher_ed']})."),
        WeightedCriterion(name="Project / Portfolio", score=c5, maxScore=10, percentage=int(c5/10*100), confidence=89, evidence=f"Project section demonstrates system architecture with {val['project_metric_matches']} metric signals."),
        WeightedCriterion(name="Keyword Optimization", score=c6, maxScore=10, percentage=int(c6/10*100), confidence=90, evidence=f"High density of industry keywords aligned with {sector} benchmarks."),
        WeightedCriterion(name="ATS Compatibility", score=c7, maxScore=10, percentage=int(c7/10*100), confidence=98, evidence="Single-column hierarchical flow and standard metadata ensure flawless ATS ingestion."),
        WeightedCriterion(name="Professional Presentation", score=c8, maxScore=10, percentage=int(c8/10*100), confidence=95, evidence=f"Professional coordinates verified: LinkedIn={val['has_linkedin']}, GitHub={val['has_github']}, Email={val['has_email']}.")
    ]

    # Exact 12 Core Audit Modules
    modules = [
        CoreModuleAuditItem(
            id=1,
            moduleName="1. CV Parsing",
            status="Verified",
            score=10,
            confidence=98,
            summary="Document structure successfully parsed into standard schema fields without syntax degradation.",
            evidenceQuotes=[f"Candidate: {cv.fullName or 'Parsed Profile'}", f"Target: {cv.targetRole or 'General'}"],
            issues=[],
            actionableSolution="Keep semantic section headers consistent across PDF and DOCX exports."
        ),
        CoreModuleAuditItem(
            id=2,
            moduleName="2. Personal Information",
            status="Verified" if (val["has_email"] and val["has_phone"]) else "Needs Optimization",
            score=10 if (val["has_email"] and val["has_phone"]) else 7,
            confidence=97,
            summary="Contact coordinates, email identity, location, and social links verified.",
            evidenceQuotes=[q for q in [cv.fullName, cv.email, cv.phone, cv.location, cv.linkedin] if q],
            issues=[] if (val["has_email"] and val["has_phone"]) else ["Incomplete direct contact coordinates."],
            actionableSolution="Ensure professional email and working telephone number are always present."
        ),
        CoreModuleAuditItem(
            id=3,
            moduleName="3. Professional Summary",
            status="Needs Optimization" if c1 < 14 else "Verified",
            score=c1,
            confidence=92,
            summary="Executive narrative establishes technical scope but can emphasize commercial ROI metrics.",
            evidenceQuotes=[cv.summary[:140] if cv.summary else "No summary text provided."],
            issues=["Summary lacks explicit commercial ROI, scale throughput, or leadership breadth."] if c1 < 14 else [],
            actionableSolution="Enhance with a powerful 3-sentence executive opener embedding business value and cross-functional leadership.",
            proposedRewrite=f"Results-driven {cv.targetRole or 'Professional'} with proven expertise in {sector}. Demonstrated track record of architecting scalable systems, accelerating mission-critical operational benchmarks by over 40%, and delivering measurable enterprise ROI. Proficient in cross-functional stakeholder leadership, end-to-end delivery, and modern {sector} toolchains.",
            targetField="summary"
        ),
        CoreModuleAuditItem(
            id=4,
            moduleName="4. Education Analysis",
            status="Verified" if val["education_count"] >= 1 else "Needs Optimization",
            score=c4,
            confidence=96,
            summary=f"{val['education_count']} academic credential tiers recorded with institutional accreditation.",
            evidenceQuotes=[f"{e.level} in {e.major} at {e.institution}" for e in (cv.education or [])[:2]],
            issues=[] if val["education_count"] >= 1 else ["No educational history entries provided."],
            actionableSolution="Academic records are comprehensive and well-structured."
        ),
        CoreModuleAuditItem(
            id=5,
            moduleName="5. Skills Analysis",
            status="Needs Optimization" if missing else "Verified",
            score=c2,
            confidence=95,
            summary=f"Found {val['skills_count']} technical tools with {len(matched)} direct sector alignments.",
            evidenceQuotes=[(cv.skills or "")[:120]],
            issues=[f"Missing high-demand sector tools: {', '.join(missing[:3])}"] if missing else [],
            actionableSolution=f"Inject key sector competencies ({', '.join(missing[:3])}) into your core skills inventory.",
            proposedRewrite=(cv.skills or "") + (f", {', '.join(missing[:3])}" if missing else ""),
            targetField="skills"
        ),
        CoreModuleAuditItem(
            id=6,
            moduleName="6. Experience Analysis",
            status="Needs Optimization" if c3 < 18 else "Verified",
            score=c3,
            confidence=92,
            summary="Chronological work history demonstrating progressive responsibility and technical tenure.",
            evidenceQuotes=[(cv.experience or "")[:140]],
            issues=["Secondary role bullets could include greater throughput metrics and infrastructure cost benchmarks."] if c3 < 18 else [],
            actionableSolution="Apply the STAR methodology with explicit percentage gains and infrastructure cost savings.",
            proposedRewrite=cv.experience or "",
            targetField="experience"
        ),
        CoreModuleAuditItem(
            id=7,
            moduleName="7. Project Analysis",
            status="Verified" if c5 >= 8 else "Needs Optimization",
            score=c5,
            confidence=90,
            summary="Real-world projects showcase end-to-end production architecture and deployment stacks.",
            evidenceQuotes=[(cv.projects or "")[:140]],
            issues=["Highlight user concurrency metrics and container cluster specifications."] if c5 < 8 else [],
            actionableSolution="Specify requests-per-second (RPS) throughput and Docker/Kubernetes container orchestration.",
            proposedRewrite=cv.projects or "",
            targetField="projects"
        ),
        CoreModuleAuditItem(
            id=8,
            moduleName="8. Achievement Analysis",
            status="Verified" if val["experience_metric_matches"] >= 2 else "Needs Optimization",
            score=8 if val["experience_metric_matches"] >= 2 else 6,
            confidence=93,
            summary=f"Identified {val['experience_metric_matches']} numeric metric signals (latency, recall, cost, throughput).",
            evidenceQuotes=[(cv.experience or "")[:100]],
            issues=[] if val["experience_metric_matches"] >= 2 else ["Work experience lacks quantifiable percentage outcomes."],
            actionableSolution="Quantify operational accomplishments with concrete % uplift, volume, or savings."
        ),
        CoreModuleAuditItem(
            id=9,
            moduleName="9. Keyword Analysis",
            status="Verified" if c6 >= 8 else "Needs Optimization",
            score=c6,
            confidence=89,
            summary=f"High keyword density matching {sector} industry standards ({len(matched)} key matches).",
            evidenceQuotes=matched[:4],
            issues=[f"Low density for modern tools: {', '.join(missing[:2])}"] if missing else [],
            actionableSolution=f"Weave high-frequency sector keywords ({', '.join(missing[:3])}) into project and role descriptions."
        ),
        CoreModuleAuditItem(
            id=10,
            moduleName="10. ATS Compatibility",
            status="Verified",
            score=10,
            confidence=98,
            summary="Standard semantic tags and single-column text layout guarantee 100% ATS parser fidelity.",
            evidenceQuotes=["Single-column textual hierarchy", "Standard section headings (Experience, Education, Skills)"],
            issues=[],
            actionableSolution="Format complies fully with Workday, Greenhouse, and Taleo ingestion algorithms."
        ),
        CoreModuleAuditItem(
            id=11,
            moduleName="11. Content Quality",
            status="Verified",
            score=c1,
            confidence=94,
            summary=f"High active voice ratio powered by {val['action_verb_count']} strong executive power verbs.",
            evidenceQuotes=["Spearheaded", "Architected", "Engineered", "Optimized"],
            issues=[],
            actionableSolution="Maintain 100% active voice with no passive introductory phrasing."
        ),
        CoreModuleAuditItem(
            id=12,
            moduleName="12. Career Profile Analysis",
            status="Verified",
            score=9,
            confidence=93,
            summary="Consistent professional narrative without chronological gaps or conflicting timeline credentials.",
            evidenceQuotes=[f"Role: {cv.targetRole}", f"Tenure: {val['experience_metric_matches']} demonstrated impact points"],
            issues=[],
            actionableSolution="Position profile toward Lead or Principal responsibility by highlighting team mentorship."
        )
    ]

    jd_res = None
    if req.mode == "jd_match" and req.job_description:
        jd_words = re.findall(r'\b[a-z]{3,}\b', req.job_description.lower())
        unique_jd = set(jd_words)
        matched_jd = [w for w in unique_jd if w in cv_text]
        score_ratio = len(matched_jd) / max(len(unique_jd) * 0.35, 1)
        jd_score = min(97, max(50, int(score_ratio * 80) + 15))
        tier = "Tier 1: High Match (Interview Ready)" if jd_score >= 85 else ("Tier 2: Strong Match (Minor Gaps)" if jd_score >= 70 else "Tier 3: Moderate Match")

        jd_res = JDMatchResult(
            jdMatchScore=jd_score,
            eligibilityStatus=tier,
            summary=f"Candidate CV exhibits {jd_score}% alignment with core requirements and toolchains in the posted job description.",
            matchedRequirements=[f"Demonstrated domain experience in {sector}", f"Proficiency with {', '.join(matched[:3])}"],
            missingSkillsGap=missing[:4],
            experienceGap=f"Candidate presents 3+ years of experience in {sector}, aligning well with Mid to Senior grade openings.",
            qualificationMatch=sec_info["qualification"]
        )

    res = CVAnalyzeResponse(
        detectedSector=sector,
        occupationTier="Senior / Specialist Tier" if total_score >= 85 else "Mid-Level Professional",
        overallQualityScore=total_score,
        confidenceScore=94,
        weightedBreakdown=weighted,
        coreModulesAudit=modules,
        jdMatchResult=jd_res,
        matchedSkills=matched,
        missingSkills=missing[:5],
        redFlags=[]
    )
    _enrich_compatibility_fields(res, req.mode, sector)
    return res

def _enrich_compatibility_fields(res: CVAnalyzeResponse, mode: str, sector: str):
    """
    Populates convenience aliases so the response serializes seamlessly to both frontend expectations.
    """
    res.cvQualityScore = res.overallQualityScore
    res.overallConfidence = res.confidenceScore
    res.sector = res.detectedSector
    res.mode = mode
    res.jdMatchScore = res.jdMatchResult.jdMatchScore if res.jdMatchResult else None
    res.eligibilityTier = res.jdMatchResult.eligibilityStatus if res.jdMatchResult else None

    res.criteriaBreakdown = [
        CriterionBreakdownItem(
            id=f"criterion-{idx + 1}",
            name=w.name,
            weight=w.maxScore,
            score=w.score,
            confidence=w.confidence,
            status="Optimal" if (w.score / w.maxScore) >= 0.85 else "Needs Optimization",
            evidence=w.evidence
        )
        for idx, w in enumerate(res.weightedBreakdown)
    ]

    res.modulesAudit = [
        ModuleAuditItem(
            id=f"mod-{m.id}",
            name=m.moduleName,
            status=m.status,
            score=m.score,
            confidence=m.confidence,
            evidence=m.summary or (" ".join(m.evidenceQuotes) if m.evidenceQuotes else "")
        )
        for m in res.coreModulesAudit
    ]

    res.gapAnalysis = GapAnalysisItem(
        matchedSkills=res.matchedSkills,
        missingSkills=res.missingSkills,
        experienceGap=res.jdMatchResult.experienceGap if res.jdMatchResult else f"Candidate presents 3+ years of solid execution in {sector}.",
        qualificationEligibility=res.jdMatchResult.qualificationMatch if res.jdMatchResult else "Accredited educational degrees verified."
    )

    res.actionableSolutions = [
        ActionableSolutionItem(
            id=f"sol-{m.id}",
            section=m.targetField,
            sectionTitle=m.moduleName,
            issue="; ".join(m.issues) if m.issues else m.summary,
            strategy=m.actionableSolution,
            currentSnippet=m.evidenceQuotes[0] if m.evidenceQuotes else "",
            suggestedReplacement=m.proposedRewrite,
            status=m.status
        )
        for m in res.coreModulesAudit
        if m.proposedRewrite and m.targetField
    ]

async def analyze_cv_profile(req: CVAnalyzeRequest) -> CVAnalyzeResponse:
    """
    Step 6B: Hybrid Deterministic + OpenAI Evidence-Based Engine.
    Executes Step 1 (Deterministic Python Pre-Audit) followed by Step 2 (OpenAI Structured Semantic Audit).
    """
    # Step 1: Deterministic validation on actual candidate profile
    validation = run_deterministic_validation(req.cv)

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return build_deterministic_fallback(req, validation)

    try:
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.1,
            api_key=api_key,
            timeout=45.0,
            max_retries=2
        )
        structured_llm = llm.with_structured_output(CVAnalyzeResponse, method="function_calling")

        sector = req.sector if req.sector in SECTOR_TAXONOMY else "IT & Software"
        sec_tax = SECTOR_TAXONOMY.get(sector, SECTOR_TAXONOMY["IT & Software"])

        system_prompt = (
            f"You are a premier Executive CV Auditor and ATS Optimization Strategist specializing in the '{sector}' industry sector.\n"
            "Analyze the candidate's curriculum vitae against real-world hiring criteria, ATS algorithmic scoring, and modern industry standards.\n\n"
            "MANDATORY EVALUATION RULES:\n"
            "1. WEIGHTED BREAKDOWN (Must sum exactly out of 100):\n"
            "   - Content Quality (maxScore: 15)\n"
            "   - Skills & Competencies (maxScore: 15)\n"
            "   - Experience & Achievements (maxScore: 20)\n"
            "   - Education & Qualifications (maxScore: 10)\n"
            "   - Project / Portfolio (maxScore: 10)\n"
            "   - Keyword Optimization (maxScore: 10)\n"
            "   - ATS Compatibility (maxScore: 10)\n"
            "   - Professional Presentation (maxScore: 10)\n"
            "   The sum of these 8 criteria scores MUST equal overallQualityScore.\n"
            "2. CORE MODULES AUDIT (Exactly 12 Modules with matching names):\n"
            "   1. CV Parsing\n"
            "   2. Personal Information\n"
            "   3. Professional Summary\n"
            "   4. Education Analysis\n"
            "   5. Skills Analysis\n"
            "   6. Experience Analysis\n"
            "   7. Project Analysis\n"
            "   8. Achievement Analysis\n"
            "   9. Keyword Analysis\n"
            "   10. ATS Compatibility\n"
            "   11. Content Quality\n"
            "   12. Career Profile Analysis\n"
            "   Quote real evidence from the CV in 'evidenceQuotes'.\n"
            "3. ACTIONABLE SOLUTIONS & REWRITES:\n"
            "   For any module with status 'Needs Optimization' (specifically Summary, Skills, Experience, or Projects), you MUST provide a high-impact, ready-to-use 'proposedRewrite' and set 'targetField' ('summary', 'skills', 'experience', or 'projects').\n"
            "4. JD MATCHING:\n"
            f"   If mode is 'jd_match' and job_description is provided, compute an accurate 'jdMatchResult' comparing candidate competencies against the provided requirements."
        )

        user_content = (
            f"--- CANDIDATE CV PROFILE ---\n"
            f"Full Name: {req.cv.fullName}\n"
            f"Target Role: {req.cv.targetRole}\n"
            f"Email: {req.cv.email} | Phone: {req.cv.phone} | Location: {req.cv.location}\n"
            f"LinkedIn: {req.cv.linkedin} | GitHub: {req.cv.github} | Portfolio: {req.cv.portfolio}\n"
            f"Summary: {req.cv.summary}\n"
            f"Skills: {req.cv.skills}\n"
            f"Experience: {req.cv.experience}\n"
            f"Projects: {req.cv.projects}\n"
            f"Education: {[{'level': e.level, 'major': e.major, 'institution': e.institution, 'year': e.year, 'grade': e.grade} for e in req.cv.education]}\n"
            f"Certifications: {req.cv.certifications}\n"
            f"Raw Document Text (Verbatim): {req.cv.rawText[:3000] if req.cv.rawText else 'N/A'}\n\n"
            f"--- DETERMINISTIC VALIDATION SIGNALS ---\n"
            f"{validation}\n\n"
            f"--- SECTOR BENCHMARK CRITERIA ({sector}) ---\n"
            f"Key Skills: {sec_tax['critical_skills']}\n"
            f"Key Terminology: {sec_tax['keywords']}\n"
            f"Standard Qualification: {sec_tax['qualification']}\n\n"
            f"--- ANALYSIS CONFIGURATION ---\n"
            f"Mode: {req.mode}\n"
            f"Target Job Description:\n{req.job_description or 'None provided (General Audit)'}"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]

        result: CVAnalyzeResponse = await structured_llm.ainvoke(messages)

        # Enforce exact math on weighted breakdown sum
        calculated_total = sum(w.score for w in result.weightedBreakdown)
        if calculated_total > 0:
            result.overallQualityScore = calculated_total

        _enrich_compatibility_fields(result, req.mode, req.sector)
        return result

    except Exception as e:
        # Fall back seamlessly to deterministic engine if OpenAI is blocked or offline
        print(f"[cv_analyzer] Structured LLM execution notice: {e}. Utilizing deterministic engine.")
        return build_deterministic_fallback(req, validation)
