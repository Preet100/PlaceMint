"""
resume_parser.py
----------------
Three responsibilities:

1. `extract_text_from_pdf`   -- pull plain text out of an uploaded PDF
   (pdfplumber preferred, PyPDF2 fallback). Adapted from the original AI
   Resume Builder project's utils.py -- this function needed no changes,
   it was already well-tested and dependency-free of Streamlit specifics.

2. `parse_resume_text_heuristic` -- a regex/keyword-based extractor that
   turns raw resume text into a `resume_data` dict (see resume_schema.py)
   WITHOUT needing any API key. This is what runs when no Groq API key is
   configured, or when the AI parse fails for any reason -- the app always
   produces *something* to review and edit, never a hard failure.

3. `map_resume_to_features` -- converts a resume_data dict (from either the
   heuristic parser, the LLM parser in llm_engine.py, or the "Build a
   Resume" form) into the placement model's raw feature dict. Because the
   Direct Prediction page's review form always lets the student see and
   correct every value before predicting, this mapping only needs to be a
   reasonable starting point, not a perfect one.
"""

from __future__ import annotations

import io
import re
from typing import Any

try:
    import pdfplumber

    _HAS_PDFPLUMBER = True
except ImportError:  # pragma: no cover
    _HAS_PDFPLUMBER = False

try:
    import PyPDF2

    _HAS_PYPDF2 = True
except ImportError:  # pragma: no cover
    _HAS_PYPDF2 = False


# ─────────────────────────────────────────────────────────────────────────────
# 1. PDF TEXT EXTRACTION
# ─────────────────────────────────────────────────────────────────────────────


def extract_text_from_pdf(file_obj: Any) -> str:
    """Extract plain text from an uploaded PDF (BytesIO or Streamlit UploadedFile).
    Tries pdfplumber first (best layout fidelity), falls back to PyPDF2."""
    if hasattr(file_obj, "seek"):
        file_obj.seek(0)
    raw_bytes = file_obj.read()
    buffer = io.BytesIO(raw_bytes)

    if _HAS_PDFPLUMBER:
        try:
            with pdfplumber.open(buffer) as pdf:
                pages_text = [
                    page.extract_text(x_tolerance=3, y_tolerance=3) or "" for page in pdf.pages
                ]
            text = "\n\n".join(t.strip() for t in pages_text if t)
            if text.strip():
                return text
        except Exception:
            buffer.seek(0)

    if _HAS_PYPDF2:
        try:
            reader = PyPDF2.PdfReader(buffer)
            pages_text = [page.extract_text() or "" for page in reader.pages]
            return "\n\n".join(t.strip() for t in pages_text if t)
        except Exception as exc:
            raise RuntimeError(f"Could not parse the uploaded PDF: {exc}") from exc

    raise RuntimeError(
        "No PDF text extraction library is available. Install pdfplumber or PyPDF2."
    )


# ─────────────────────────────────────────────────────────────────────────────
# 2. HEURISTIC (NO-API-KEY) RESUME TEXT PARSER
# ─────────────────────────────────────────────────────────────────────────────

_SECTION_KEYWORDS = {
    "education": ["education", "academic background", "academics", "qualification", "educational qualification"],
    "experience": [
        "experience", "internship", "work experience", "internships", "training / work experience",
        "work experience / training", "employment history", "professional experience", "training & experience"
    ],
    "projects": ["projects", "academic projects", "personal projects", "key projects"],
    "skills": ["skills", "technical skills", "programming skills", "core competencies", "technical & soft skills"],
    "soft_skills": ["soft skills", "interpersonal skills"],
    "certifications": ["certifications", "certificates", "licenses & certifications"],
    "cocurricular": ["co-curricular", "extracurricular", "extra-curricular", "achievements", "activities"],
    "summary": ["summary", "objective", "professional summary", "career objective"],
}

_KNOWN_TECH_SKILLS = [
    "python", "java", "c++", "c", "javascript", "typescript", "sql", "html", "css",
    "react", "node.js", "node", "django", "flask", "spring", "angular", "vue",
    "machine learning", "deep learning", "tensorflow", "pytorch", "pandas", "numpy",
    "aws", "azure", "gcp", "docker", "kubernetes", "git", "github", "linux",
    "mongodb", "mysql", "postgresql", "excel", "power bi", "tableau", "r",
    "matlab", "autocad", "solidworks", "figma", "photoshop", "android", "kotlin", "swift",
]

_EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
_PHONE_RE = re.compile(
    r"(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|(?:\+91[\s-]?)?[6-9]\d{2}[\s-]?\d{4}[\s-]?\d{4}\b|(?:\+91[\s-]?)?[6-9]\d{9}\b"
)
_CGPA_RE = re.compile(r"(?:cgpa|gpa)[\s:]*([0-9]\.[0-9]{1,2}|[0-9]{1,2})\b", re.IGNORECASE)
_PERCENT_RE = re.compile(r"([0-9]{2,3}(?:\.[0-9]{1,2})?)\s*%")
_GITHUB_RE = re.compile(r"https?://(?:www\.)?github\.com/[\w-]+/?", re.IGNORECASE)
_LINKEDIN_RE = re.compile(r"https?://(?:www\.)?linkedin\.com/in/[\w-]+/?", re.IGNORECASE)


def _split_into_sections(text: str) -> dict[str, str]:
    """Split resume text into sections keyed by canonical section name, based
    on lines that look like a standalone header (short line, matches a known
    keyword). Anything before the first recognised header is treated as the
    header-less top block (often name/contact/summary)."""
    lines = [ln.strip() for ln in text.splitlines()]
    sections: dict[str, list[str]] = {}
    current = "_header"
    sections[current] = []

    for line in lines:
        stripped = line.strip(" \t:•-")
        lower = stripped.lower()
        matched_key = None
        if 0 < len(stripped) <= 45:
            for key, keywords in _SECTION_KEYWORDS.items():
                for kw in keywords:
                    if (
                        lower == kw
                        or lower == f"{kw}s"
                        or lower == f"{kw}:"
                        or lower == f"{kw} :"
                        or lower.startswith(f"{kw}:")
                        or lower.startswith(f"{kw} :")
                        or lower.startswith(f"{kw} -")
                        or lower.startswith(f"{kw} –")
                        or lower.startswith(f"{kw} —")
                        or lower.startswith(f"{kw} /")
                    ):
                        matched_key = key
                        break
                if matched_key:
                    break
        if matched_key:
            current = matched_key
            sections.setdefault(current, [])
            continue
        sections.setdefault(current, []).append(line)

    return {k: "\n".join(v).strip() for k, v in sections.items()}


def _extract_bullet_items(section_text: str) -> list[str]:
    """Split a section's text into distinct entries, using blank lines and
    bullet markers as separators."""
    if not section_text:
        return []
    # Normalise common bullet characters to newlines-with-marker.
    text = re.sub(r"[•●▪‣·]", "\n", section_text)
    raw_lines = [ln.strip(" -\t") for ln in text.split("\n")]
    lines = [ln for ln in raw_lines if ln]
    return lines


_TECH_DISPLAY_NAMES = {
    "python": "Python",
    "java": "Java",
    "c++": "C++",
    "c": "C",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "sql": "SQL",
    "html": "HTML",
    "css": "CSS",
    "react": "React",
    "node.js": "Node.js",
    "node": "Node.js",
    "django": "Django",
    "flask": "Flask",
    "spring": "Spring",
    "angular": "Angular",
    "vue": "Vue",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "aws": "AWS",
    "azure": "Azure",
    "gcp": "GCP",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "git": "Git",
    "github": "GitHub",
    "linux": "Linux",
    "mongodb": "MongoDB",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "excel": "Excel",
    "power bi": "Power BI",
    "tableau": "Tableau",
    "r": "R",
    "matlab": "MATLAB",
    "autocad": "AutoCAD",
    "solidworks": "SolidWorks",
    "figma": "Figma",
    "photoshop": "Photoshop",
    "android": "Android",
    "kotlin": "Kotlin",
    "swift": "Swift",
}


def _guess_full_name(header_block: str) -> str:
    for line in header_block.splitlines():
        candidate = line.strip()
        if not candidate or _EMAIL_RE.search(candidate) or _PHONE_RE.search(candidate) or "github" in candidate.lower() or "linkedin" in candidate.lower():
            continue
        words = candidate.split()
        if 1 <= len(words) <= 4 and all(w.replace(".", "").isalpha() for w in words):
            return candidate.title()
    return ""


def parse_resume_text_heuristic(raw_text: str) -> dict[str, Any]:
    """Best-effort, dependency-free resume parser. Returns a resume_data dict
    (see resume_schema.get_default_resume_data). Always returns *something*
    usable -- fields it can't confidently extract are left blank/empty for
    the student to fill in on the review form."""
    from utils.resume_schema import get_default_resume_data

    data = get_default_resume_data()
    sections = _split_into_sections(raw_text)
    header_block = sections.get("_header", "")

    data["full_name"] = _guess_full_name(header_block)
    email_match = _EMAIL_RE.search(raw_text)
    if email_match:
        data["email"] = email_match.group(0)
    phone_match = _PHONE_RE.search(raw_text)
    if phone_match:
        data["phone"] = phone_match.group(0)
    github_match = _GITHUB_RE.search(raw_text)
    if github_match:
        data["github"] = github_match.group(0)
    linkedin_match = _LINKEDIN_RE.search(raw_text)
    if linkedin_match:
        data["linkedin"] = linkedin_match.group(0)

    if sections.get("summary"):
        data["summary"] = sections["summary"][:600]

    # ---- Skills ----
    found_tech: list[str] = []
    for skill in _KNOWN_TECH_SKILLS:
        s_lower = skill.lower()
        if s_lower == "c":
            if re.search(r"\bC\b", raw_text) or re.search(r"\b[cC]\s*(?:programming|language)\b", raw_text, re.IGNORECASE):
                if "C" not in found_tech:
                    found_tech.append("C")
        elif s_lower == "r":
            if re.search(r"\bR\b", raw_text) or re.search(r"\b[rR]\s*(?:programming|language|package|studio)\b", raw_text, re.IGNORECASE):
                if "R" not in found_tech:
                    found_tech.append("R")
        elif s_lower == "c++":
            if re.search(r"\bc\+\+\b", raw_text, re.IGNORECASE):
                if "C++" not in found_tech:
                    found_tech.append("C++")
        elif s_lower in ("node.js", "node"):
            if re.search(r"\bnode(?:\.js)?\b", raw_text, re.IGNORECASE):
                if "Node.js" not in found_tech:
                    found_tech.append("Node.js")
        elif s_lower == "react":
            if re.search(r"\breact(?:\.js|js)?\b", raw_text, re.IGNORECASE):
                if "React" not in found_tech:
                    found_tech.append("React")
        else:
            pattern = rf"\b{re.escape(s_lower)}\b"
            if re.search(pattern, raw_text, re.IGNORECASE):
                formatted = _TECH_DISPLAY_NAMES.get(s_lower, skill.title() if skill.islower() else skill)
                if formatted not in found_tech:
                    found_tech.append(formatted)

    data["skills_technical"] = found_tech[:20]

    if sections.get("soft_skills"):
        data["skills_soft"] = _extract_bullet_items(sections["soft_skills"])[:10]

    # ---- Projects (Group bullet points under parent project heading) ----
    if sections.get("projects"):
        proj_text = sections["projects"]
        date_pattern = re.compile(r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}\b", re.I)
        projects_list = []
        curr_proj = None

        for line in proj_text.splitlines():
            line_str = line.strip()
            if not line_str:
                continue
            is_bullet = line_str.startswith(("●", "•", "▪", "‣", "-"))
            is_header = "|" in line_str or date_pattern.search(line_str)

            if is_bullet:
                bullet_text = line_str.lstrip("●•▪‣- ").strip()
                if curr_proj:
                    curr_proj["bullets"].append(bullet_text)
                    curr_proj["description"] = (curr_proj["description"] + " " + bullet_text).strip()
            elif is_header or not curr_proj:
                if curr_proj:
                    projects_list.append(curr_proj)
                parts = [p.strip() for p in line_str.split("|")]
                title = parts[0]
                tech = parts[1] if len(parts) > 1 else ""
                curr_proj = {"title": title[:120], "tech_stack": tech[:100], "github_link": "", "live_link": "", "bullets": [], "description": line_str}
            else:
                if curr_proj.get("bullets"):
                    curr_proj["bullets"][-1] += " " + line_str
                    curr_proj["description"] += " " + line_str
                else:
                    curr_proj["title"] += " " + line_str

        if curr_proj:
            projects_list.append(curr_proj)

        # Cleanup bullets key before storing
        for p in projects_list:
            p.pop("bullets", None)
        data["projects"] = projects_list[:15]

    # ---- Experience / Internships (Group bullet points under company/role) ----
    if sections.get("experience"):
        exp_text = sections["experience"]
        date_pattern = re.compile(r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}\b|\bPresent\b", re.I)
        exp_list = []
        curr_exp = None

        for line in exp_text.splitlines():
            line_str = line.strip()
            if not line_str:
                continue
            is_bullet = line_str.startswith(("●", "•", "▪", "‣", "-"))
            has_date = date_pattern.search(line_str)

            if is_bullet:
                bullet_text = line_str.lstrip("●•▪‣- ").strip()
                if curr_exp:
                    curr_exp["bullets"].append(bullet_text)
                    curr_exp["description"] = (curr_exp["description"] + " " + bullet_text).strip()
            elif has_date:
                if curr_exp:
                    exp_list.append(curr_exp)
                curr_exp = {"company": line_str[:120], "role": "", "location": "", "start_date": "", "end_date": "", "bullets": [], "description": ""}
            else:
                if curr_exp:
                    if not curr_exp["role"]:
                        curr_exp["role"] = line_str[:100]
                    elif curr_exp.get("bullets"):
                        curr_exp["bullets"][-1] += " " + line_str
                        curr_exp["description"] += " " + line_str
                    else:
                        curr_exp["company"] += " " + line_str
                else:
                    curr_exp = {"company": line_str[:120], "role": "", "location": "", "start_date": "", "end_date": "", "bullets": [], "description": ""}

        if curr_exp:
            exp_list.append(curr_exp)

        for e in exp_list:
            e.pop("bullets", None)
        data["experience"] = exp_list[:10]

    # ---- Certifications ----
    if sections.get("certifications"):
        items = _extract_bullet_items(sections["certifications"])
        data["certifications"] = [{"name": item[:150], "issuer": "", "year": "", "url": ""}
                                   for item in items[:15]]

    # ---- Co-curricular ----
    if sections.get("cocurricular"):
        data["cocurricular"] = _extract_bullet_items(sections["cocurricular"])[:15]

    # ---- Education (Extract institution names, degrees, streams, years, and scores) ----
    edu_text = sections.get("education", "") or raw_text
    edu_lines = [ln.strip() for ln in edu_text.splitlines() if ln.strip()]
    education_entries = []
    level_patterns = [
        ("UG", [r"b\.?\s*tech", r"b\.?\s*e\b", r"bachelor", r"undergraduate", r"b\.?\s*s\.?\b", r"b\.?\s*c\.?\s*a\b"]),
        ("12th", [r"\b12th\b", r"\bhsc\b", r"class\s*xii\b", r"\bdiploma\b", r"higher secondary", r"senior secondary", r"intermediate"]),
        ("10th", [r"\b10th\b", r"\bssc\b", r"class\s*x\b", r"high school", r"secondary education", r"matriculation"]),
    ]
    matched_levels = set()
    year_pattern = re.compile(r"\b(19\d\d|20\d\d)(?:\s*[–\-—]\s*(?:19\d\d|20\d\d|Present))?\b", re.IGNORECASE)

    for i, line in enumerate(edu_lines):
        for level, patterns in level_patterns:
            if level in matched_levels:
                continue
            if any(re.search(pattern, line, re.IGNORECASE) for pattern in patterns):
                # Capture institution / school name from preceding line if present
                inst_name = ""
                if i > 0:
                    prev_line = edu_lines[i - 1]
                    if not any(re.search(p, prev_line, re.IGNORECASE) for _, pats in level_patterns for p in pats):
                        inst_name = prev_line

                context = " ".join(edu_lines[max(0, i - 1):min(len(edu_lines), i + 3)])
                same_line_cgpa = _CGPA_RE.search(context)
                same_line_pct = _PERCENT_RE.search(context)
                year_match = year_pattern.search(context)

                # Detect stream/branch from context
                stream_val = ""
                combined_edu = context.lower()
                if re.search(r"\b(computer science|cse|software)\b", combined_edu):
                    stream_val = "Computer Science and Engineering"
                elif re.search(r"\b(information technology)\b", combined_edu) or " it " in f" {combined_edu} ":
                    stream_val = "Information Technology"
                elif re.search(r"\b(electronics|ece|electrical)\b", combined_edu):
                    stream_val = "Electronics and Communication"
                elif re.search(r"\b(mechanical)\b", combined_edu):
                    stream_val = "Mechanical Engineering"
                elif re.search(r"\b(civil)\b", combined_edu):
                    stream_val = "Civil Engineering"

                education_entries.append({
                    "level": level,
                    "institution": inst_name[:120],
                    "board_university": "",
                    "year_of_passing": year_match.group(0) if year_match else "",
                    "percentage_cgpa": (same_line_cgpa or same_line_pct).group(1) if (same_line_cgpa or same_line_pct) else "",
                    "stream": stream_val if stream_val else line[:80],
                })
                matched_levels.add(level)
                break

    data["education"] = education_entries

    return data


# ─────────────────────────────────────────────────────────────────────────────
# 3. RESUME DATA  →  MODEL FEATURE MAPPING
# ─────────────────────────────────────────────────────────────────────────────


def _cgpa_from_education(education: list[dict], level: str) -> float | None:
    for entry in education:
        if entry.get("level") == level and entry.get("percentage_cgpa"):
            raw = str(entry["percentage_cgpa"]).strip()
            try:
                value = float(re.sub(r"[^\d.]", "", raw))
            except ValueError:
                continue
            if level == "UG":
                # A value > 10 is almost certainly a percentage, not a 10-point
                # CGPA -- convert it down so it's on the scale the model was
                # trained on. A value <= 10 is already a native CGPA.
                return value / 9.5 if value > 10 else value
            # 10th/12th are stored as percentages; convert if it looks like a CGPA.
            return value * 9.5 if value <= 10 else value
    return None


def map_resume_to_features(resume_data: dict[str, Any]) -> dict[str, Any]:
    """
    Convert a resume_data dict into a partial model-feature dict. Only keys
    that could be confidently derived are included -- everything else is
    left for `model_utils.fill_defaults()` to back-fill with dataset medians
    (and for the student to adjust on the review form).
    """
    features: dict[str, Any] = {}

    ug_cgpa = _cgpa_from_education(resume_data.get("education", []), "UG")
    if ug_cgpa is not None:
        features["cgpa"] = round(min(ug_cgpa, 10.0), 2)

    tenth = _cgpa_from_education(resume_data.get("education", []), "10th")
    if tenth is not None:
        features["tenth_percentage"] = round(min(tenth, 100.0), 1)

    twelfth = _cgpa_from_education(resume_data.get("education", []), "12th")
    if twelfth is not None:
        features["twelfth_percentage"] = round(min(twelfth, 100.0), 1)

    features["projects_completed"] = len(resume_data.get("projects", []))
    features["certifications_count"] = len(resume_data.get("certifications", []))

    experience = resume_data.get("experience", [])
    internship_like = [e for e in experience if "intern" in (e.get("role", "") + e.get("description", "")).lower()]
    features["internships_completed"] = len(internship_like) if internship_like else len(experience)

    cocurricular_count = len(resume_data.get("cocurricular", []))
    if cocurricular_count == 0:
        features["extracurricular_involvement"] = "Low"
    elif cocurricular_count <= 2:
        features["extracurricular_involvement"] = "Medium"
    else:
        features["extracurricular_involvement"] = "High"

    n_tech = len(resume_data.get("skills_technical", []))
    if n_tech >= 10:
        features["coding_skill_rating"] = 5.0
    elif n_tech >= 6:
        features["coding_skill_rating"] = 4.0
    elif n_tech >= 3:
        features["coding_skill_rating"] = 3.0
    elif n_tech >= 1:
        features["coding_skill_rating"] = 2.0

    n_soft = len(resume_data.get("skills_soft", []))
    all_text = " ".join(resume_data.get("skills_soft", [])).lower()
    if n_soft:
        base = max(1, min(5, 1 + n_soft // 2))
        if any(k in all_text for k in ["communicat", "leadership", "public speak"]):
            base = min(5, base + 1)
        features["communication_skill_rating"] = base

    hackathon_mentions = sum(
        1 for p in resume_data.get("projects", []) + [
            {"description": c} for c in resume_data.get("cocurricular", [])
        ]
        if "hackathon" in (p.get("description", "") or "").lower()
    )
    if hackathon_mentions:
        features["hackathons_participated"] = min(hackathon_mentions, 6)

    # Branch, from the highest-level education entry's stream text, if present.
    for entry in resume_data.get("education", []):
        stream = (entry.get("stream") or "").lower()
        if not stream:
            continue
        if "computer" in stream or "cse" in stream:
            features["branch"] = "CSE"
        elif "information technology" in stream or " it" in f" {stream}":
            features["branch"] = "IT"
        elif "electronic" in stream or "ece" in stream:
            features["branch"] = "ECE"
        elif "mechanical" in stream:
            features["branch"] = "ME"
        elif "civil" in stream:
            features["branch"] = "CE"
        if "branch" in features:
            break

    # Fallback to checking overall resume text if branch still undetermined
    if "branch" not in features:
        combined_text = " ".join([
            resume_data.get("full_name", ""),
            resume_data.get("summary", ""),
            " ".join(e.get("stream", "") + " " + e.get("institution", "") + " " + e.get("board_university", "") for e in resume_data.get("education", [])),
            " ".join(p.get("title", "") + " " + p.get("description", "") for p in resume_data.get("projects", []))
        ]).lower()
        if re.search(r"\b(computer science|cse|software engineering)\b", combined_text):
            features["branch"] = "CSE"
        elif re.search(r"\b(information technology)\b", combined_text) or " it " in f" {combined_text} ":
            features["branch"] = "IT"
        elif re.search(r"\b(electronics|ece|electrical)\b", combined_text):
            features["branch"] = "ECE"
        elif re.search(r"\b(mechanical engineering|mechanical)\b", combined_text):
            features["branch"] = "ME"
        elif re.search(r"\b(civil engineering|civil)\b", combined_text):
            features["branch"] = "CE"

    return {k: v for k, v in features.items() if v is not None}
