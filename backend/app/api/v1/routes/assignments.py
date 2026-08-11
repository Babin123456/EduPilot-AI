"""Assignments routes."""

from __future__ import annotations
import json
import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from pymongo.database import Database

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.core.exceptions import http_403, http_404
from app.models.assignment import new_assignment
from app.models.document import new_document
from app.models.student import student_full_name

logger = logging.getLogger(__name__)

router = APIRouter()


class CreateAssignmentRequest(BaseModel):
    class_id: str
    title: str
    description: str | None = None
    instructions: str | None = None
    topic: str | None = None
    difficulty: str = "medium"
    total_marks: int = 100
    deadline: str | None = None


class GenerateAssignmentRequest(BaseModel):
    class_id: str
    topic: str
    difficulty: str = "medium"
    num_questions: int = 5


@router.post("/generate")
def generate_ai_assignment(
    body: GenerateAssignmentRequest,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Generate dynamic AI assignment question paper using Groq/Gemini LLM with template fallback."""
    tca = db.teacher_course_assignments.find_one({
        "id": body.class_id, "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized")

    course = db.courses.find_one({"id": tca["course_id"]})
    course_name = course["name"] if course else "Coursework"
    course_code = course["code"] if course else ""

    topic = body.topic.strip()

    # ── Try real LLM generation first ──
    questions = None
    full_markdown = None
    try:
        from app.services.llm_generation_service import generate_real_assignment
        result = generate_real_assignment(
            topic=topic,
            course_name=course_name,
            course_code=course_code,
            difficulty=body.difficulty,
            num_questions=body.num_questions,
        )
        if result:
            questions, full_markdown = result
            logger.info("LLM generated %d real assignment questions for topic '%s'", len(questions), topic)
    except Exception as e:
        logger.warning("LLM assignment generation failed, falling back to templates: %s", str(e))

    # ── Fallback: template-based generation if LLM fails ──
    if not questions:
        logger.info("Using template fallback for assignment generation on topic '%s'", topic)
        q_templates = [
            f"Analyze the core architectural principles of {topic} in the context of {course_name}. Detail how system throughput and execution efficiency are maintained.",
            f"Compare and contrast key algorithmic paradigms used when implementing {topic}. Provide concrete mathematical or structural trade-offs.",
            f"Design a robust solution for a real-world enterprise scenario requiring {topic}. Identify potential failure modes and mitigation strategies.",
            f"Explain how error-handling, data validation, and fault tolerance operate within {topic} frameworks.",
            f"Derive the time and space complexity bounds for standard operations in {topic}, highlighting best-case vs worst-case bounds.",
        ]

        questions = []
        for i in range(body.num_questions):
            idx = i % len(q_templates)
            q_text = q_templates[idx]
            is_mcq = (i % 2 == 0)
            options = None
            if is_mcq:
                options = [
                    f"A) Primary theoretical model for {topic}",
                    f"B) Extended optimization strategy",
                    f"C) Algorithmic decomposition pattern",
                    f"D) Asynchronous execution pipeline",
                ]

            questions.append({
                "number": i + 1,
                "text": q_text,
                "type": "mcq" if is_mcq else "short",
                "options": options,
                "marks": 5,
            })

        md_lines = [
            f"# Assignment Task Paper — {topic}",
            f"**Course:** {course_name} (`{course_code}`) | **Total Marks:** {body.num_questions * 5} | **Difficulty:** {body.difficulty.upper()}",
            f"**Faculty:** {teacher['first_name']} {teacher['last_name']} ({teacher.get('designation', 'Department of CSE')})",
            "\n---\n",
        ]

        for q in questions:
            md_lines.append(f"### Question {q['number']} [{q['marks']} Marks]\n{q['text']}")
            if q['options']:
                for opt in q['options']:
                    md_lines.append(f"- {opt}")
            md_lines.append("")

        full_markdown = "\n".join(md_lines)

    total_marks = sum(q.get("marks", 5) for q in questions)

    # Auto-save assignment record
    assignment_doc = new_assignment(
        teacher_course_assignment_id=body.class_id,
        teacher_id=teacher["id"],
        title=f"Assignment — {topic}",
        description=f"AI Generated Assignment Task Paper on {topic}",
        instructions=full_markdown,
        topic=topic,
        difficulty=body.difficulty,
        total_marks=total_marks,
        questions_json=json.dumps(questions),
        status="published",
        is_published=True,
        is_ai_generated=True,
    )
    db.assignments.insert_one(assignment_doc)

    # Save to Document Studio
    doc = new_document(
        teacher_course_assignment_id=body.class_id,
        teacher_id=teacher["id"],
        title=f"Assignment — {topic}",
        document_type="assignment",
        format="pdf",
    )
    db.documents.insert_one(doc)

    return {
        "assignment_id": assignment_doc["id"],
        "title": assignment_doc["title"],
        "topic": topic,
        "difficulty": body.difficulty,
        "questions": questions,
        "markdown": full_markdown,
    }



@router.get("")
def list_assignments(
    class_id: str = Query(...),
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """List assignments for a class."""
    tca = db.teacher_course_assignments.find_one({
        "id": class_id, "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized")

    assignments = list(
        db.assignments.find({"teacher_course_assignment_id": class_id})
        .sort("created_at", -1)
    )

    result = []
    for a in assignments:
        submitted = db.assignment_submissions.count_documents({
            "assignment_id": a["id"],
            "status": {"$ne": "pending"},
        })
        total = db.students.count_documents({
            "section_id": tca["section_id"], "is_active": True,
        })

        q_list = []
        if a.get("questions_json"):
            try:
                q_list = json.loads(a["questions_json"])
            except Exception:
                q_list = []

        created_at = a.get("created_at")
        result.append({
            "id": a["id"],
            "title": a["title"],
            "topic": a.get("topic"),
            "difficulty": a.get("difficulty", "medium"),
            "total_marks": a.get("total_marks", 100),
            "instructions": a.get("instructions", ""),
            "questions": q_list,
            "deadline": a["deadline"].isoformat() if hasattr(a.get("deadline"), 'isoformat') else a.get("deadline"),
            "status": a.get("status", "draft"),
            "is_ai_generated": a.get("is_ai_generated", False),
            "submitted_count": submitted,
            "total_students": total,
            "created_at": created_at.isoformat() if hasattr(created_at, 'isoformat') else created_at,
        })

    return result



@router.post("")
def create_assignment(
    body: CreateAssignmentRequest,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Create a new assignment."""
    tca = db.teacher_course_assignments.find_one({
        "id": body.class_id, "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized")

    assignment_doc = new_assignment(
        teacher_course_assignment_id=body.class_id,
        teacher_id=teacher["id"],
        title=body.title,
        description=body.description,
        instructions=body.instructions,
        topic=body.topic,
        difficulty=body.difficulty,
        total_marks=body.total_marks,
        deadline=datetime.fromisoformat(body.deadline) if body.deadline else None,
        status="published",
        is_published=True,
    )
    db.assignments.insert_one(assignment_doc)

    return {"id": assignment_doc["id"], "message": "Assignment created successfully"}


@router.get("/{assignment_id}/submissions")
def get_submissions(
    assignment_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get submissions for an assignment."""
    assignment = db.assignments.find_one({"id": assignment_id})
    if not assignment:
        raise http_404("Assignment not found")

    tca = db.teacher_course_assignments.find_one({
        "id": assignment["teacher_course_assignment_id"],
        "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized")

    subs = list(db.assignment_submissions.find({"assignment_id": assignment_id}))

    result = []
    for s in subs:
        st = db.students.find_one({"id": s["student_id"]})
        if st:
            submitted_at = s.get("submitted_at")
            result.append({
                "id": s["id"],
                "student_id": st["id"],
                "student_name": student_full_name(st),
                "roll_number": st["roll_number"],
                "status": s.get("status", "pending"),
                "score": s.get("score"),
                "max_score": s.get("max_score"),
                "is_late": s.get("is_late", False),
                "is_graded": s.get("is_graded", False),
                "submitted_at": submitted_at.isoformat() if hasattr(submitted_at, 'isoformat') else submitted_at,
            })

    result.sort(key=lambda x: x["roll_number"])
    return result
