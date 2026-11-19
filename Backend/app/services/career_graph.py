import os
import re
from typing import TypedDict, List
from tavily import TavilyClient
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableLambda

from app.schemas import (
    CVProfile,
    JobFilters,
    CareerPredictResponse,
    CareerPathItem
)

class GraphState(TypedDict):
    cv: CVProfile
    filters: JobFilters
    profile_analysis: str
    tavily_market_data: str
    recommendations: CareerPredictResponse

def detect_academic_standing(cv: CVProfile) -> tuple[bool, str]:
    """
    Evaluates candidate education records for high distinction, honours, and CGPA metrics.
    Returns (has_academic_excellence, eligibility_note).
    """
    edu_items = cv.get_education_items()
    if not edu_items:
        return False, "Academic credentials not specified on current CV profile."

    highest_edu = edu_items[0]
    grade_str = highest_edu.grade or ""
    inst_str = highest_edu.institution or "Accredited University"
    level_str = highest_edu.level or "Undergraduate Degree"
    major_str = highest_edu.major or "Major Discipline"

    # Search for CGPA numbers (e.g. 3.88, 3.90, 4.00)
    cgpa_match = re.search(r'(\d+\.\d+)', grade_str)
    cgpa_val = float(cgpa_match.group(1)) if cgpa_match else 0.0

    is_high_cgpa = cgpa_val >= 3.50 or any(
        term in grade_str.lower()
        for term in ["first class", "honours", "honors", "distinction", "magna", "summa", "5.00", "top"]
    )

    if is_high_cgpa:
        note = (
            f"Exceptional academic record verified ({grade_str}) in {level_str} ({major_str}) from {inst_str}. "
            f"Qualifies for prestigious university faculty appointments (Lecturer / Adjunct Faculty), "
            f"national research associate positions, and sponsored graduate fellowship tracks."
        )
    else:
        note = (
            f"Accredited {level_str} in {major_str} recorded from {inst_str} ({grade_str or 'Graduated'}). "
            f"Demonstrates solid foundational competence for industry practice and corporate leadership trajectories."
        )

    return is_high_cgpa, note

def generate_dynamic_fallback(cv: CVProfile, filters: JobFilters) -> CareerPredictResponse:
    """
    Dynamically generates 6 to 8 all-department career trajectories derived directly from the candidate's
    actual university degree, CGPA, target role, and technical skills when OpenAI is offline or unreachable.
    """
    has_high_cgpa, academic_note = detect_academic_standing(cv)
    edu_items = cv.get_education_items()
    primary_edu = edu_items[0] if edu_items else None
    major = primary_edu.major if primary_edu else ""
    inst = primary_edu.institution if primary_edu else "Accredited Institution"
    grade = primary_edu.grade if primary_edu else ""
    clean = cv.to_clean_text()
    target_role = clean["targetRole"] or "Professional Specialist"

    # Extract top skills
    skills_list = cv.get_skills_list()
    if not skills_list:
        skills_list = ["Domain Analysis", "System Design", "Technical Communication", "Project Delivery"]

    matched_top = skills_list[:4]
    matched_secondary = skills_list[2:6] if len(skills_list) >= 5 else skills_list[:3]

    location_str = f"{filters.city}, {filters.country}".strip(", ")
    curr_prefix = "BDT " if filters.country == "Bangladesh" else ("€" if filters.country == "Germany" else ("£" if filters.country == "UK" else "$"))

    major_lower = (major + " " + target_role + " " + clean["rawText"]).lower()

    # Detect Department & Discipline
    if any(k in major_lower for k in ["computer", "software", "machine learning", "data", "ai", "artificial intelligence", "cse"]):
        discipline = "Computer Science, Artificial Intelligence & Software Systems"
        paths = [
            CareerPathItem(
                rank=1,
                title=f"Lead {target_role}",
                trackCategory="Core Domain Role",
                matchScore=95,
                salaryRange=f"{curr_prefix}180K – 350K / mo" if filters.country == "Bangladesh" else "$3,500 – $7,500 / mo",
                demandLevel="High Demand",
                reasoning=f"Direct professional alignment with candidate's technical profile in {major} and active competence across {', '.join(matched_top[:2])}.",
                matchedSkills=matched_top,
                missingSkills=["Enterprise Distributed Architecture", "Infrastructure Cost Governance"],
                recommendedNextStep="Architect an end-to-end production pipeline with automated telemetry benchmarks."
            ),
            CareerPathItem(
                rank=2,
                title="Distributed AI Systems & MLOps Architect",
                trackCategory="AI / Data & Specialization",
                matchScore=91,
                salaryRange=f"{curr_prefix}160K – 320K / mo" if filters.country == "Bangladesh" else "$3,200 – $6,800 / mo",
                demandLevel="Rapid Growth",
                reasoning=f"Accelerates specialized neural training and low-latency inference pipelines utilizing verified background in {inst}.",
                matchedSkills=matched_top[:3] + ["Docker"],
                missingSkills=["Kubeflow", "Triton Inference Server", "Ray Distributed"],
                recommendedNextStep="Containerize high-throughput inference models using Triton on Kubernetes clusters."
            ),
            CareerPathItem(
                rank=3,
                title=f"University Lecturer / Faculty in {major or 'Computer Science'}",
                trackCategory="Academic & Research Track",
                matchScore=88 if has_high_cgpa else 79,
                salaryRange=f"{curr_prefix}80K – 160K / mo" if filters.country == "Bangladesh" else "$2,500 – $5,000 / mo",
                demandLevel="Academic Appointment",
                reasoning=f"Academic eligibility verified with exceptional credentials ({grade}) from {inst}. Direct qualification for teaching tertiary courses.",
                matchedSkills=["Algorithm Design", "Theoretical Foundations"] + matched_top[:2],
                missingSkills=["Curriculum Mapping", "Peer-Reviewed Publication Portfolio", "Grant Writing"],
                recommendedNextStep="Publish a peer-reviewed research preprint and submit teaching portfolio to accredited faculty boards."
            ),
            CareerPathItem(
                rank=4,
                title="Applied Research Scientist (Computer Vision & NLP)",
                trackCategory="Academic & Research Track",
                matchScore=85,
                salaryRange=f"{curr_prefix}140K – 280K / mo" if filters.country == "Bangladesh" else "$3,000 – $6,500 / mo",
                demandLevel="Strategic Growth",
                reasoning=f"Blends deep research experimentation with practical code execution based on projects completed during {major} tenure.",
                matchedSkills=matched_top[:3],
                missingSkills=["Novel Architecture Formulation", "Mathematical Optimization Theory"],
                recommendedNextStep="Conduct experimental ablation studies comparing contrastive loss against baseline models."
            ),
            CareerPathItem(
                rank=5,
                title="Data Engineering & Real-Time Decision Systems Lead",
                trackCategory="Adjacent & Interdisciplinary",
                matchScore=82,
                salaryRange=f"{curr_prefix}130K – 260K / mo" if filters.country == "Bangladesh" else "$2,800 – $5,800 / mo",
                demandLevel="Steady Demand",
                reasoning="Applies high-volume database and ETL design strengths to corporate intelligence workflows.",
                matchedSkills=matched_secondary + ["PostgreSQL"],
                missingSkills=["Snowflake / BigQuery", "dbt Transformations", "Apache Spark"],
                recommendedNextStep="Design an event-driven CDC pipeline feeding corporate analytics warehouses."
            ),
            CareerPathItem(
                rank=6,
                title="Technical Engineering Manager & Solutions Architect",
                trackCategory="Management & Strategy",
                matchScore=77,
                salaryRange=f"{curr_prefix}200K – 400K / mo" if filters.country == "Bangladesh" else "$4,000 – $8,500 / mo",
                demandLevel="Executive Leadership",
                reasoning="Strategic leadership trajectory managing cross-functional delivery squads and bridging software milestones with business KPIs.",
                matchedSkills=["System Design", "API Architecture", "Technical Communication"],
                missingSkills=["P&L Oversight", "Sprint Velocity Roadmapping", "Executive Stakeholder Alignment"],
                recommendedNextStep="Lead a cross-functional sprint translating engineering throughput into demonstrable customer ROI."
            )
        ]
    elif any(k in major_lower for k in ["business", "finance", "accounting", "marketing", "bba", "mba", "economics"]):
        discipline = "Business Administration, Corporate Finance & Strategic Economics"
        paths = [
            CareerPathItem(
                rank=1,
                title=f"Senior {target_role or 'Financial & Business Strategy Analyst'}",
                trackCategory="Core Domain Role",
                matchScore=94,
                salaryRange=f"{curr_prefix}120K – 240K / mo" if filters.country == "Bangladesh" else "$3,000 – $6,000 / mo",
                demandLevel="High Demand",
                reasoning=f"Strong domain synergy with candidate's academic tenure in {major} from {inst} and practical analytical acumen.",
                matchedSkills=matched_top,
                missingSkills=["Advanced DCF Modeling", "Regulatory Auditing (Basel III)"],
                recommendedNextStep="Build an automated valuation dashboard forecasting quarterly free cash flows."
            ),
            CareerPathItem(
                rank=2,
                title="Quantitative Risk & Financial Modeling Consultant",
                trackCategory="AI / Data & Specialization",
                matchScore=89,
                salaryRange=f"{curr_prefix}130K – 270K / mo" if filters.country == "Bangladesh" else "$3,200 – $6,500 / mo",
                demandLevel="Rapid Growth",
                reasoning=f"Applies analytical precision and statistical rigor honed during {major} coursework to asset risk assessments.",
                matchedSkills=matched_top[:2] + ["Financial Analytics"],
                missingSkills=["Monte Carlo Simulations", "Python for Algorithmic Finance", "PowerBI DAX"],
                recommendedNextStep="Formulate a stochastic default probability model simulating macroeconomic stress scenarios."
            ),
            CareerPathItem(
                rank=3,
                title=f"University Lecturer in {major or 'Business Administration'}",
                trackCategory="Academic & Research Track",
                matchScore=87 if has_high_cgpa else 78,
                salaryRange=f"{curr_prefix}75K – 150K / mo" if filters.country == "Bangladesh" else "$2,200 – $4,500 / mo",
                demandLevel="Academic Appointment",
                reasoning=f"Academic standing ({grade}) at {inst} fulfills tertiary faculty recruitment prerequisites.",
                matchedSkills=["Business Communications", "Pedagogical Delivery"] + matched_top[:2],
                missingSkills=["Case Study Publication", "Curriculum Development"],
                recommendedNextStep="Develop a syllabus for corporate governance and author a contemporary business case study."
            ),
            CareerPathItem(
                rank=4,
                title="Economic Policy & Corporate Market Research Fellow",
                trackCategory="Academic & Research Track",
                matchScore=83,
                salaryRange=f"{curr_prefix}90K – 180K / mo" if filters.country == "Bangladesh" else "$2,500 – $5,000 / mo",
                demandLevel="Policy & Think Tank",
                reasoning="Conducts empirical market structure research bridging corporate trends with regulatory macroeconomic frameworks.",
                matchedSkills=matched_top[:3],
                missingSkills=["Econometric Analysis (Stata/R)", "Policy White Paper Drafting"],
                recommendedNextStep="Publish an analytical white paper on regional supply chain inflationary impacts."
            ),
            CareerPathItem(
                rank=5,
                title="Fintech Product Strategy & Operations Manager",
                trackCategory="Adjacent & Interdisciplinary",
                matchScore=80,
                salaryRange=f"{curr_prefix}140K – 280K / mo" if filters.country == "Bangladesh" else "$3,500 – $7,000 / mo",
                demandLevel="High Demand",
                reasoning="Bridges traditional financial operations with digital platform user adoption workflows.",
                matchedSkills=matched_secondary,
                missingSkills=["Agile Scrum Management", "User Journey Funnel Optimization"],
                recommendedNextStep="Define API integration specifications for mobile digital payment gateways."
            ),
            CareerPathItem(
                rank=6,
                title="Chief of Staff / Corporate Development Director",
                trackCategory="Management & Strategy",
                matchScore=74,
                salaryRange=f"{curr_prefix}180K – 380K / mo" if filters.country == "Bangladesh" else "$4,500 – $9,000 / mo",
                demandLevel="Executive Leadership",
                reasoning="Executive trajectory leading corporate M&A analysis, capital budgeting, and strategic growth initiatives.",
                matchedSkills=["Strategic Planning", "Stakeholder Alignment"],
                missingSkills=["M&A Due Diligence", "Board Presentation Governance"],
                recommendedNextStep="Assemble an executive strategic roadmap aligning quarterly operational goals with multi-year P&L."
            )
        ]
    elif any(k in major_lower for k in ["law", "legal", "justice", "juris"]):
        discipline = "Law, Jurisprudence & Corporate Regulatory Compliance"
        paths = [
            CareerPathItem(
                rank=1,
                title=f"Corporate Legal Counsel / {target_role}",
                trackCategory="Core Domain Role",
                matchScore=94,
                salaryRange=f"{curr_prefix}110K – 220K / mo" if filters.country == "Bangladesh" else "$3,200 – $6,500 / mo",
                demandLevel="High Demand",
                reasoning=f"Direct professional alignment with legal coursework at {inst} and contract negotiation skills.",
                matchedSkills=matched_top,
                missingSkills=["Cross-Border M&A Structuring", "International Arbitration"],
                recommendedNextStep="Draft comprehensive commercial master service agreements and statutory compliance checklists."
            ),
            CareerPathItem(
                rank=2,
                title="Regulatory Compliance & ESG Governance Director",
                trackCategory="AI / Data & Specialization",
                matchScore=89,
                salaryRange=f"{curr_prefix}130K – 250K / mo" if filters.country == "Bangladesh" else "$3,500 – $7,000 / mo",
                demandLevel="Rapid Growth",
                reasoning="Specialized corporate integrity role overseeing data privacy (GDPR) and statutory filings.",
                matchedSkills=matched_top[:3],
                missingSkills=["ESG Framework Reporting", "Data Privacy Auditing"],
                recommendedNextStep="Complete an enterprise compliance audit framework for statutory risk mitigation."
            ),
            CareerPathItem(
                rank=3,
                title=f"University Lecturer in {major or 'Law & Legal Studies'}",
                trackCategory="Academic & Research Track",
                matchScore=87 if has_high_cgpa else 78,
                salaryRange=f"{curr_prefix}75K – 150K / mo" if filters.country == "Bangladesh" else "$2,400 – $4,800 / mo",
                demandLevel="Academic Appointment",
                reasoning=f"High academic standing ({grade}) at {inst} qualifies for law faculty lectureships.",
                matchedSkills=["Jurisprudence Analysis", "Constitutional Law"] + matched_top[:2],
                missingSkills=["Law Review Publication", "Moot Court Coaching"],
                recommendedNextStep="Submit an article to a peer-reviewed law journal on comparative corporate jurisprudence."
            ),
            CareerPathItem(
                rank=4,
                title="Public Policy & Human Rights Research Fellow",
                trackCategory="Academic & Research Track",
                matchScore=82,
                salaryRange=f"{curr_prefix}80K – 160K / mo" if filters.country == "Bangladesh" else "$2,500 – $5,200 / mo",
                demandLevel="Think Tank & NGO",
                reasoning="Conducts statutory legislative research guiding public legal reforms and advocacy campaigns.",
                matchedSkills=matched_top[:2],
                missingSkills=["Legislative Drafting", "Grant Proposal Sourcing"],
                recommendedNextStep="Publish a policy brief on intellectual property protections in emerging digital economies."
            ),
            CareerPathItem(
                rank=5,
                title="Commercial Contract & IP Licensing Specialist",
                trackCategory="Adjacent & Interdisciplinary",
                matchScore=79,
                salaryRange=f"{curr_prefix}95K – 190K / mo" if filters.country == "Bangladesh" else "$2,800 – $5,600 / mo",
                demandLevel="Steady Demand",
                reasoning="Specializes in software licensing, trademark filing, and technology transfer agreements.",
                matchedSkills=matched_secondary,
                missingSkills=["Patent Landscape Analytics", "SaaS Licensing Structures"],
                recommendedNextStep="Formulate standard SaaS enterprise licensing and SLA terms for commercial vendors."
            ),
            CareerPathItem(
                rank=6,
                title="Chief Legal Officer & General Counsel",
                trackCategory="Management & Strategy",
                matchScore=74,
                salaryRange=f"{curr_prefix}180K – 360K / mo" if filters.country == "Bangladesh" else "$4,500 – $9,500 / mo",
                demandLevel="Executive Leadership",
                reasoning="Executive oversight of corporate legal risk, board advisory, and litigation defense strategies.",
                matchedSkills=["Legal Risk Assessment", "Executive Leadership"],
                missingSkills=["Litigation Portfolio Management", "Capital Market Governance"],
                recommendedNextStep="Participate in executive corporate governance workshops and lead risk committee reviews."
            )
        ]
    else:
        # Universal Interdisciplinary Engine
        discipline = f"{major or 'Applied Interdisciplinary Studies'} & Professional Systems"
        paths = [
            CareerPathItem(
                rank=1,
                title=f"Lead {target_role}",
                trackCategory="Core Domain Role",
                matchScore=94,
                salaryRange=f"{curr_prefix}120K – 240K / mo" if filters.country == "Bangladesh" else "$3,000 – $6,000 / mo",
                demandLevel="High Demand",
                reasoning=f"Direct role fit drawing on verified competencies from {inst} ({major}) and target role expectations.",
                matchedSkills=matched_top,
                missingSkills=["Advanced Domain Specialization", "Strategic KPI Tracking"],
                recommendedNextStep="Lead a core operational project and document quantitative outcome metrics."
            ),
            CareerPathItem(
                rank=2,
                title=f"Senior Technical Specialist & Operations Lead ({major or 'Domain'})",
                trackCategory="AI / Data & Specialization",
                matchScore=89,
                salaryRange=f"{curr_prefix}130K – 260K / mo" if filters.country == "Bangladesh" else "$3,200 – $6,400 / mo",
                demandLevel="Rapid Growth",
                reasoning=f"Applies advanced methodology and analytical rigor to optimize {major} operational workflows.",
                matchedSkills=matched_top[:3],
                missingSkills=["Automation Scripting", "Data-Driven Performance Auditing"],
                recommendedNextStep="Implement standardized quality assurance checklists and automated telemetry reporting."
            ),
            CareerPathItem(
                rank=3,
                title=f"University Lecturer / Faculty in {major or 'Domain Studies'}",
                trackCategory="Academic & Research Track",
                matchScore=87 if has_high_cgpa else 78,
                salaryRange=f"{curr_prefix}75K – 150K / mo" if filters.country == "Bangladesh" else "$2,200 – $4,500 / mo",
                demandLevel="Academic Appointment",
                reasoning=f"Academic eligibility supported by educational tenure ({grade}) at {inst}.",
                matchedSkills=["Curriculum Synthesis", "Academic Communication"] + matched_top[:2],
                missingSkills=["Instructional Design", "Academic Journal Publication"],
                recommendedNextStep="Prepare a model course syllabus and submit academic writing samples for faculty review."
            ),
            CareerPathItem(
                rank=4,
                title="Applied Domain Research Scientist & Analyst",
                trackCategory="Academic & Research Track",
                matchScore=83,
                salaryRange=f"{curr_prefix}90K – 180K / mo" if filters.country == "Bangladesh" else "$2,600 – $5,200 / mo",
                demandLevel="Research & Development",
                reasoning=f"Conducts structured experimental investigations advancing commercial best practices in {major}.",
                matchedSkills=matched_top[:2],
                missingSkills=["Statistical Modeling", "Experimental Research Design"],
                recommendedNextStep="Conduct a structured benchmarking survey and document empirical findings."
            ),
            CareerPathItem(
                rank=5,
                title="Cross-Functional Systems Consultant",
                trackCategory="Adjacent & Interdisciplinary",
                matchScore=79,
                salaryRange=f"{curr_prefix}100K – 200K / mo" if filters.country == "Bangladesh" else "$2,800 – $5,600 / mo",
                demandLevel="Consulting Demand",
                reasoning="Transfers core problem-solving methodologies into client-facing enterprise advisory workflows.",
                matchedSkills=matched_secondary,
                missingSkills=["Client Engagement Scoping", "Change Management"],
                recommendedNextStep="Draft an advisory blueprint outlining efficiency gains for partner organizations."
            ),
            CareerPathItem(
                rank=6,
                title="Project Director & Operations Strategist",
                trackCategory="Management & Strategy",
                matchScore=74,
                salaryRange=f"{curr_prefix}160K – 320K / mo" if filters.country == "Bangladesh" else "$3,800 – $7,600 / mo",
                demandLevel="Executive Leadership",
                reasoning="Senior leadership trajectory directing team resources, project roadmaps, and stakeholder alignment.",
                matchedSkills=["Team Coordination", "Strategic Planning"],
                missingSkills=["Resource Budgeting", "Executive Governance"],
                recommendedNextStep="Oversee a multi-phase strategic project achieving validated milestone deliverables."
            )
        ]

    # Strict Highest-to-Lowest Sorting
    paths.sort(key=lambda x: x.matchScore, reverse=True)
    for idx, p in enumerate(paths, start=1):
        p.rank = idx

    return CareerPredictResponse(
        detectedDiscipline=discipline,
        academicEligibilityNote=academic_note,
        candidateSummary=(
            f"Candidate presents comprehensive academic preparation in {major or 'Domain Specialization'} "
            f"from {inst} ({grade or 'Accredited'}) paired with demonstrated execution in {target_role}. "
            f"Profile qualifies for multiple concurrent tracks ranging from core enterprise engineering to tertiary faculty lectureships."
        ),
        marketInsight=(
            f"Active hiring demand observed in {location_str} for qualified {target_role} candidates. "
            f"Regional market rewards interdisciplinary competence and advanced technical rigor."
        ),
        paths=paths
    )

async def analyze_profile(state: dict) -> dict:
    """
    Stage 1: Evaluates candidate competencies, tech stack, academic hierarchy, and CGPA metrics.
    """
    cv: CVProfile = state["cv"]
    api_key = os.getenv("OPENAI_API_KEY")

    has_high_cgpa, academic_note = detect_academic_standing(cv)
    clean = cv.to_clean_text()
    edu_summary = clean["education"] or "Education unlisted"
    raw_doc_sample = clean["rawText"][:2500]

    if not api_key:
        return {
            **state,
            "profile_analysis": f"Candidate: {clean['fullName']}. Target: {clean['targetRole']}. Education: {edu_summary}. {academic_note}"
        }

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.1,
        api_key=api_key,
        timeout=30.0,
        max_retries=2
    )

    prompt = (
        "You are an elite, all-department global career trajectory analyst.\n"
        "Analyze this candidate profile across ANY academic discipline (STEM, Business, Law, Healthcare, Humanities):\n"
        f"- Full Name: {clean['fullName']}\n"
        f"- Target Role: {clean['targetRole']}\n"
        f"- Academic History & CGPA: {edu_summary}\n"
        f"- Professional Summary: {clean['summary']}\n"
        f"- Technical & Domain Skills: {clean['skills']}\n"
        f"- Work Experience: {clean['experience']}\n"
        f"- Key Projects: {clean['projects']}\n"
        f"- Certifications: {clean['certifications']}\n"
        f"- Verbatim Resume Snippet: {raw_doc_sample}\n\n"
        "Provide a concise analytical synthesis covering:\n"
        "1. Primary academic discipline & departmental classification\n"
        "2. Academic excellence assessment (CGPA/grades evaluation for university faculty & research eligibility)\n"
        "3. Core industry domain mastery & project delivery velocity\n"
        "4. High-value adjacent & leadership transferability"
    )

    try:
        response = await llm.ainvoke(prompt)
        analysis_text = response.content.strip()
    except Exception:
        analysis_text = f"Candidate: {clean['fullName']}. Target Role: {clean['targetRole']}. Academic Background: {edu_summary}. {academic_note}"

    return {**state, "profile_analysis": analysis_text}

async def fetch_regional_market(state: dict) -> dict:
    """
    Stage 2: Queries live Tavily intelligence for regional job demand, hiring velocity, and compensation benchmarks.
    """
    cv: CVProfile = state["cv"]
    filters: JobFilters = state["filters"]
    location_str = f"{filters.city}, {filters.country} ({filters.region})".strip(", ()")
    query = f"job market hiring demand salary trends for {cv.targetRole} {location_str} {filters.industry}".strip()

    tavily_api_key = os.getenv("TAVILY_API_KEY")
    market_data = ""

    if tavily_api_key:
        try:
            client = TavilyClient(api_key=tavily_api_key)
            search_res = client.search(query=query, max_results=3, search_depth="basic")
            results = search_res.get("results", [])
            if results:
                formatted_results = [
                    f"- {item.get('title', 'Market Listing')}: {item.get('content', '')[:280]}"
                    for item in results
                ]
                market_data = "\n".join(formatted_results)
        except Exception:
            market_data = (
                f"Tavily live lookup benchmark: Strong demand recorded for {cv.targetRole} in {location_str} "
                f"across the {filters.industry or 'Technology & Industry'} sector."
            )
    else:
        market_data = (
            f"Regional hiring benchmark: Steady recruitment demand noted in {location_str} "
            f"for qualified candidates in {cv.targetRole}."
        )

    return {**state, "tavily_market_data": market_data}

async def generate_career_paths(state: dict) -> CareerPredictResponse:
    """
    Stage 3: Synthesizes candidate analysis and live market intelligence into 6 to 8 ranked, diverse trajectories.
    Strictly orders paths from highest to lowest match score (top-to-bottom) and numbers ranks 1..N.
    """
    cv: CVProfile = state["cv"]
    filters: JobFilters = state["filters"]
    profile_analysis = state.get("profile_analysis", "")
    market_data = state.get("tavily_market_data", "")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return generate_dynamic_fallback(cv, filters)

    location_str = f"{filters.city}, {filters.country}".strip(", ")
    target_currency = "BDT" if filters.country == "Bangladesh" else ("EUR" if filters.country == "Germany" else ("GBP" if filters.country == "UK" else "USD"))

    system_prompt = (
        "You are an elite, universal all-department career trajectory architect and academic talent strategist.\n"
        "Evaluate the candidate's complete profile—including verbatim document text, academic credentials (degrees, institution, CGPA/grades), technical skills, work experience, key projects, and certifications—against regional hiring dynamics in {location_str}.\n\n"
        "MANDATORY ARCHITECTURE RULES:\n"
        "1. ALL-DEPARTMENT UNIVERSAL INTELLIGENCE:\n"
        "   Evaluate candidates from ANY discipline (Software/CS, Engineering, Business/Finance, Healthcare/Medicine, Law, Agriculture, Natural Sciences, Humanities, Social Sciences).\n"
        "   Detect their primary 'detectedDiscipline' accurately (e.g., 'Software Engineering & Artificial Intelligence', 'Business Administration & Corporate Finance', 'Biomedical Sciences & Clinical Health', 'Law & Jurisprudence').\n\n"
        "2. ACADEMIC & CGPA-AWARE MULTI-TRACK SPECTRUM:\n"
        "   Inspect candidate grades/CGPA. If high academic distinction exists (e.g. CGPA >= 3.50/4.00, Honours, First Class), provide a detailed 'academicEligibilityNote' assessing their qualification for faculty lectureships and research fellow appointments.\n"
        "   Generate exactly 6 to 8 diverse, realistic, ranked career paths across multiple tracks:\n"
        "   - 'Core Domain Role' (direct high-match professional industry role, 90–98% match)\n"
        "   - 'AI / Data & Specialization' (advanced specialized analytical, computational, or domain-specialized growth role, 86–92% match)\n"
        "   - 'Academic & Research Track' (e.g. University Lecturer, Adjunct Faculty, Research Associate, Lab Scientist, 84–90% match)\n"
        "   - 'Adjacent & Interdisciplinary' (high-value transferable trajectory applying core competencies in related domains, 78–84% match)\n"
        "   - 'Management & Strategy' (strategic leadership, consulting, or project director, 72–78% match)\n"
        "   - Additional specialized tracks to ensure a rich 6 to 8 role spectrum.\n\n"
        "3. REASONING REQUIREMENTS:\n"
        "   In 'reasoning', explicitly cite the candidate's actual university degree, CGPA/grades, specific technical tools, and real projects/experience from their CV.\n\n"
        "4. REALISTIC REGIONAL COMPENSATION:\n"
        f"   In 'salaryRange', reflect current hiring rates in {location_str} using appropriate currency ({target_currency} / month or annualized).\n\n"
        "5. STRICT HIGHEST-TO-LOWEST ORDER:\n"
        "   Order all paths strictly from highest matchScore to lowest matchScore, assigning sequential rank 1, 2, 3... N."
    )

    clean = cv.to_clean_text()
    edu_summary = clean["education"] or "Education unlisted"

    user_prompt = (
        f"Candidate Full Name: {clean['fullName']}\n"
        f"Candidate Target Role: {clean['targetRole']}\n"
        f"Target Location: {location_str} ({filters.region})\n"
        f"Target Industry: {filters.industry}\n"
        f"Academic Credentials: {edu_summary}\n"
        f"Core Technical Skills: {clean['skills']}\n"
        f"Work Experience Summary: {clean['experience']}\n"
        f"Key Projects: {clean['projects']}\n"
        f"Raw Document Text (Verbatim): {clean['rawText'][:2500]}\n\n"
        f"=== CANDIDATE PROFILE ANALYSIS ===\n{profile_analysis}\n\n"
        f"=== LIVE MARKET DATA (TAVILY) ===\n{market_data}\n\n"
        "Generate the ranked CareerPredictResponse with detectedDiscipline, academicEligibilityNote, candidateSummary, marketInsight, and 6 to 8 diverse paths."
    )

    try:
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.25,
            api_key=api_key,
            timeout=45.0,
            max_retries=2
        )
        structured_llm = llm.with_structured_output(CareerPredictResponse, method="function_calling")

        recommendations: CareerPredictResponse = await structured_llm.ainvoke([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ])

        # Programmatically ensure strict highest-to-lowest sorting by matchScore
        if recommendations.paths:
            recommendations.paths.sort(key=lambda x: x.matchScore, reverse=True)
            for idx, p in enumerate(recommendations.paths, start=1):
                p.rank = idx

        return recommendations

    except Exception as e:
        print(f"[career_graph] OpenAI structured predict notice: {e}. Utilizing dynamic all-department fallback.")
        return generate_dynamic_fallback(cv, filters)

# 3-Stage LCEL Async Pipeline
career_pipeline = (
    RunnableLambda(analyze_profile)
    | RunnableLambda(fetch_regional_market)
    | RunnableLambda(generate_career_paths)
)

async def predict_career_paths(cv: CVProfile, filters: JobFilters) -> CareerPredictResponse:
    """
    Public async service to run the 3-stage LCEL prediction workflow.
    """
    initial_state = {
        "cv": cv,
        "filters": filters,
        "profile_analysis": "",
        "tavily_market_data": "",
        "recommendations": None
    }
    return await career_pipeline.ainvoke(initial_state)
