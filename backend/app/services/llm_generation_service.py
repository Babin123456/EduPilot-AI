"""EduPilot AI — LLM Generation Service for Quizzes, Assignments, and Daily Notes.

Uses Groq (Primary / Secondary) or Gemini (Fallback) to generate 100% real,
syllabus-aligned, domain-specific quiz questions, assignment papers, and lecture notes.
"""

from __future__ import annotations

import json
import logging
import re
import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _call_llm_raw(prompt: str, system_prompt: str = "") -> str | None:
    """Call Groq (Key 1 -> Key 2) or Gemini fallback to get raw text completion."""
    settings = get_settings()

    # Build Groq messages payload
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    # 1. Try Groq API Key 1
    api_key_1 = (settings.groq_api_key_1 or "").strip()
    if api_key_1 and "your_" not in api_key_1 and len(api_key_1) >= 25:
        try:
            with httpx.Client(timeout=20.0) as client:
                res = client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    json={
                        "model": settings.groq_model or "llama-3.3-70b-versatile",
                        "messages": messages,
                        "temperature": 0.5,
                        "max_tokens": 2048,
                    },
                    headers={
                        "Authorization": f"Bearer {api_key_1}",
                        "Content-Type": "application/json",
                    },
                )
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"]
                    if content:
                        return content
                else:
                    logger.warning("Groq Key 1 returned status %d: %s", res.status_code, res.text)
        except Exception as e:
            logger.warning("Groq Key 1 call failed: %s", str(e))

    # 2. Try Groq API Key 2
    api_key_2 = (settings.groq_api_key_2 or "").strip()
    if api_key_2 and "your_" not in api_key_2 and len(api_key_2) >= 25:
        try:
            with httpx.Client(timeout=20.0) as client:
                res = client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    json={
                        "model": settings.groq_model or "llama-3.3-70b-versatile",
                        "messages": messages,
                        "temperature": 0.5,
                        "max_tokens": 2048,
                    },
                    headers={
                        "Authorization": f"Bearer {api_key_2}",
                        "Content-Type": "application/json",
                    },
                )
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"]
                    if content:
                        return content
                else:
                    logger.warning("Groq Key 2 returned status %d: %s", res.status_code, res.text)
        except Exception as e:
            logger.warning("Groq Key 2 call failed: %s", str(e))

    # 3. Try Gemini Fallback
    gemini_key = (settings.gemini_api_key or "").strip()
    if gemini_key and "your_" not in gemini_key and len(gemini_key) >= 25:
        try:
            gemini_model = settings.gemini_model or "gemini-1.5-flash"
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={gemini_key}"
            full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
            with httpx.Client(timeout=20.0) as client:
                res = client.post(
                    url,
                    json={"contents": [{"parts": [{"text": full_prompt}]}]},
                    headers={"Content-Type": "application/json"},
                )
                if res.status_code == 200:
                    content = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                    if content:
                        return content
        except Exception as e:
            logger.warning("Gemini call failed: %s", str(e))

    return None


def _clean_json_response(raw_text: str) -> str:
    """Strip markdown codeblock backticks ```json ... ``` if present."""
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# REAL AI QUIZ GENERATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def generate_real_mcq_quiz(
    topic: str,
    course_name: str,
    course_code: str,
    difficulty: str = "medium",
    num_questions: int = 10,
) -> list[dict] | None:
    """Use Groq/Gemini to generate real, domain-specific MCQ questions."""
    system_prompt = (
        "You are an expert university professor creating a high-quality academic multiple-choice quiz. "
        "Return ONLY a raw JSON array of objects. Do not include markdown headers, preambles, or conversational commentary."
    )

    prompt = f"""Create an academic MCQ quiz for the course '{course_name}' (Code: {course_code}) on the topic '{topic}'.
Difficulty Level: {difficulty.upper()}
Number of Questions: {num_questions}

Requirements for each question:
- Clear, real-world or theoretical question stem specifically testing '{topic}'.
- 4 realistic options labeled A), B), C), D).
- One clear correct option ("A", "B", "C", or "D").
- Brief explanation of why the answer is correct.

Output JSON format strictly as an array of objects:
[
  {{
    "number": 1,
    "text": "Exact question text here?",
    "type": "mcq",
    "options": [
      "A) Option 1 text",
      "B) Option 2 text",
      "C) Option 3 text",
      "D) Option 4 text"
    ],
    "correct_option": "A",
    "explanation": "Brief explanation why A is correct",
    "marks": 2
  }}
]
"""

    raw_response = _call_llm_raw(prompt, system_prompt)
    if not raw_response:
        return None

    try:
        json_str = _clean_json_response(raw_response)
        parsed = json.loads(json_str)
        if isinstance(parsed, list) and len(parsed) > 0:
            # Ensure number and marks fields are populated properly
            for i, q in enumerate(parsed):
                q["number"] = i + 1
                q["marks"] = q.get("marks") or 2
                q["type"] = "mcq"
            return parsed
    except Exception as e:
        logger.error("Failed to parse LLM response for MCQ quiz: %s\nRaw: %s", str(e), raw_response[:300])

    return None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# REAL AI ASSIGNMENT GENERATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def generate_real_assignment(
    topic: str,
    course_name: str,
    course_code: str,
    difficulty: str = "medium",
    num_questions: int = 5,
) -> tuple[list[dict], str] | None:
    """Use Groq/Gemini to generate real, analytical & problem-solving assignment questions."""
    system_prompt = (
        "You are a university professor designing a rigorous academic assignment paper. "
        "Return ONLY a raw JSON array of objects. Do not include markdown headers, preambles, or conversational commentary."
    )

    prompt = f"""Create an academic assignment question paper for the course '{course_name}' (Code: {course_code}) on the topic '{topic}'.
Difficulty Level: {difficulty.upper()}
Number of Questions: {num_questions}

Generate a balanced mix of short answer questions, conceptual analysis, mathematical/code derivations, and 1-2 MCQs.

Output JSON format strictly as an array of objects:
[
  {{
    "number": 1,
    "text": "Detailed question prompt testing {topic}...",
    "type": "short",
    "options": null,
    "marks": 5
  }},
  {{
    "number": 2,
    "text": "Multiple choice question prompt testing {topic}...",
    "type": "mcq",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "marks": 5
  }}
]
"""

    raw_response = _call_llm_raw(prompt, system_prompt)
    if not raw_response:
        return None

    try:
        json_str = _clean_json_response(raw_response)
        questions = json.loads(json_str)
        if isinstance(questions, list) and len(questions) > 0:
            for i, q in enumerate(questions):
                q["number"] = i + 1
                q["marks"] = q.get("marks") or 5

            # Build markdown document for full paper preview
            md_lines = [
                f"# Assignment Task Paper — {topic}",
                f"**Course:** {course_name} (`{course_code}`) | **Total Marks:** {len(questions) * 5} | **Difficulty:** {difficulty.upper()}",
                "\n---\n",
            ]
            for q in questions:
                md_lines.append(f"### Question {q['number']} [{q['marks']} Marks]\n{q['text']}\n")
                if q.get("options"):
                    for opt in q["options"]:
                        md_lines.append(f"- {opt}")
                    md_lines.append("")
                md_lines.append("")

            return questions, "\n".join(md_lines)
    except Exception as e:
        logger.error("Failed to parse LLM response for assignment: %s\nRaw: %s", str(e), raw_response[:300])

    return None
