import io
import os
from typing import Optional
import pypdf
import docx
from langchain_openai import ChatOpenAI
from app.schemas import CVProfile

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """
    Extract raw text from uploaded PDF or DOCX file bytes.
    """
    ext = filename.lower().split('.')[-1]
    
    if ext == 'pdf':
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        text_parts = []
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text_parts.append(extracted)
        full_text = "\n".join(text_parts).strip()
        if not full_text:
            raise ValueError("Could not extract any readable text from the uploaded PDF.")
        return full_text

    elif ext in ('docx', 'doc'):
        doc = docx.Document(io.BytesIO(file_bytes))
        text_parts = [p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    text_parts.append(row_text)
        full_text = "\n".join(text_parts).strip()
        if not full_text:
            raise ValueError("Could not extract readable text from the uploaded DOCX document.")
        return full_text

    else:
        raise ValueError(f"Unsupported file format '.{ext}'. Please upload a PDF or DOCX file.")

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
    structured_llm = llm.with_structured_output(CVProfile)

    system_prompt = (
        "You are an expert executive resume parser. Extract and structure "
        "the candidate's curriculum vitae into the exact schema provided.\n"
        "Guidelines:\n"
        "1. Extract all academic degrees into the 'education' list, capturing Ph.D., Master's, "
        "Bachelor's, Diploma, HSC / A-Level, and SSC / O-Level entries where present.\n"
        "2. For 'skills', produce a clean, comprehensive comma-separated string of programming languages, "
        "frameworks, tools, and technical competencies.\n"
        "3. For 'experience', structure entries with Role, Company, Dates, and bulleted achievements.\n"
        "4. For 'projects', list project titles, tech stacks, and quantifiable outcomes.\n"
        "5. If links or contact details are found, capture them accurately; otherwise use empty strings."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Parse the following resume content into the structured CVProfile model:\n\n{text}"}
    ]

    result: CVProfile = await structured_llm.ainvoke(messages)
    return result

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
