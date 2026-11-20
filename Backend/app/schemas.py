from typing import List, Optional, Any, Union
from pydantic import BaseModel, Field, model_validator, ConfigDict

class ExperienceItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default="", description="Unique identifier for the experience entry")
    role: str = Field(default="", description="Job title or position held")
    company: str = Field(default="", description="Company or organization name")
    duration: str = Field(default="", description="Employment timeline, e.g. 2023 - Present")
    location: str = Field(default="", description="City, country or remote status")
    description: str = Field(default="", description="Key achievements, impact bullets, or responsibilities")

class ProjectItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default="", description="Unique identifier for the project entry")
    title: str = Field(default="", description="Project title or system name")
    techStack: str = Field(default="", description="Technologies, libraries, and frameworks used")
    link: str = Field(default="", description="Live deployment, repository, or demo URL")
    description: str = Field(default="", description="Technical implementation details and outcomes")

class EducationItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    level: str = Field(default="", description="Educational level, e.g. Ph.D., M.Sc., B.Sc., HSC, SSC, A-Level, O-Level")
    major: str = Field(default="", description="Major, department, or group of study, e.g. Computer Science, Science")
    institution: str = Field(default="", description="University, college, school, or board name")
    year: str = Field(default="", description="Passing year or graduation timeline, e.g. 2024 or 2020 - 2024")
    grade: str = Field(default="", description="Grade, CGPA, GPA, or thesis result status")

class RedFlagItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    issue: str = Field(default="", description="Summary of the potential red flag or anomaly")
    evidence: str = Field(default="", description="Evidence quote or pattern from the resume")
    fix: str = Field(default="", description="Recommended correction or mitigation strategy")

class CriterionBreakdownItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default="", description="Criterion identifier")
    name: str = Field(default="", description="Criterion name")
    weight: int = Field(default=10, description="Max possible weight")
    score: int = Field(default=0, description="Score awarded")
    confidence: int = Field(default=90, description="Evaluation confidence")
    status: str = Field(default="Optimal", description="Status")
    evidence: str = Field(default="", description="Audit evidence")

class ModuleAuditItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default="", description="Module identifier")
    name: str = Field(default="", description="Module name")
    status: str = Field(default="Verified", description="Verification status")
    score: int = Field(default=10, description="Score awarded out of 10")
    maxScore: int = Field(default=10, description="Max module score (10)")
    confidence: int = Field(default=90, description="Confidence percentage")
    evidence: str = Field(default="", description="Module audit summary or evidence")

class GapAnalysisItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    matchedSkills: List[str] = Field(default_factory=list, description="Verified skills")
    missingSkills: List[str] = Field(default_factory=list, description="Missing high-demand skills")
    experienceGap: str = Field(default="", description="Seniority and domain depth gap")
    qualificationEligibility: str = Field(default="", description="Educational qualification alignment")

class ActionableSolutionItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default="", description="Solution ID")
    section: str = Field(default="", description="Target CV field name")
    sectionTitle: str = Field(default="", description="Display title of the section")
    issue: str = Field(default="", description="Audit weakness detected")
    strategy: str = Field(default="", description="Optimization strategy")
    currentSnippet: str = Field(default="", description="Current text quote from CV")
    suggestedReplacement: str = Field(default="", description="Ready-to-use proposed rewrite")
    status: str = Field(default="Needs Optimization", description="Audit status")

class CVProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    fullName: str = Field(default="", description="Candidate full legal or professional name")
    targetRole: str = Field(default="", description="Primary job title or career target")
    email: str = Field(default="", description="Contact email address")
    phone: str = Field(default="", description="Contact phone or mobile number")
    location: str = Field(default="", description="City and country of residence")
    linkedin: str = Field(default="", description="LinkedIn profile URL")
    github: str = Field(default="", description="GitHub profile URL")
    portfolio: str = Field(default="", description="Personal website or portfolio URL")
    summary: str = Field(default="", description="Executive career summary and professional narrative")
    skills: Union[str, List[str]] = Field(default="", description="Comma-separated string or list of technical skills")
    experience: Union[str, List[ExperienceItem], List[dict]] = Field(default="", description="Chronological work experience entries")
    projects: Union[str, List[ProjectItem], List[dict]] = Field(default="", description="Key software or research projects")
    education: Union[str, List[EducationItem], List[dict]] = Field(default_factory=list, description="Array of multi-level academic credentials")
    certifications: Union[str, List[str]] = Field(default="", description="List of recognized industry certifications and honors")
    rawText: Optional[str] = Field(default="", description="Verbatim raw text extracted from uploaded resume file")
    experienceList: Optional[List[Any]] = Field(default_factory=list, description="Structured work experience entries list")
    projectsList: Optional[List[Any]] = Field(default_factory=list, description="Structured key projects entries list")

    @model_validator(mode='before')
    @classmethod
    def normalize_fields_before(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Normalize experienceList and experience
            exp = data.get("experience")
            exp_list = data.get("experienceList")
            if isinstance(exp, list) and not exp_list:
                data["experienceList"] = exp
            elif not exp and isinstance(exp_list, list):
                data["experience"] = exp_list

            # Normalize projectsList and projects
            proj = data.get("projects")
            proj_list = data.get("projectsList")
            if isinstance(proj, list) and not proj_list:
                data["projectsList"] = proj
            elif not proj and isinstance(proj_list, list):
                data["projects"] = proj_list

        return data

    def get_clean_skills(self) -> str:
        """Returns skills cleanly formatted as a comma-separated string."""
        if isinstance(self.skills, list):
            return ", ".join(str(s).strip() for s in self.skills if str(s).strip())
        return str(self.skills or "").strip()

    def get_skills_list(self) -> List[str]:
        """Returns skills cleanly as a list of strings."""
        if isinstance(self.skills, list):
            return [str(s).strip() for s in self.skills if str(s).strip()]
        if isinstance(self.skills, str) and self.skills.strip():
            return [s.strip() for s in self.skills.split(",") if s.strip()]
        return []

    def get_clean_experience(self) -> str:
        """Returns work experience formatted as clean readable text blocks."""
        if isinstance(self.experience, str) and self.experience.strip():
            return self.experience.strip()
        if isinstance(self.experience, list):
            blocks = []
            for item in self.experience:
                if isinstance(item, dict):
                    hdr = " | ".join(str(item.get(k, "")).strip() for k in ("role", "company", "duration", "location") if item.get(k))
                    desc = str(item.get("description", "")).strip()
                    blocks.append(f"{hdr}\n{desc}".strip() if hdr else desc)
                elif hasattr(item, 'role'):
                    hdr = " | ".join(filter(None, [getattr(item, 'role', ''), getattr(item, 'company', ''), getattr(item, 'duration', ''), getattr(item, 'location', '')]))
                    desc = getattr(item, 'description', '')
                    blocks.append(f"{hdr}\n{desc}".strip() if hdr else desc)
                elif isinstance(item, str) and item.strip():
                    blocks.append(item.strip())
            return "\n\n".join(b for b in blocks if b)
        return ""

    def get_clean_projects(self) -> str:
        """Returns projects formatted as clean readable text blocks."""
        if isinstance(self.projects, str) and self.projects.strip():
            return self.projects.strip()
        if isinstance(self.projects, list):
            blocks = []
            for item in self.projects:
                if isinstance(item, dict):
                    parts = []
                    if item.get("title"): parts.append(str(item.get("title")).strip())
                    if item.get("techStack"): parts.append(f"Stack: {str(item.get('techStack')).strip()}")
                    if item.get("link"): parts.append(str(item.get("link")).strip())
                    hdr = " | ".join(parts)
                    desc = str(item.get("description", "")).strip()
                    blocks.append(f"{hdr}\n{desc}".strip() if hdr else desc)
                elif hasattr(item, 'title'):
                    parts = [getattr(item, 'title', '')]
                    if getattr(item, 'techStack', ''): parts.append(f"Stack: {getattr(item, 'techStack', '')}")
                    if getattr(item, 'link', ''): parts.append(getattr(item, 'link', ''))
                    hdr = " | ".join(filter(None, parts))
                    desc = getattr(item, 'description', '')
                    blocks.append(f"{hdr}\n{desc}".strip() if hdr else desc)
                elif isinstance(item, str) and item.strip():
                    blocks.append(item.strip())
            return "\n\n".join(b for b in blocks if b)
        return ""

    def get_clean_education(self) -> str:
        """Returns education formatted as clean readable summary text."""
        if isinstance(self.education, str) and self.education.strip():
            return self.education.strip()
        if isinstance(self.education, list):
            items = []
            for e in self.education:
                if isinstance(e, dict):
                    lvl = e.get('level', '')
                    maj = e.get('major', '')
                    inst = e.get('institution', '')
                    yr = e.get('year', '')
                    grd = e.get('grade', '')
                    desc = f"{lvl} in {maj} from {inst} ({yr}, {grd})".replace(" ()", "").strip()
                    if desc: items.append(desc)
                elif hasattr(e, 'level'):
                    desc = f"{e.level} in {e.major} from {e.institution} ({e.year}, {e.grade})".replace(" ()", "").strip()
                    if desc: items.append(desc)
                elif isinstance(e, str) and e.strip():
                    items.append(e.strip())
            return "; ".join(items)
        return ""

    def get_education_items(self) -> List[EducationItem]:
        """Returns education items guaranteed as EducationItem instances."""
        if not self.education:
            return []
        if isinstance(self.education, list):
            result = []
            for e in self.education:
                if isinstance(e, EducationItem):
                    result.append(e)
                elif isinstance(e, dict):
                    result.append(EducationItem(
                        level=str(e.get("level", "")),
                        major=str(e.get("major", "")),
                        institution=str(e.get("institution", "")),
                        year=str(e.get("year", "")),
                        grade=str(e.get("grade", ""))
                    ))
            return result
        return []

    def get_clean_certifications(self) -> str:
        """Returns certifications formatted as readable newline-delimited text."""
        if isinstance(self.certifications, list):
            return "\n".join(str(c).strip() for c in self.certifications if str(c).strip())
        return str(self.certifications or "").strip()

    def to_clean_text(self) -> dict:
        """
        Returns a dictionary with clean string representations of all major CV sections:
        'experience', 'projects', 'education', 'skills', 'summary', 'certifications', 'rawText'.
        Gracefully handles both list and string inputs without throwing errors.
        """
        return {
            "fullName": str(self.fullName or "").strip(),
            "targetRole": str(self.targetRole or "").strip(),
            "email": str(self.email or "").strip(),
            "phone": str(self.phone or "").strip(),
            "location": str(self.location or "").strip(),
            "linkedin": str(self.linkedin or "").strip(),
            "github": str(self.github or "").strip(),
            "portfolio": str(self.portfolio or "").strip(),
            "summary": str(self.summary or "").strip(),
            "skills": self.get_clean_skills(),
            "experience": self.get_clean_experience(),
            "projects": self.get_clean_projects(),
            "education": self.get_clean_education(),
            "certifications": self.get_clean_certifications(),
            "rawText": str(self.rawText or "").strip(),
        }

    @staticmethod
    def _parse_exp_str_to_list(text: str) -> List[dict]:
        if not text:
            return []
        blocks = [b.strip() for b in text.split("\n\n") if b.strip()]
        result = []
        for idx, block in enumerate(blocks):
            lines = [l.strip() for l in block.split("\n") if l.strip()]
            if not lines:
                continue
            parts = [p.strip() for p in lines[0].split("|")]
            desc = "\n".join(lines[1:])
            result.append({
                "id": f"exp-{idx + 1}",
                "role": parts[0] if len(parts) > 0 else "",
                "company": parts[1] if len(parts) > 1 else "",
                "duration": parts[2] if len(parts) > 2 else "",
                "location": parts[3] if len(parts) > 3 else "",
                "description": desc
            })
        return result

    @staticmethod
    def _parse_proj_str_to_list(text: str) -> List[dict]:
        if not text:
            return []
        blocks = [b.strip() for b in text.split("\n\n") if b.strip()]
        result = []
        for idx, block in enumerate(blocks):
            lines = [l.strip() for l in block.split("\n") if l.strip()]
            if not lines:
                continue
            parts = [p.strip() for p in lines[0].split("|")]
            title = parts[0] if len(parts) > 0 else ""
            tech_stack = ""
            link = ""
            for p in parts[1:]:
                if p.lower().startswith("stack:"):
                    tech_stack = p[6:].strip()
                elif "http" in p or "github" in p or ".com" in p:
                    link = p.strip()
                elif not tech_stack:
                    tech_stack = p.strip()
            desc = "\n".join(lines[1:])
            result.append({
                "id": f"proj-{idx + 1}",
                "title": title,
                "techStack": tech_stack,
                "link": link,
                "description": desc
            })
        return result

class JobFilters(BaseModel):
    model_config = ConfigDict(extra="ignore")
    region: str = Field(default="Asia", description="Global continent or region (Asia, Europe, North America, etc.)")
    country: str = Field(default="Bangladesh", description="Target country")
    state: str = Field(default="", description="State, province, or division")
    city: str = Field(default="", description="Target metropolitan city")
    jobType: str = Field(default="All", description="Work mode: All, Remote, On-site, Hybrid")
    employment: str = Field(default="All", description="Employment type: All, Full-time, Part-time, Contract, Internship")
    experience: str = Field(default="All", description="Seniority level: All, Entry, Mid, Senior, Lead / Principal")
    industry: str = Field(default="All", description="Target industry sector")
    salary: str = Field(default="Any Salary", description="Desired salary range")
    workAuth: str = Field(default="Any", description="Work authorization or visa requirement")

class CareerPredictRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    cv: CVProfile
    filters: JobFilters = Field(default_factory=JobFilters)

class CareerPathItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    rank: int = Field(default=1, description="Sequential rank (1 to N) strictly ordered by matchScore descending")
    title: str = Field(default="", description="Recommended career trajectory or target job title")
    trackCategory: str = Field(default="Core Domain Role", description="Career track category: 'Core Domain Role', 'Academic & Research Track', 'AI / Data & Specialization', 'Adjacent & Interdisciplinary', 'Management & Strategy'")
    matchScore: int = Field(default=85, description="Match percentage score between 0 and 100")
    salaryRange: str = Field(default="", description="Realistic market salary range in target country/region")
    demandLevel: str = Field(default="High Demand", description="Market hiring demand level, e.g. High Demand, Rapid Growth, Steady")
    reasoning: str = Field(default="", description="Explanation citing degree, CGPA/grades, skills, projects, or experience from CV")
    matchedSkills: List[str] = Field(default_factory=list, description="Candidate skills already aligned with this path")
    missingSkills: List[str] = Field(default_factory=list, description="Key skills recommended to achieve 100% fit")
    recommendedNextStep: str = Field(default="", description="High-priority actionable recommendation for this path")

class CareerPredictResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    detectedDiscipline: str = Field(default="Cross-Disciplinary & Applied Sciences", description="Primary academic and professional discipline detected from the CV")
    academicEligibilityNote: str = Field(default="", description="Academic standing assessment based on candidate CGPA, honors, or thesis credentials")
    candidateSummary: str = Field(default="", description="Holistic assessment of candidate profile and market competitiveness")
    marketInsight: str = Field(default="", description="Real-time regional job market outlook based on search intelligence")
    paths: List[CareerPathItem] = Field(default_factory=list, description="Ranked list of 6 to 8 diverse career path trajectories sorted highest to lowest")

class CVEnhanceRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    section_type: str = Field(default="summary", description="Section to enhance: summary, experience, or projects")
    content: str = Field(default="", description="Raw or rough candidate text to enhance")
    target_role: str = Field(default="", description="Target job title to tailor phrasing towards")

class CVEnhanceResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    enhanced_text: str = Field(default="", description="Executive, metric-driven enhanced text")

# ============================================================================
# Universal Multi-Sector CV Analysis & JD Match Models
# ============================================================================

class CVAnalyzeRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    cv: CVProfile
    mode: str = Field(default="general", description="Analysis mode: 'general' (holistic audit) or 'jd_match' (job-specific match)")
    sector: str = Field(default="IT & Software", description="Target industry sector out of 14 universal sectors")
    job_description: str = Field(default="", description="Target Job Description text for Mode B matching")

class WeightedCriterion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(default="", description="Name of the criterion, e.g. Content Quality")
    score: int = Field(default=0, description="Points awarded for this criterion")
    maxScore: int = Field(default=10, description="Maximum possible points for this criterion")
    percentage: int = Field(default=0, description="Calculated percentage (score / maxScore * 100)")
    confidence: int = Field(default=92, description="Model evaluation confidence percentage (0-100)")
    evidence: str = Field(default="", description="Evidence, observations, and audit rationale for the score")

class CoreModuleAuditItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: int = Field(default=1, description="Module numeric identifier (1-12)")
    moduleName: str = Field(default="", description="Name of the 12 core CV modules audited")
    status: str = Field(default="Verified", description="Audit status: 'Verified', 'Needs Optimization', or 'Critical'")
    score: int = Field(default=10, description="Audit score awarded out of 10")
    maxScore: int = Field(default=10, description="Max module score (10)")
    confidence: int = Field(default=94, description="Confidence rating for this module evaluation (0-100)")
    summary: str = Field(default="", description="Concise assessment of this module")
    evidenceQuotes: List[str] = Field(default_factory=list, description="Direct snippets and extracted facts from CV")
    issues: List[str] = Field(default_factory=list, description="Weaknesses, missing elements, or red flags detected")
    actionableSolution: str = Field(default="", description="Step-by-step strategy to resolve issues")
    proposedRewrite: str = Field(default="", description="AI-generated ready-to-use replacement draft for weak sections")
    targetField: str = Field(default="", description="CV target field to update: 'summary', 'skills', 'experience', 'projects'")

class JDMatchResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    jdMatchScore: int = Field(default=0, description="Overall JD keyword and requirement match percentage (0-100)")
    eligibilityStatus: str = Field(default="", description="Eligibility tier, e.g. 'Tier 1: High Match (Interview Ready)'")
    summary: str = Field(default="", description="Executive narrative on candidate JD fit and alignment")
    matchedRequirements: List[str] = Field(default_factory=list, description="Requirements in the JD directly met by the CV")
    missingSkillsGap: List[str] = Field(default_factory=list, description="Crucial JD requirements or skills absent from the CV")
    experienceGap: str = Field(default="", description="Assessment of seniority, tenure, and scope gaps relative to the JD")
    qualificationMatch: str = Field(default="", description="Assessment of degree and certification alignment with JD requirements")

class CVAnalyzeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    detectedSector: str = Field(default="IT & Software", description="Detected or verified industry sector out of 14 universal sectors")
    occupationTier: str = Field(default="Specialist Tier", description="Candidate career level, e.g. 'Senior / Specialist Tier'")
    overallQualityScore: int = Field(default=85, description="Total weighted CV quality score out of 100")
    confidenceScore: int = Field(default=94, description="Aggregate confidence percentage of the audit")
    weightedBreakdown: List[WeightedCriterion] = Field(default_factory=list, description="Exact 8-criteria weighted quality breakdown (summing to 100)")
    coreModulesAudit: List[CoreModuleAuditItem] = Field(default_factory=list, description="12 core module audit items with evidence quotes and solutions")
    jdMatchResult: Optional[JDMatchResult] = Field(default=None, description="Detailed job description match analysis (populated when mode is jd_match)")
    matchedSkills: List[str] = Field(default_factory=list, description="Sector or JD competencies verified on candidate profile")
    missingSkills: List[str] = Field(default_factory=list, description="High-demand sector or JD competencies missing from candidate profile")
    redFlags: List[RedFlagItem] = Field(default_factory=list, description="List of detected anomalies, unsupported claims, or timeline gaps")

    # Compatibility aliases for direct frontend rendering
    cvQualityScore: Optional[int] = Field(default=None, description="Alias for overallQualityScore")
    overallConfidence: Optional[int] = Field(default=None, description="Alias for confidenceScore")
    sector: Optional[str] = Field(default=None, description="Alias for detectedSector")
    mode: Optional[str] = Field(default=None, description="Echo of requested mode")
    jdMatchScore: Optional[int] = Field(default=None, description="Convenience access to jdMatchResult.jdMatchScore")
    eligibilityTier: Optional[str] = Field(default=None, description="Convenience access to jdMatchResult.eligibilityStatus")
    criteriaBreakdown: Optional[List[CriterionBreakdownItem]] = Field(default=None, description="Frontend-adapted breakdown array")
    modulesAudit: Optional[List[ModuleAuditItem]] = Field(default=None, description="Frontend-adapted 12 module array")
    gapAnalysis: Optional[GapAnalysisItem] = Field(default=None, description="Frontend-adapted gap analysis map")
    actionableSolutions: Optional[List[ActionableSolutionItem]] = Field(default=None, description="Frontend-adapted solutions array")

# ============================================================================
# Live Jobs & ML Fraud Guard Models
# ============================================================================

class JobFraudCheckRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str = Field(default="", description="Job title or headline")
    company: str = Field(default="", description="Company or hiring organization name")
    location: str = Field(default="", description="Location or remote indicator")
    salary: str = Field(default="", description="Offered compensation or hourly/monthly rate")
    recruiterEmail: str = Field(default="", description="Recruiter email address or contact handle")
    applyUrl: str = Field(default="", description="Application URL or messaging link")
    description: str = Field(default="", description="Full job description, requirements, or communication transcript")

class JobFraudCheckResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    fraudProbability: int = Field(default=5, description="Calculated scam/fraud probability (0-100)")
    confidenceScore: int = Field(default=95, description="Model evaluation confidence (0-100)")
    safetyStatus: str = Field(default="Verified Safe", description="'Verified Safe', 'Caution / Unverified', or 'High Scam Risk'")
    modelSource: str = Field(default="Hybrid NLP & Heuristic Classifier", description="Source model used for evaluation")
    riskSignals: List[str] = Field(default_factory=list, description="Human-readable trust and risk evidence signals")

class LiveJobItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default="", description="Unique job listing ID")
    title: str = Field(default="", description="Job title")
    company: str = Field(default="", description="Company name")
    location: str = Field(default="", description="Job location")
    salary: str = Field(default="", description="Salary range")
    jobType: str = Field(default="Full-time", description="Job type, e.g. Full-time, Hybrid, Remote")
    postedAt: str = Field(default="Recently", description="Posting timestamp or relative age")
    source: str = Field(default="Direct Portal", description="Job board source e.g. LinkedIn, Bdjobs, Greenhouse")
    applyUrl: str = Field(default="", description="Direct application link")
    cvMatchScore: int = Field(default=85, description="Candidate CV match percentage (0-100)")
    fraudProbability: int = Field(default=5, description="Scam probability score (0-100)")
    safetyStatus: str = Field(default="Verified Safe", description="'Verified Safe', 'Caution / Unverified', or 'High Scam Risk'")
    riskSignals: List[str] = Field(default_factory=list, description="Trust and risk indicators")
    description: str = Field(default="", description="Job overview, responsibilities, and requirements")

class LiveJobsSearchRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    cv: CVProfile
    filters: JobFilters = Field(default_factory=JobFilters)
    useFilters: bool = Field(default=False, description="When False, searches broad CV-matched live jobs across regions. When True, applies strict location and work filters.")

class LiveJobsSearchResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    jobs: List[LiveJobItem] = Field(default_factory=list, description="List of verified live jobs with ML scam guard evaluations")
    totalFound: int = Field(default=0, description="Total jobs found")
    verifiedSafeCount: int = Field(default=0, description="Count of verified safe listings")
    flaggedCount: int = Field(default=0, description="Count of caution or scam listings")
    queryUsed: str = Field(default="", description="Exact search query used for live web crawl")

class RawExtractedJob(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str = Field(default="", description="Job title")
    company: str = Field(default="", description="Company name")
    location: str = Field(default="", description="City, Country or Remote")
    salary: str = Field(default="Competitive Market Rate", description="Realistic salary range")
    jobType: str = Field(default="Full-time • Hybrid", description="Employment type and work mode")
    postedAt: str = Field(default="Today", description="Relative time posted e.g. 2 hours ago, 1 day ago")
    source: str = Field(default="Corporate Portal", description="Source portal e.g. LinkedIn, Bdjobs, Greenhouse, Indeed")
    applyUrl: str = Field(default="", description="Direct link or corporate portal URL")
    description: str = Field(default="", description="Concise 2-3 sentence summary of the role, responsibilities, and required stack")
    cvMatchScore: int = Field(default=88, description="Relevance and qualification match with candidate CV (0-100)")

class RawExtractedJobsList(BaseModel):
    model_config = ConfigDict(extra="ignore")
    jobs: List[RawExtractedJob] = Field(default_factory=list, description="Extracted list of 6 to 10 live job postings")

# ============================================================================
# Skill Gap & Learning Roadmap Models
# ============================================================================

class LearningResource(BaseModel):
    model_config = ConfigDict(extra="ignore")
    platform: str = Field(default="Official Docs", description="'YouTube', 'Course', 'Official Docs', or 'GitHub / Practice'")
    title: str = Field(default="", description="Educational resource title")
    url: str = Field(default="", description="Verified tutorial, playlist, course, or documentation link")
    duration: str = Field(default="2.0 hrs", description="Estimated study time, e.g. '2.5 hrs'")

class RoadmapMilestone(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default="", description="Milestone ID, e.g. sprint-1")
    weekRange: str = Field(default="Week 01–02", description="Week span, e.g. 'Week 01–02'")
    title: str = Field(default="", description="Milestone sprint title")
    hoursPerWeek: str = Field(default="10–12 hrs/week", description="Weekly time commitment")
    focusSummary: str = Field(default="", description="Core focus and pedagogical objective")
    topics: List[str] = Field(default_factory=list, description="List of key technical topics and competencies")
    capstoneDeliverable: str = Field(default="", description="Hands-on proof-of-work project deliverable")
    resources: List[LearningResource] = Field(default_factory=list, description="Curated multi-platform educational resources")

class SkillGapItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(default="", description="Skill name")
    category: str = Field(default="Core Competency", description="Competency category")
    priority: str = Field(default="Critical", description="'Critical', 'High', or 'Emerging'")
    reason: str = Field(default="", description="Pedagogical and market justification")

class RoadmapGenerateRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    cv: CVProfile
    target_role: str = Field(..., description="Target role title, e.g. 'Senior Machine Learning Engineer'")
    track_category: str = Field(default="Core Domain Role", description="Career trajectory category")
    matched_skills: List[str] = Field(default_factory=list, description="Skills candidate already possesses for this role")
    missing_skills: List[str] = Field(default_factory=list, description="Skills candidate needs to acquire")
    reasoning: str = Field(default="", description="Contextual career recommendation rationale")
    filters: Optional[JobFilters] = Field(default=None, description="Candidate location & industry filters")

class RoadmapGenerateResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    targetRole: str = Field(default="", description="Target job title")
    trackCategory: str = Field(default="Core Domain Role", description="Career track category")
    readinessPercentage: int = Field(default=75, description="Initial readiness percentage (0-100)")
    estimatedTotalWeeks: int = Field(default=8, description="Estimated total roadmap duration in weeks")
    marketTrendSummary: str = Field(default="", description="Summary of current hiring market trends & demand")
    demandIndex: str = Field(default="High Demand / Accelerated Hiring", description="Market demand velocity indicator")
    verifiedStrengths: List[str] = Field(default_factory=list, description="Candidate skills aligned with role prerequisites")
    criticalMissingGaps: List[SkillGapItem] = Field(default_factory=list, description="Essential skills required for competitive hiring")
    emergingSkills: List[SkillGapItem] = Field(default_factory=list, description="Modern high-leverage tools offering compensation advantage")
    milestones: List[RoadmapMilestone] = Field(default_factory=list, description="Chronological 8-week structured learning milestones")
