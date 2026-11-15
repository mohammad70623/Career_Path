from typing import List, Optional
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
