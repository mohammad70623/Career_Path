from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class EducationItem(BaseModel):
    level: str = Field(..., description="Educational level, e.g. Ph.D., M.Sc., B.Sc., HSC, SSC, A-Level, O-Level")
    major: str = Field(..., description="Major, department, or group of study, e.g. Computer Science, Science")
    institution: str = Field(..., description="University, college, school, or board name")
    year: str = Field(..., description="Passing year or graduation timeline, e.g. 2024 or 2020 - 2024")
    grade: str = Field(..., description="Grade, CGPA, GPA, or thesis result status")

class CVProfile(BaseModel):
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
    experience: str = Field(default="", description="Chronological work experience entries with company, role, dates, and impact bullets")
    projects: str = Field(default="", description="Key software or research projects with tech stacks and quantifiable outcomes")
    education: List[EducationItem] = Field(default_factory=list, description="Array of multi-level academic credentials")
    certifications: str = Field(default="", description="List of recognized industry certifications and honors")

class JobFilters(BaseModel):
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
    cv: CVProfile
    filters: JobFilters = Field(default_factory=JobFilters)

class CareerPathItem(BaseModel):
    title: str = Field(..., description="Recommended career trajectory or target job title")
    matchScore: int = Field(..., description="Match percentage score between 0 and 100")
    salaryRange: str = Field(..., description="Realistic market salary range in target country/region")
    demandLevel: str = Field(..., description="Market hiring demand level, e.g. High Demand, Rapid Growth, Steady")
    reasoning: str = Field(..., description="Explanation of why this path matches candidate competencies")
    matchedSkills: List[str] = Field(default_factory=list, description="Candidate skills already aligned with this path")
    missingSkills: List[str] = Field(default_factory=list, description="Key skills recommended to achieve 100% fit")
    recommendedNextStep: str = Field(..., description="High-priority actionable recommendation for this path")

class CareerPredictResponse(BaseModel):
    candidateSummary: str = Field(..., description="Holistic assessment of candidate profile and market competitiveness")
    marketInsight: str = Field(..., description="Real-time regional job market outlook based on search intelligence")
    paths: List[CareerPathItem] = Field(default_factory=list, description="Ranked list of recommended career path trajectories")

class CVEnhanceRequest(BaseModel):
    section_type: str = Field(..., description="Section to enhance: summary, experience, or projects")
    content: str = Field(..., description="Raw or rough candidate text to enhance")
    target_role: str = Field(default="", description="Target job title to tailor phrasing towards")

class CVEnhanceResponse(BaseModel):
    enhanced_text: str = Field(..., description="Executive, metric-driven enhanced text")

# ============================================================================
# Step 6B: Universal Multi-Sector CV Analysis & JD Match Models
# ============================================================================

class CVAnalyzeRequest(BaseModel):
    cv: CVProfile
    mode: str = Field(default="general", description="Analysis mode: 'general' (holistic audit) or 'jd_match' (job-specific match)")
    sector: str = Field(default="IT & Software", description="Target industry sector out of 14 universal sectors")
    job_description: str = Field(default="", description="Target Job Description text for Mode B matching")

class WeightedCriterion(BaseModel):
    name: str = Field(..., description="Name of the criterion, e.g. Content Quality")
    score: int = Field(..., description="Points awarded for this criterion")
    maxScore: int = Field(..., description="Maximum possible points for this criterion")
    percentage: int = Field(..., description="Calculated percentage (score / maxScore * 100)")
    confidence: int = Field(default=92, description="Model evaluation confidence percentage (0-100)")
    evidence: str = Field(..., description="Evidence, observations, and audit rationale for the score")

class CoreModuleAuditItem(BaseModel):
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
    jdMatchScore: int = Field(..., description="Overall JD keyword and requirement match percentage (0-100)")
    eligibilityStatus: str = Field(..., description="Eligibility tier, e.g. 'Tier 1: High Match (Interview Ready)'")
    summary: str = Field(..., description="Executive narrative on candidate JD fit and alignment")
    matchedRequirements: List[str] = Field(default_factory=list, description="Requirements in the JD directly met by the CV")
    missingSkillsGap: List[str] = Field(default_factory=list, description="Crucial JD requirements or skills absent from the CV")
    experienceGap: str = Field(..., description="Assessment of seniority, tenure, and scope gaps relative to the JD")
    qualificationMatch: str = Field(..., description="Assessment of degree and certification alignment with JD requirements")

class CVAnalyzeResponse(BaseModel):
    detectedSector: str = Field(..., description="Detected or verified industry sector out of 14 universal sectors")
    occupationTier: str = Field(..., description="Candidate career level, e.g. 'Senior / Specialist Tier'")
    overallQualityScore: int = Field(..., description="Total weighted CV quality score out of 100")
    confidenceScore: int = Field(default=94, description="Aggregate confidence percentage of the audit")
    weightedBreakdown: List[WeightedCriterion] = Field(..., description="Exact 8-criteria weighted quality breakdown (summing to 100)")
    coreModulesAudit: List[CoreModuleAuditItem] = Field(..., description="12 core module audit items with evidence quotes and solutions")
    jdMatchResult: Optional[JDMatchResult] = Field(default=None, description="Detailed job description match analysis (populated when mode is jd_match)")
    matchedSkills: List[str] = Field(default_factory=list, description="Sector or JD competencies verified on candidate profile")
    missingSkills: List[str] = Field(default_factory=list, description="High-demand sector or JD competencies missing from candidate profile")
    redFlags: List[Dict[str, Any]] = Field(default_factory=list, description="List of detected anomalies, unsupported claims, or timeline gaps")

    # Compatibility aliases for direct frontend rendering
    cvQualityScore: Optional[int] = Field(default=None, description="Alias for overallQualityScore")
    overallConfidence: Optional[int] = Field(default=None, description="Alias for confidenceScore")
    sector: Optional[str] = Field(default=None, description="Alias for detectedSector")
    mode: Optional[str] = Field(default=None, description="Echo of requested mode")
    jdMatchScore: Optional[int] = Field(default=None, description="Convenience access to jdMatchResult.jdMatchScore")
    eligibilityTier: Optional[str] = Field(default=None, description="Convenience access to jdMatchResult.eligibilityStatus")
    criteriaBreakdown: Optional[List[Dict[str, Any]]] = Field(default=None, description="Frontend-adapted breakdown array")
    modulesAudit: Optional[List[Dict[str, Any]]] = Field(default=None, description="Frontend-adapted 12 module array")
    gapAnalysis: Optional[Dict[str, Any]] = Field(default=None, description="Frontend-adapted gap analysis map")
    actionableSolutions: Optional[List[Dict[str, Any]]] = Field(default=None, description="Frontend-adapted solutions array")
