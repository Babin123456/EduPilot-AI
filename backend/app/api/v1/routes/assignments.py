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


# ─── Task 3: Submission Ingestion ────────────────────────────────────────────

class SubmitAssignmentRequest(BaseModel):
    student_id: str
    content: str | None = None
    file_url: str | None = None


@router.post("/{assignment_id}/submit", status_code=201)
def submit_assignment(
    assignment_id: str,
    body: SubmitAssignmentRequest,
    db: Database = Depends(get_db),
):
    """Ingest a student's assignment submission (text or file URL)."""
    from app.models.assignment import new_assignment_submission

    assignment = db.assignments.find_one({"id": assignment_id})
    if not assignment:
        raise http_404("Assignment not found")

    student = db.students.find_one({"id": body.student_id})
    if not student:
        raise http_404("Student not found")

    now = datetime.now(timezone.utc)
    deadline = assignment.get("deadline")
    is_late = False
    if deadline and hasattr(deadline, "replace"):
        is_late = now > deadline

    existing = db.assignment_submissions.find_one(
        {"assignment_id": assignment_id, "student_id": body.student_id}
    )
    if existing:
        db.assignment_submissions.update_one(
            {"id": existing["id"]},
            {"$set": {
                "content": body.content,
                "file_url": body.file_url,
                "submitted_at": now,
                "is_late": is_late,
                "status": "submitted",
                "updated_at": now,
            }},
        )
        return {"submission_id": existing["id"], "message": "Submission updated successfully", "is_late": is_late}

    sub_doc = new_assignment_submission(
        assignment_id=assignment_id,
        student_id=body.student_id,
        content=body.content,
        file_url=body.file_url,
        submitted_at=now,
        is_late=is_late,
        max_score=assignment.get("total_marks", 100),
        status="submitted",
    )
    db.assignment_submissions.insert_one(sub_doc)
    return {"submission_id": sub_doc["id"], "message": "Submission received successfully", "is_late": is_late}


# ─── Task 3: AI Auto-Grading ─────────────────────────────────────────────────

@router.post("/{assignment_id}/evaluate-ai")
def evaluate_assignment_ai(
    assignment_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Run LLM evaluation on all ungraded submissions for this assignment."""
    assignment = db.assignments.find_one({"id": assignment_id})
    if not assignment:
        raise http_404("Assignment not found")

    tca = db.teacher_course_assignments.find_one(
        {"id": assignment["teacher_course_assignment_id"], "teacher_id": teacher["id"]}
    )
    if not tca:
        raise http_403("Not authorized")

    subs = list(db.assignment_submissions.find({"assignment_id": assignment_id, "is_graded": False}))
    if not subs:
        return {"message": "No ungraded submissions found", "graded_count": 0}

    max_score = assignment.get("total_marks", 100)
    rubric = assignment.get("rubric") or "Grade based on conceptual correctness, clarity, and completeness."
    graded_count = 0

    for sub in subs:
        content = sub.get("content") or ""
        if not content.strip():
            continue

        feedback = ""
        score = 0.0
        ai_confidence = 0.5

        try:
            from app.services.llm_generation_service import evaluate_submission_with_llm
            result = evaluate_submission_with_llm(
                submission_text=content,
                rubric=rubric,
                max_score=max_score,
                assignment_title=assignment.get("title", ""),
            )
            if result:
                score = result.get("score", 0.0)
                feedback = result.get("feedback", "")
                ai_confidence = result.get("confidence", 0.75)
        except Exception as exc:
            logger.warning("LLM evaluation failed for submission %s: %s", sub["id"], exc)
            word_count = len(content.split())
            score = min(max_score, round(max_score * min(word_count / 250, 1.0) * 0.80, 1))
            feedback = (
                f"Auto-evaluated: submission contains {word_count} words. "
                f"Manual review recommended to verify accuracy and depth."
            )
            ai_confidence = 0.4

        now = datetime.now(timezone.utc)
        db.assignment_submissions.update_one(
            {"id": sub["id"]},
            {"$set": {
                "score": score,
                "max_score": max_score,
                "feedback": feedback,
                "ai_evaluation": feedback,
                "ai_confidence": ai_confidence,
                "is_graded": True,
                "graded_by": "ai",
                "graded_at": now,
                "status": "graded",
                "updated_at": now,
            }},
        )
        graded_count += 1

    return {
        "assignment_id": assignment_id,
        "graded_count": graded_count,
        "message": f"AI evaluation complete — {graded_count} submission(s) graded.",
    }


# ─── Task 3: Teacher Grade Override ──────────────────────────────────────────

class GradeOverrideRequest(BaseModel):
    score: float
    feedback: str | None = None


@router.put("/submissions/{submission_id}/grade")
def teacher_grade_override(
    submission_id: str,
    body: GradeOverrideRequest,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Teacher override to set final score and feedback on a submission."""
    sub = db.assignment_submissions.find_one({"id": submission_id})
    if not sub:
        raise http_404("Submission not found")

    assignment = db.assignments.find_one({"id": sub["assignment_id"]})
    if not assignment:
        raise http_404("Assignment not found")

    tca = db.teacher_course_assignments.find_one(
        {"id": assignment["teacher_course_assignment_id"], "teacher_id": teacher["id"]}
    )
    if not tca:
        raise http_403("Not authorized")

    max_score = assignment.get("total_marks", 100)
    score = min(max_score, max(0.0, body.score))
    now = datetime.now(timezone.utc)

    db.assignment_submissions.update_one(
        {"id": submission_id},
        {"$set": {
            "score": score,
            "max_score": max_score,
            "feedback": body.feedback,
            "is_graded": True,
            "graded_by": teacher["id"],
            "graded_at": now,
            "status": "graded",
            "updated_at": now,
        }},
    )
    return {
        "submission_id": submission_id,
        "score": score,
        "max_score": max_score,
        "message": "Grade saved successfully",
    }


# ─── Task 3: Submission Analytics ────────────────────────────────────────────

@router.get("/{assignment_id}/analytics")
def assignment_analytics(
    assignment_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Submission rate, score distribution, and late submission stats."""
    assignment = db.assignments.find_one({"id": assignment_id})
    if not assignment:
        raise http_404("Assignment not found")

    tca = db.teacher_course_assignments.find_one(
        {"id": assignment["teacher_course_assignment_id"], "teacher_id": teacher["id"]}
    )
    if not tca:
        raise http_403("Not authorized")

    total_students = db.students.count_documents({"section_id": tca.get("section_id"), "is_active": True})
    subs = list(db.assignment_submissions.find({"assignment_id": assignment_id}))

    total_submitted = len(subs)
    graded_subs = [s for s in subs if s.get("is_graded")]
    late_subs = [s for s in subs if s.get("is_late")]
    scores = [s["score"] for s in graded_subs if s.get("score") is not None]

    avg_score = round(sum(scores) / len(scores), 2) if scores else 0
    max_score_val = max(scores) if scores else 0
    min_score_val = min(scores) if scores else 0
    pass_mark = (assignment.get("total_marks", 100) or 100) * 0.40
    pass_count = sum(1 for s in scores if s >= pass_mark)

    # Simple score buckets
    buckets = {"90-100%": 0, "75-89%": 0, "60-74%": 0, "40-59%": 0, "<40%": 0}
    total_marks = assignment.get("total_marks") or 100
    for s in scores:
        pct = (s / total_marks) * 100
        if pct >= 90:
            buckets["90-100%"] += 1
        elif pct >= 75:
            buckets["75-89%"] += 1
        elif pct >= 60:
            buckets["60-74%"] += 1
        elif pct >= 40:
            buckets["40-59%"] += 1
        else:
            buckets["<40%"] += 1

    return {
        "assignment_id": assignment_id,
        "title": assignment.get("title"),
        "total_students": total_students,
        "total_submitted": total_submitted,
        "submission_rate": round((total_submitted / total_students * 100), 1) if total_students else 0,
        "total_graded": len(graded_subs),
        "late_submissions": len(late_subs),
        "average_score": avg_score,
        "highest_score": max_score_val,
        "lowest_score": min_score_val,
        "pass_count": pass_count,
        "fail_count": len(scores) - pass_count,
        "score_distribution": buckets,
    }

