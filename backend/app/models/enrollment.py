"""Enrollment and TeacherCourseAssignment document helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


ENROLLMENTS = "enrollments"
TEACHER_COURSE_ASSIGNMENTS = "teacher_course_assignments"


def new_enrollment(*, student_id, course_id, section_id, academic_session_id,
                   status="active", id=None):
    return {
        "id": id or _uid(),
        "student_id": student_id,
        "course_id": course_id,
        "section_id": section_id,
        "academic_session_id": academic_session_id,
        "status": status,
        "created_at": _utcnow(),
    }


def new_teacher_course_assignment(*, teacher_id, course_id, section_id, year_id,
                                  semester_id, academic_session_id, room=None,
                                  is_active=True, id=None):
    return {
        "id": id or _uid(),
        "teacher_id": teacher_id,
        "course_id": course_id,
        "section_id": section_id,
        "year_id": year_id,
        "semester_id": semester_id,
        "academic_session_id": academic_session_id,
        "room": room,
        "is_active": is_active,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }
