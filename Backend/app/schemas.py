from typing import List, Optional, Any
from pydantic import BaseModel, Field, model_validator, ConfigDict

class ExperienceItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(default="", description="Unique identifier for the experience entry")
    role: str = Field(default="", description="Job title or position held")
    company: str = Field(default="", description="Company or organization name")
    duration: str = Field(default="", description="Employment timeline, e.g. 2023 - Present")
    location: str = Field(default="", description="City, country or remote status")
    description: str = Field(default="", description="Key achievements, impact bullets, or responsibilities")

class ProjectItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(default="", description="Unique identifier for the project entry")
    title: str = Field(default="", description="Project title or system name")
    techStack: str = Field(default="", description="Technologies, libraries, and frameworks used")
    link: str = Field(default="", description="Live deployment, repository, or demo URL")
    description: str = Field(default="", description="Technical implementation details and outcomes")

class EducationItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    level: str = Field(..., description="Educational level, e.g. Ph.D., M.Sc., B.Sc., HSC, SSC, A-Level, O-Level")
    major: str = Field(..., description="Major, department, or group of study, e.g. Computer Science, Science")
    institution: str = Field(..., description="University, college, school, or board name")
    year: str = Field(..., description="Passing year or graduation timeline, e.g. 2024 or 2020 - 2024")
    grade: str = Field(..., description="Grade, CGPA, GPA, or thesis result status")

class RedFlagItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    issue: str = Field(default="", description="Summary of the potential red flag or anomaly")
    evidence: str = Field(default="", description="Evidence quote or pattern from the resume")
    fix: str = Field(default="", description="Recommended correction or mitigation strategy")

class CriterionBreakdownItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(default="", description="Criterion identifier")
    name: str = Field(default="", description="Criterion name")
    weight: int = Field(default=10, description="Max possible weight")
    score: int = Field(default=0, description="Score awarded")
    confidence: int = Field(default=90, description="Evaluation confidence")
    status: str = Field(default="Optimal", description="Status")
    evidence: str = Field(default="", description="Audit evidence")

class ModuleAuditItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(default="", description="Module identifier")
    name: str = Field(default="", description="Module name")
    status: str = Field(default="Verified", description="Verification status")
    score: int = Field(default=10, description="Score awarded out of 10")
    confidence: int = Field(default=90, description="Confidence percentage")
    evidence: str = Field(default="", description="Module audit summary or evidence")

class GapAnalysisItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    matchedSkills: List[str] = Field(default_factory=list, description="Verified skills")
    missingSkills: List[str] = Field(default_factory=list, description="Missing high-demand skills")
    experienceGap: str = Field(default="", description="Seniority and domain depth gap")
    qualificationEligibility: str = Field(default="", description="Educational qualification alignment")

class ActionableSolutionItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(default="", description="Solution ID")
    section: str = Field(default="", description="Target CV field name")
    sectionTitle: str = Field(default="", description="Display title of the section")
    issue: str = Field(default="", description="Audit weakness detected")
    strategy: str = Field(default="", description="Optimization strategy")
    currentSnippet: str = Field(default="", description="Current text quote from CV")
    suggestedReplacement: str = Field(default="", description="Ready-to-use proposed rewrite")
    status: str = Field(default="Needs Optimization", description="Audit status")

class CVProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")
    fullName: str = Field(..., description="Candidate full legal or professional name")
    targetRole: str = Field(..., description="Primary job title or career target")
    email: str = Field(default="", description="Contact email address")
    phone: str = Field(default="", description="Contact phone or mobile number")
    location: str = Field(default="", description="City and country of residence")
    linkedin: str = Field(default="", description="LinkedIn profile URL")
    github: str = Field(default="", description="GitHub profile URL")
    portfolio: str = Field(default="", description="Personal website or portfolio URL")
    summary: str = Field(default="", description="Executive career summary and professional narrative")
    skills: str = Field(default="", description="Comma-separated string of technical tools, libraries, languages, and methodologies")
    experience: str = Field(default="", description="Chronological work experience entries formatted as text with role, company, dates, and bullets")
    projects: str = Field(default="", description="Key software or research projects formatted as text with title, stack, and outcomes")
    education: List[EducationItem] = Field(default_factory=list, description="Array of multi-level academic credentials")
    certifications: str = Field(default="", description="List of recognized industry certifications and honors")
    rawText: Optional[str] = Field(default="", description="Verbatim raw text extracted from uploaded resume file")
    experienceList: List[ExperienceItem] = Field(default_factory=list, description="Structured work experience entries list")
    projectsList: List[ProjectItem] = Field(default_factory=list, description="Structured key projects entries list")

    @model_validator(mode='before')
    @classmethod
    def normalize_experience_and_projects(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Normalize experience
            exp = data.get("experience")
            exp_list = data.get("experienceList") or []
            if isinstance(exp, list):
                if not exp_list:
                    data["experienceList"] = exp
                lines = []
                for item in exp:
                    if isinstance(item, dict):
                        hdr = " | ".join(str(item.get(k, "")).strip() for k in ("role", "company", "duration", "location") if item.get(k))
                        desc = str(item.get("description", "")).strip()
                        lines.append(f"{hdr}\n{desc}" if hdr else desc)
                    elif hasattr(item, 'role'):
                        hdr = " | ".join(filter(None, [getattr(item, 'role', ''), getattr(item, 'company', ''), getattr(item, 'duration', ''), getattr(item, 'location', '')]))
                        desc = getattr(item, 'description', '')
                        lines.append(f"{hdr}\n{desc}" if hdr else desc)
                    elif isinstance(item, str):
                        lines.append(item)
                data["experience"] = "\n\n".join(lines).strip()
            elif isinstance(exp, str) and exp and not exp_list:
                data["experienceList"] = cls._parse_exp_str_to_list(exp)
            elif not exp and exp_list:
                lines = []
                for item in exp_list:
                    if isinstance(item, dict):
                        hdr = " | ".join(str(item.get(k, "")).strip() for k in ("role", "company", "duration", "location") if item.get(k))
                        desc = str(item.get("description", "")).strip()
                        lines.append(f"{hdr}\n{desc}" if hdr else desc)
                    elif hasattr(item, 'role'):
                        hdr = " | ".join(filter(None, [getattr(item, 'role', ''), getattr(item, 'company', ''), getattr(item, 'duration', ''), getattr(item, 'location', '')]))
                        desc = getattr(item, 'description', '')
                        lines.append(f"{hdr}\n{desc}" if hdr else desc)
                data["experience"] = "\n\n".join(lines).strip()

            # Normalize projects
            proj = data.get("projects")
            proj_list = data.get("projectsList") or []
            if isinstance(proj, list):
                if not proj_list:
                    data["projectsList"] = proj
                lines = []
                for item in proj:
                    if isinstance(item, dict):
                        parts = []
                        if item.get("title"): parts.append(str(item.get("title")).strip())
                        if item.get("techStack"): parts.append(f"Stack: {str(item.get('techStack')).strip()}")
                        if item.get("link"): parts.append(str(item.get("link")).strip())
                        hdr = " | ".join(parts)
                        desc = str(item.get("description", "")).strip()
                        lines.append(f"{hdr}\n{desc}" if hdr else desc)
                    elif hasattr(item, 'title'):
                        parts = [getattr(item, 'title', '')]
                        if getattr(item, 'techStack', ''): parts.append(f"Stack: {getattr(item, 'techStack', '')}")
                        if getattr(item, 'link', ''): parts.append(getattr(item, 'link', ''))
                        hdr = " | ".join(filter(None, parts))
                        desc = getattr(item, 'description', '')
                        lines.append(f"{hdr}\n{desc}" if hdr else desc)
                    elif isinstance(item, str):
                        lines.append(item)
                data["projects"] = "\n\n".join(lines).strip()
            elif isinstance(proj, str) and proj and not proj_list:
                data["projectsList"] = cls._parse_proj_str_to_list(proj)
            elif not proj and proj_list:
                lines = []
                for item in proj_list:
                    if isinstance(item, dict):
                        parts = []
                        if item.get("title"): parts.append(str(item.get("title")).strip())
                        if item.get("techStack"): parts.append(f"Stack: {str(item.get('techStack')).strip()}")
                        if item.get("link"): parts.append(str(item.get("link")).strip())
                        hdr = " | ".join(parts)
                        desc = str(item.get("description", "")).strip()
                        lines.append(f"{hdr}\n{desc}" if hdr else desc)
                    elif hasattr(item, 'title'):
                        parts = [getattr(item, 'title', '')]
                        if getattr(item, 'techStack', ''): parts.append(f"Stack: {getattr(item, 'techStack', '')}")
                        if getattr(item, 'link', ''): parts.append(getattr(item, 'link', ''))
                        hdr = " | ".join(filter(None, parts))
                        desc = getattr(item, 'description', '')
                        lines.append(f"{hdr}\n{desc}" if hdr else desc)
                data["projects"] = "\n\n".join(lines).strip()

        return data

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
    model_config = ConfigDict(extra="forbid")
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
    model_config = ConfigDict(extra="forbid")
    cv: CVProfile
    filters: JobFilters = Field(default_factory=JobFilters)

class CareerPathItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str = Field(..., description="Recommended career trajectory or target job title")
    matchScore: int = Field(..., description="Match percentage score between 0 and 100")
    salaryRange: str = Field(..., description="Realistic market salary range in target country/region")
    demandLevel: str = Field(..., description="Market hiring demand level, e.g. High Demand, Rapid Growth, Steady")
    reasoning: str = Field(..., description="Explanation of why this path matches candidate competencies")
    matchedSkills: List[str] = Field(default_factory=list, description="Candidate skills already aligned with this path")
    missingSkills: List[str] = Field(default_factory=list, description="Key skills recommended to achieve 100% fit")
    recommendedNextStep: str = Field(..., description="High-priority actionable recommendation for this path")

class CareerPredictResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    candidateSummary: str = Field(..., description="Holistic assessment of candidate profile and market competitiveness")
    marketInsight: str = Field(..., description="Real-time regional job market outlook based on search intelligence")
    paths: List[CareerPathItem] = Field(default_factory=list, description="Ranked list of recommended career path trajectories")

class CVEnhanceRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    section_type: str = Field(..., description="Section to enhance: summary, experience, or projects")
    content: str = Field(..., description="Raw or rough candidate text to enhance")
    target_role: str = Field(default="", description="Target job title to tailor phrasing towards")

class CVEnhanceResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    enhanced_text: str = Field(..., description="Executive, metric-driven enhanced text")

# ============================================================================
# Step 6B: Universal Multi-Sector CV Analysis & JD Match Models
# ============================================================================

class CVAnalyzeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    cv: CVProfile
    mode: str = Field(default="general", description="Analysis mode: 'general' (holistic audit) or 'jd_match' (job-specific match)")
    sector: str = Field(default="IT & Software", description="Target industry sector out of 14 universal sectors")
    job_description: str = Field(default="", description="Target Job Description text for Mode B matching")

class WeightedCriterion(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(..., description="Name of the criterion, e.g. Content Quality")
    score: int = Field(..., description="Points awarded for this criterion")
    maxScore: int = Field(..., description="Maximum possible points for this criterion")
    percentage: int = Field(..., description="Calculated percentage (score / maxScore * 100)")
    confidence: int = Field(default=92, description="Model evaluation confidence percentage (0-100)")
    evidence: str = Field(..., description="Evidence, observations, and audit rationale for the score")

class CoreModuleAuditItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: int = Field(..., description="Module numeric identifier (1-12)")
    moduleName: str = Field(..., description="Name of the 12 core CV modules audited")
    status: str = Field(..., description="Audit status: 'Verified', 'Needs Optimization', or 'Critical'")
    score: int = Field(..., description="Audit score awarded out of 10")
    maxScore: int = Field(default=10, description="Max module score (10)")
    confidence: int = Field(default=94, description="Confidence rating for this module evaluation (0-100)")
    summary: str = Field(..., description="Concise assessment of this module")
    evidenceQuotes: List[str] = Field(default_factory=list, description="Direct snippets and extracted facts from CV")
    issues: List[str] = Field(default_factory=list, description="Weaknesses, missing elements, or red flags detected")
    actionableSolution: str = Field(..., description="Step-by-step strategy to resolve issues")
    proposedRewrite: str = Field(default="", description="AI-generated ready-to-use replacement draft for weak sections")
    targetField: str = Field(default="", description="CV target field to update: 'summary', 'skills', 'experience', 'projects'")

class JDMatchResult(BaseModel):
    model_config = ConfigDict(extra="forbid")
    jdMatchScore: int = Field(..., description="Overall JD keyword and requirement match percentage (0-100)")
    eligibilityStatus: str = Field(..., description="Eligibility tier, e.g. 'Tier 1: High Match (Interview Ready)'")
    summary: str = Field(..., description="Executive narrative on candidate JD fit and alignment")
    matchedRequirements: List[str] = Field(default_factory=list, description="Requirements in the JD directly met by the CV")
    missingSkillsGap: List[str] = Field(default_factory=list, description="Crucial JD requirements or skills absent from the CV")
    experienceGap: str = Field(..., description="Assessment of seniority, tenure, and scope gaps relative to the JD")
    qualificationMatch: str = Field(..., description="Assessment of degree and certification alignment with JD requirements")

class CVAnalyzeResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    detectedSector: str = Field(..., description="Detected or verified industry sector out of 14 universal sectors")
    occupationTier: str = Field(..., description="Candidate career level, e.g. 'Senior / Specialist Tier'")
    overallQualityScore: int = Field(..., description="Total weighted CV quality score out of 100")
    confidenceScore: int = Field(default=94, description="Aggregate confidence percentage of the audit")
    weightedBreakdown: List[WeightedCriterion] = Field(..., description="Exact 8-criteria weighted quality breakdown (summing to 100)")
    coreModulesAudit: List[CoreModuleAuditItem] = Field(..., description="12 core module audit items with evidence quotes and solutions")
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
