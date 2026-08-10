"""Daily topic discussion note document helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


DAILY_NOTES = "daily_notes"


def new_daily_note(*, teacher_course_assignment_id, teacher_id, date, topic,
                   content=None, key_concepts=None, discussion_points=None,
                   summary=None, practice_questions=None, references=None,
                   duration_minutes=60, is_ai_generated=True, is_shared=False,
                   shared_at=None, status="draft", id=None):
    return {
        "id": id or _uid(),
        "teacher_course_assignment_id": teacher_course_assignment_id,
        "teacher_id": teacher_id,
        "date": date,
        "topic": topic,
        "content": content,
        "key_concepts": key_concepts,
        "discussion_points": discussion_points,
        "summary": summary,
        "practice_questions": practice_questions,
        "references": references,
        "duration_minutes": duration_minutes,
        "is_ai_generated": is_ai_generated,
        "is_shared": is_shared,
        "shared_at": shared_at,
        "status": status,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }
