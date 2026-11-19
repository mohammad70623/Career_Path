import io
import os
import base64
from typing import Optional, List

try:
    import pymupdf as fitz
except ImportError:
    import fitz

import docx
from langchain_openai import ChatOpenAI
from app.schemas import CVProfile, ExperienceItem, ProjectItem

def extract_text_from_docx(file_bytes: bytes) -> str:
    """
    Extract readable text from DOCX paragraphs and tables.
    """
    doc = docx.Document(io.BytesIO(file_bytes))
    text_parts = [p.text for p in doc.paragraphs if p.text.strip()]
    for table in doc.tables:
        for row in table.rows:
            row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
            if row_text:
                text_parts.append(row_text)
    return "\n".join(text_parts).strip()

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """
    Extract raw text from uploaded PDF or DOCX file bytes.
    Uses PyMuPDF (fitz) for PDF documents and python-docx for Word documents.
    """
    if not file_bytes:
        raise ValueError("Uploaded file is empty.")

    ext = filename.lower().split('.')[-1]
    
    if ext == 'pdf':
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
        except Exception as e:
            raise ValueError(f"Failed to read PDF document: {str(e)}")

        text_parts = []
        for page in doc:
            page_text = page.get_text()
            if page_text:
                text_parts.append(page_text)
        return "\n".join(text_parts).strip()

    elif ext in ('docx', 'doc'):
        return extract_text_from_docx(file_bytes)

    else:
        raise ValueError(f"Unsupported file format '.{ext}'. Please upload a PDF or DOCX file.")

def render_pdf_pages_as_base64_images(file_bytes: bytes, max_pages: int = 3, dpi: int = 150) -> List[str]:
    """
    Render the first 2-3 pages of a PDF as PNG images at the specified DPI,
    returning a list of base64-encoded image strings for vision-based parsing.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        raise ValueError(f"Failed to read PDF for rendering: {str(e)}")

    if len(doc) == 0:
        raise ValueError("The uploaded PDF contains no pages.")

    num_pages = min(len(doc), max_pages)
    base64_images: List[str] = []

    for page_idx in range(num_pages):
        page = doc[page_idx]
        pix = page.get_pixmap(dpi=dpi)
        png_bytes = pix.tobytes("png")
        b64_str = base64.b64encode(png_bytes).decode("utf-8")
        base64_images.append(b64_str)

    return base64_images

async def parse_cv_text(text: str) -> CVProfile:
    """
    Parse raw curriculum vitae text into structured CVProfile using ChatOpenAI with structured output.
    """
    if not text or len(text.strip()) < 15:
        raise ValueError("Resume text is empty or too short for parsing.")

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
        api_key=os.getenv("OPENAI_API_KEY")
    )
    structured_llm = llm.with_structured_output(CVProfile, method="function_calling")

    system_prompt = (
        "You are an expert executive resume parser. Extract and structure "
        "the candidate's curriculum vitae into the exact schema provided.\n"
        "Guidelines:\n"
        "1. Extract all academic degrees into the 'education' list, capturing Ph.D., Master's, "
        "Bachelor's, Diploma, HSC / A-Level, and SSC / O-Level entries where present.\n"
        "2. For 'skills', produce a clean, comprehensive comma-separated string of programming languages, "
        "frameworks, tools, and technical competencies.\n"
        "3. For 'experienceList', extract each job role as an item with: 'role', 'company', 'duration', 'location', and 'description' (bullet points).\n"
        "4. For 'projectsList', extract each key project as an item with: 'title', 'techStack', 'link', and 'description' (bullet points).\n"
        "5. For 'experience' and 'projects', produce readable structured text summaries.\n"
        "6. If links or contact details are found, capture them accurately; otherwise use empty strings."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Parse the following resume content into the structured CVProfile model:\n\n{text}"}
    ]

    result: CVProfile = await structured_llm.ainvoke(messages)
    result.rawText = text

    # Ensure experience and experienceList are both cleanly populated
    if result.experienceList and not result.experience:
        lines = []
        for item in result.experienceList:
            hdr = " | ".join(filter(None, [item.role, item.company, item.duration, item.location]))
            desc = item.description or ""
            lines.append(f"{hdr}\n{desc}" if hdr else desc)
        result.experience = "\n\n".join(lines).strip()
    elif result.experience and not result.experienceList:
        raw_items = CVProfile._parse_exp_str_to_list(result.experience)
        result.experienceList = [ExperienceItem(**item) for item in raw_items]

    # Ensure projects and projectsList are both cleanly populated
    if result.projectsList and not result.projects:
        lines = []
        for item in result.projectsList:
            parts = [item.title]
            if item.techStack: parts.append(f"Stack: {item.techStack}")
            if item.link: parts.append(item.link)
            hdr = " | ".join(filter(None, parts))
            desc = item.description or ""
            lines.append(f"{hdr}\n{desc}" if hdr else desc)
        result.projects = "\n\n".join(lines).strip()
    elif result.projects and not result.projectsList:
        raw_items = CVProfile._parse_proj_str_to_list(result.projects)
        result.projectsList = [ProjectItem(**item) for item in raw_items]

    return result

async def parse_cv_from_images(base64_images: List[str]) -> CVProfile:
    """
    Parse scanned / image-based resume pages (e.g. Canva exports, scanned PDFs)
    into structured CVProfile using ChatOpenAI gpt-4o-mini vision capabilities.
    """
    if not base64_images:
        raise ValueError("No rendered page images provided for scanned resume parsing.")

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
        api_key=os.getenv("OPENAI_API_KEY")
    )
    structured_llm = llm.with_structured_output(CVProfile, method="function_calling")

    system_prompt = (
        "You are an expert executive resume parser with optical document intelligence. "
        "Extract and structure the candidate's curriculum vitae from the provided resume page images "
        "into the exact schema provided.\n"
        "Guidelines:\n"
        "1. Extract all academic degrees into the 'education' list, capturing Ph.D., Master's, "
        "Bachelor's, Diploma, HSC / A-Level, and SSC / O-Level entries where present.\n"
        "2. For 'skills', produce a clean, comprehensive comma-separated string of programming languages, "
        "frameworks, tools, and technical competencies.\n"
        "3. For 'experienceList', extract each job role as an item with: 'role', 'company', 'duration', 'location', and 'description' (bullet points).\n"
        "4. For 'projectsList', extract each key project as an item with: 'title', 'techStack', 'link', and 'description' (bullet points).\n"
        "5. For 'experience' and 'projects', produce readable structured text summaries.\n"
        "6. If links or contact details are found, capture them accurately; otherwise use empty strings."
    )

    user_content: list = [
        {
            "type": "text",
            "text": (
                "The attached image(s) represent the pages of a candidate's resume (scanned or graphic design export). "
                "Carefully transcribe, analyze, and structure all sections into the CVProfile schema."
            )
        }
    ]

    for b64_img in base64_images:
        user_content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/png;base64,{b64_img}"
            }
        })

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]

    result: CVProfile = await structured_llm.ainvoke(messages)
    if not result.rawText:
        result.rawText = f"{result.fullName}\n{result.targetRole}\n{result.summary}\n{result.skills}\n{result.experience}\n{result.projects}"

    # Ensure experience and experienceList are both cleanly populated
    if result.experienceList and not result.experience:
        lines = []
        for item in result.experienceList:
            hdr = " | ".join(filter(None, [item.role, item.company, item.duration, item.location]))
            desc = item.description or ""
            lines.append(f"{hdr}\n{desc}" if hdr else desc)
        result.experience = "\n\n".join(lines).strip()
    elif result.experience and not result.experienceList:
        raw_items = CVProfile._parse_exp_str_to_list(result.experience)
        result.experienceList = [ExperienceItem(**item) for item in raw_items]

    # Ensure projects and projectsList are both cleanly populated
    if result.projectsList and not result.projects:
        lines = []
        for item in result.projectsList:
            parts = [item.title]
            if item.techStack: parts.append(f"Stack: {item.techStack}")
            if item.link: parts.append(item.link)
            hdr = " | ".join(filter(None, parts))
            desc = item.description or ""
            lines.append(f"{hdr}\n{desc}" if hdr else desc)
        result.projects = "\n\n".join(lines).strip()
    elif result.projects and not result.projectsList:
        raw_items = CVProfile._parse_proj_str_to_list(result.projects)
        result.projectsList = [ProjectItem(**item) for item in raw_items]

    return result

async def parse_cv_file(file_bytes: bytes, filename: str) -> CVProfile:
    """
    Parse an uploaded resume file (PDF or DOCX).
    1. For PDF: uses fitz (PyMuPDF) first to extract text across all pages.
    2. If extracted text is empty or under 50 characters (indicating a scanned/image PDF like a Canva export),
       renders the first 2-3 pages as PNG images using fitz (dpi=150), encodes them in base64,
       and passes them as image_url messages to ChatOpenAI(model="gpt-4o-mini", temperature=0).with_structured_output(CVProfile).
    3. For DOCX: extracts text via python-docx and parses using parse_cv_text.
    """
    if not file_bytes:
        raise ValueError("Uploaded resume file is empty.")

    ext = filename.lower().split('.')[-1]

    if ext == 'pdf':
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
        except Exception as e:
            raise ValueError(f"Failed to open PDF document: {str(e)}")

        if len(doc) == 0:
            raise ValueError("The uploaded PDF file contains no pages.")

        # 1. Use fitz to extract text across all pages
        text_parts = []
        for page in doc:
            page_text = page.get_text()
            if page_text:
                text_parts.append(page_text)
        extracted_text = "\n".join(text_parts).strip()

        # 2. If extracted text has at least 50 characters, use text-based structured parsing
        if len(extracted_text) >= 50:
            res = await parse_cv_text(extracted_text)
            res.rawText = extracted_text
            return res

        # 3. Otherwise (empty or under 50 characters -> scanned / image PDF), render first 2-3 pages as PNG images
        num_pages_to_render = min(len(doc), 3)
        base64_images: List[str] = []
        for page_idx in range(num_pages_to_render):
            page = doc[page_idx]
            pix = page.get_pixmap(dpi=150)
            png_bytes = pix.tobytes("png")
            b64_str = base64.b64encode(png_bytes).decode("utf-8")
            base64_images.append(b64_str)

        if not base64_images:
            raise ValueError("Could not extract readable text or render page images from the uploaded PDF.")

        res = await parse_cv_from_images(base64_images)
        if not res.rawText:
            res.rawText = extracted_text or f"{res.fullName}\n{res.targetRole}\n{res.summary}\n{res.skills}\n{res.experience}\n{res.projects}"
        return res

    elif ext in ('docx', 'doc'):
        extracted_text = extract_text_from_docx(file_bytes)
        if not extracted_text or len(extracted_text.strip()) < 15:
            raise ValueError("Could not extract readable text from the uploaded DOCX document.")
        res = await parse_cv_text(extracted_text)
        res.rawText = extracted_text
        return res

    else:
        raise ValueError(f"Unsupported file format '.{ext}'. Please upload a PDF or DOCX file.")

# Alias for backwards compatibility
parse_cv_document = parse_cv_file

async def enhance_cv_section(section_type: str, content: str, target_role: str = "") -> str:
    """
    Rewrite and enhance resume sections into high-impact, metric-driven executive copy.
    """
    role_context = f" targeting the role of '{target_role}'" if target_role else ""
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.3,
        api_key=os.getenv("OPENAI_API_KEY")
    )

    system_prompt = (
        f"You are a premier executive resume editor and career strategist.\n"
        f"Rewrite and enhance the provided resume section ({section_type}){role_context}.\n\n"
        "Rules:\n"
        "- If section is 'summary': deliver a powerful 3-4 sentence executive overview emphasizing core specializations, technical leadership, and business value.\n"
        "- If section is 'experience' or 'projects': use strong action verbs (e.g., 'Architected', 'Spearheaded', 'Optimized', 'Engineered'), apply the STAR method, and include realistic quantifiable metrics/percentages.\n"
        "- Output ONLY the rewritten text without markdown conversational preamble, quotes, or notes."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Text to enhance:\n{content}"}
    ]

    response = await llm.ainvoke(messages)
    return response.content.strip()
