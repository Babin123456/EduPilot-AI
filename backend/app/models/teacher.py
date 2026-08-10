"""Teacher document helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


TEACHERS = "teachers"


def new_teacher(*, faculty_id, department_id, first_name, last_name, email,
                hashed_password, phone=None, designation="Assistant Professor",
                specialization=None, bio=None, avatar_url=None,
                is_active=True, is_demo=True, id=None):
    return {
        "id": id or _uid(),
        "faculty_id": faculty_id,
        "department_id": department_id,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "hashed_password": hashed_password,
        "phone": phone,
        "designation": designation,
        "specialization": specialization,
        "bio": bio,
        "avatar_url": avatar_url,
        "is_active": is_active,
        "is_demo": is_demo,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def teacher_full_name(doc: dict) -> str:
    """Compute full_name from a teacher document."""
    return f"{doc['first_name']} {doc['last_name']}"
