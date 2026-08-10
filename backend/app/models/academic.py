"""Academic structure document helpers: Session, Year, Semester, Section, Course."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


# ── Collection names ──
ACADEMIC_SESSIONS = "academic_sessions"
YEARS = "years"
SEMESTERS = "semesters"
SECTIONS = "sections"
COURSES = "courses"


def new_academic_session(*, name, start_date=None, end_date=None, is_current=True, id=None):
    return {
        "id": id or _uid(),
        "name": name,
        "start_date": start_date,
        "end_date": end_date,
        "is_current": is_current,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def new_year(*, program_id, year_number, label, id=None):
    return {
        "id": id or _uid(),
        "program_id": program_id,
        "year_number": year_number,
        "label": label,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def new_semester(*, year_id, semester_number, label, is_current=False, id=None):
    return {
        "id": id or _uid(),
        "year_id": year_id,
        "semester_number": semester_number,
        "label": label,
        "is_current": is_current,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def new_section(*, year_id, name, max_students=60, id=None):
    return {
        "id": id or _uid(),
        "year_id": year_id,
        "name": name,
        "max_students": max_students,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def new_course(*, department_id, semester_id, code, name, short_name=None,
               credits=3, course_type="theory", description=None, syllabus=None,
               total_units=5, id=None):
    return {
        "id": id or _uid(),
        "department_id": department_id,
        "semester_id": semester_id,
        "code": code,
        "name": name,
        "short_name": short_name,
        "credits": credits,
        "course_type": course_type,
        "description": description,
        "syllabus": syllabus,
        "total_units": total_units,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }
