"""Student document helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


STUDENTS = "students"


def new_student(*, university_id, student_uid, registration_number, roll_number,
                first_name, last_name, email, phone=None,
                program_id, year_id, semester_id, section_id, academic_session_id,
                avatar_url=None, date_of_birth=None, gender=None, address=None,
                guardian_name=None, guardian_phone=None,
                attendance_percentage=0.0, assignments_completed=0, assignments_total=0,
                average_score=0.0, cgpa=None, risk_level="normal", risk_reasons=None,
                is_active=True, id=None):
    return {
        "id": id or _uid(),
        "university_id": university_id,
        "student_uid": student_uid,
        "registration_number": registration_number,
        "roll_number": roll_number,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "phone": phone,
        "program_id": program_id,
        "year_id": year_id,
        "semester_id": semester_id,
        "section_id": section_id,
        "academic_session_id": academic_session_id,
        "avatar_url": avatar_url,
        "date_of_birth": date_of_birth,
        "gender": gender,
        "address": address,
        "guardian_name": guardian_name,
        "guardian_phone": guardian_phone,
        "attendance_percentage": attendance_percentage,
        "assignments_completed": assignments_completed,
        "assignments_total": assignments_total,
        "average_score": average_score,
        "cgpa": cgpa,
        "risk_level": risk_level,
        "risk_reasons": risk_reasons,
        "is_active": is_active,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def student_full_name(doc: dict) -> str:
    """Compute full_name from a student document."""
    return f"{doc['first_name']} {doc['last_name']}"
