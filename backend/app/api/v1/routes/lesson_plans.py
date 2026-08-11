"""Lesson Plans routes — CRUD + AI generation."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from pymongo.database import Database

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.core.exceptions import http_403, http_404
from app.models.lesson import new_lesson_plan, LESSON_PLANS

logger = logging.getLogger(__name__)

router = APIRouter()


# ─── Pydantic Schemas ────────────────────────────────────────────────────────

class CreateLessonPlanRequest(BaseModel):
    class_id: str
    title: str
    topic: str
    unit: str | None = None
    duration_minutes: int = 60
    prerequisites: list[str] | None = None
    learning_objectives: list[str] | None = None
    introduction: str | None = None
    content: str | None = None
    activities: list[str] | None = None
    summary: str | None = None
    homework: str | None = None
    status: str = "draft"


class UpdateLessonPlanRequest(BaseModel):
    title: str | None = None
    topic: str | None = None
    unit: str | None = None
    duration_minutes: int | None = None
    prerequisites: list[str] | None = None
    learning_objectives: list[str] | None = None
    introduction: str | None = None
    content: str | None = None
    activities: list[str] | None = None
    summary: str | None = None
    homework: str | None = None
    status: str | None = None


class GenerateLessonPlanRequest(BaseModel):
    class_id: str
    topic: str
    unit: str | None = None
    duration_minutes: int = 60


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _serialize(plan: dict) -> dict:
    """Convert MongoDB document to JSON-safe dict."""
    created = plan.get("created_at")
    updated = plan.get("updated_at")
    return {
        "id": plan["id"],
        "teacher_course_assignment_id": plan.get("teacher_course_assignment_id"),
        "teacher_id": plan.get("teacher_id"),
        "title": plan.get("title"),
        "topic": plan.get("topic"),
        "unit": plan.get("unit"),
        "duration_minutes": plan.get("duration_minutes", 60),
        "prerequisites": plan.get("prerequisites") or [],
        "learning_objectives": plan.get("learning_objectives") or [],
        "introduction": plan.get("introduction"),
        "content": plan.get("content"),
        "examples": plan.get("examples"),
        "activities": plan.get("activities") or [],
        "assessment_questions": plan.get("assessment_questions"),
        "summary": plan.get("summary"),
        "homework": plan.get("homework"),
        "references": plan.get("references"),
        "full_content": plan.get("full_content"),
        "is_ai_generated": plan.get("is_ai_generated", False),
        "status": plan.get("status", "draft"),
        "created_at": created.isoformat() if hasattr(created, "isoformat") else created,
        "updated_at": updated.isoformat() if hasattr(updated, "isoformat") else updated,
    }


def _verify_tca(db: Database, class_id: str, teacher_id: str) -> dict:
    tca = db.teacher_course_assignments.find_one({"id": class_id, "teacher_id": teacher_id})
    if not tca:
        raise http_403("Not authorized for this class")
    return tca


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.get("")
def list_lesson_plans(
    class_id: str = Query(..., description="Teacher-Course-Assignment ID"),
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """List all lesson plans for the given class assignment."""
    _verify_tca(db, class_id, teacher["id"])
    plans = list(
        db[LESSON_PLANS]
        .find({"teacher_course_assignment_id": class_id})
        .sort("created_at", -1)
    )
    return [_serialize(p) for p in plans]


@router.post("", status_code=201)
def create_lesson_plan(
    body: CreateLessonPlanRequest,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Create a new lesson plan (draft or published)."""
    _verify_tca(db, body.class_id, teacher["id"])
    doc = new_lesson_plan(
        teacher_course_assignment_id=body.class_id,
        teacher_id=teacher["id"],
        title=body.title,
        topic=body.topic,
        unit=body.unit,
        duration_minutes=body.duration_minutes,
        prerequisites=body.prerequisites,
        learning_objectives=body.learning_objectives,
        introduction=body.introduction,
        content=body.content,
        activities=body.activities,
        summary=body.summary,
        homework=body.homework,
        status=body.status,
    )
    db[LESSON_PLANS].insert_one(doc)
    logger.info("Lesson plan created: %s by teacher %s", doc["id"], teacher["id"])
    return {"id": doc["id"], "message": "Lesson plan created successfully"}


@router.get("/{plan_id}")
def get_lesson_plan(
    plan_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Fetch a single lesson plan with full breakdown."""
    plan = db[LESSON_PLANS].find_one({"id": plan_id})
    if not plan:
        raise http_404("Lesson plan not found")
    _verify_tca(db, plan["teacher_course_assignment_id"], teacher["id"])
    return _serialize(plan)


@router.put("/{plan_id}")
def update_lesson_plan(
    plan_id: str,
    body: UpdateLessonPlanRequest,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Update / edit an existing lesson plan."""
    plan = db[LESSON_PLANS].find_one({"id": plan_id})
    if not plan:
        raise http_404("Lesson plan not found")
    _verify_tca(db, plan["teacher_course_assignment_id"], teacher["id"])

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    updates["updated_at"] = datetime.now(timezone.utc)

    db[LESSON_PLANS].update_one({"id": plan_id}, {"$set": updates})
    updated = db[LESSON_PLANS].find_one({"id": plan_id})
    return _serialize(updated)


@router.delete("/{plan_id}", status_code=204)
def delete_lesson_plan(
    plan_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Delete a lesson plan permanently."""
    plan = db[LESSON_PLANS].find_one({"id": plan_id})
    if not plan:
        raise http_404("Lesson plan not found")
    _verify_tca(db, plan["teacher_course_assignment_id"], teacher["id"])
    db[LESSON_PLANS].delete_one({"id": plan_id})
    logger.info("Lesson plan deleted: %s by teacher %s", plan_id, teacher["id"])


@router.post("/generate-ai", status_code=201)
def generate_ai_lesson_plan(
    body: GenerateLessonPlanRequest,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """AI-powered lesson plan generator using Groq/Gemini, with template fallback."""
    tca = _verify_tca(db, body.class_id, teacher["id"])
    course = db.courses.find_one({"id": tca["course_id"]}) or {}
    course_name = course.get("name", "Course")
    course_code = course.get("code", "")
    topic = body.topic.strip()
    duration = body.duration_minutes

    # ── Try real LLM generation ──────────────────────────────────────────────
    structured = None
    try:
        from app.services.llm_generation_service import generate_real_lesson_plan
        structured = generate_real_lesson_plan(
            topic=topic,
            course_name=course_name,
            course_code=course_code,
            duration_minutes=duration,
            unit=body.unit,
        )
        if structured:
            logger.info("LLM generated lesson plan for topic '%s'", topic)
    except Exception as exc:
        logger.warning("LLM lesson plan generation failed, using template: %s", exc)

    # ── Template fallback ────────────────────────────────────────────────────
    if not structured:
        logger.info("Using template fallback for lesson plan on topic '%s'", topic)
        structured = {
            "title": f"Lesson Plan — {topic}",
            "learning_objectives": [
                f"Understand the foundational principles of {topic}",
                f"Analyse real-world applications of {topic} in {course_name}",
                f"Design and evaluate solutions involving {topic}",
            ],
            "prerequisites": [f"Basic knowledge of {course_name} concepts"],
            "introduction": (
                f"This lesson introduces {topic} within the context of {course_name} ({course_code}). "
                f"Students will explore its theoretical basis, practical relevance, and implementation strategies."
            ),
            "content": (
                f"**1. Conceptual Foundation**\nExplore the definition and scope of {topic}.\n\n"
                f"**2. Key Principles**\nAnalyse the governing rules and properties.\n\n"
                f"**3. Worked Examples**\nStep-by-step problem-solving demonstrations.\n\n"
                f"**4. Applications**\nReal-world scenarios where {topic} is applied in industry."
            ),
            "activities": [
                f"Group discussion: Brainstorm real-world uses of {topic}",
                f"Worksheet: Solve 3 practice problems on {topic}",
                f"Peer review: Exchange solutions and critique each other's approach",
            ],
            "assessment_questions": [
                f"Define {topic} and state its importance in {course_name}.",
                f"Explain the key algorithmic steps involved in {topic}.",
                f"Give two real-world examples where {topic} is applied.",
            ],
            "summary": (
                f"Today we covered the definition, principles, and practical applications of {topic}. "
                f"Students should now be able to apply this knowledge to standard {course_name} problems."
            ),
            "homework": f"Complete 5 textbook exercises on {topic} and submit before the next class.",
        }

    full_md = (
        f"# {structured['title']}\n\n"
        f"**Course:** {course_name} ({course_code}) | **Duration:** {duration} min\n\n"
        f"## Learning Objectives\n"
        + "\n".join(f"- {o}" for o in structured.get("learning_objectives", []))
        + f"\n\n## Introduction\n{structured.get('introduction', '')}\n\n"
        f"## Content\n{structured.get('content', '')}\n\n"
        f"## Activities\n"
        + "\n".join(f"- {a}" for a in structured.get("activities", []))
        + f"\n\n## Summary\n{structured.get('summary', '')}\n\n"
        f"## Homework\n{structured.get('homework', '')}\n"
    )

    doc = new_lesson_plan(
        teacher_course_assignment_id=body.class_id,
        teacher_id=teacher["id"],
        title=structured["title"],
        topic=topic,
        unit=body.unit,
        duration_minutes=duration,
        prerequisites=structured.get("prerequisites"),
        learning_objectives=structured.get("learning_objectives"),
        introduction=structured.get("introduction"),
        content=structured.get("content"),
        activities=structured.get("activities"),
        assessment_questions=structured.get("assessment_questions"),
        summary=structured.get("summary"),
        homework=structured.get("homework"),
        full_content=full_md,
        is_ai_generated=True,
        status="published",
    )
    db[LESSON_PLANS].insert_one(doc)
    logger.info("AI lesson plan saved: %s for topic '%s'", doc["id"], topic)
    return _serialize(doc)
