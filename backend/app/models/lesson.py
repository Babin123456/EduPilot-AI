"""Lesson plan document helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


LESSON_PLANS = "lesson_plans"


def new_lesson_plan(*, teacher_course_assignment_id, teacher_id, title, topic,
                    unit=None, duration_minutes=60, prerequisites=None,
                    learning_objectives=None, introduction=None, content=None,
                    examples=None, activities=None, assessment_questions=None,
                    summary=None, homework=None, references=None, full_content=None,
                    is_ai_generated=False, status="draft", id=None):
    return {
        "id": id or _uid(),
        "teacher_course_assignment_id": teacher_course_assignment_id,
        "teacher_id": teacher_id,
        "title": title,
        "topic": topic,
        "unit": unit,
        "duration_minutes": duration_minutes,
        "prerequisites": prerequisites,
        "learning_objectives": learning_objectives,
        "introduction": introduction,
        "content": content,
        "examples": examples,
        "activities": activities,
        "assessment_questions": assessment_questions,
        "summary": summary,
        "homework": homework,
        "references": references,
        "full_content": full_content,
        "is_ai_generated": is_ai_generated,
        "status": status,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }
