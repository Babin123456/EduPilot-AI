"""Assignment and submission document helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


ASSIGNMENTS = "assignments"
ASSIGNMENT_SUBMISSIONS = "assignment_submissions"


def new_assignment(*, teacher_course_assignment_id, teacher_id, title,
                   description=None, instructions=None, topic=None,
                   difficulty="medium", total_marks=100, deadline=None,
                   learning_objectives=None, rubric=None, answer_key=None,
                   bloom_taxonomy=None, is_ai_generated=False, is_published=False,
                   attachment_url=None, status="draft", id=None):
    return {
        "id": id or _uid(),
        "teacher_course_assignment_id": teacher_course_assignment_id,
        "teacher_id": teacher_id,
        "title": title,
        "description": description,
        "instructions": instructions,
        "topic": topic,
        "difficulty": difficulty,
        "total_marks": total_marks,
        "deadline": deadline,
        "learning_objectives": learning_objectives,
        "rubric": rubric,
        "answer_key": answer_key,
        "bloom_taxonomy": bloom_taxonomy,
        "is_ai_generated": is_ai_generated,
        "is_published": is_published,
        "attachment_url": attachment_url,
        "status": status,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def new_assignment_submission(*, assignment_id, student_id, file_url=None,
                              content=None, submitted_at=None, is_late=False,
                              score=None, max_score=None, feedback=None,
                              ai_evaluation=None, ai_confidence=None,
                              is_graded=False, graded_by=None, graded_at=None,
                              status="pending", id=None):
    return {
        "id": id or _uid(),
        "assignment_id": assignment_id,
        "student_id": student_id,
        "file_url": file_url,
        "content": content,
        "submitted_at": submitted_at,
        "is_late": is_late,
        "score": score,
        "max_score": max_score,
        "feedback": feedback,
        "ai_evaluation": ai_evaluation,
        "ai_confidence": ai_confidence,
        "is_graded": is_graded,
        "graded_by": graded_by,
        "graded_at": graded_at,
        "status": status,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }
