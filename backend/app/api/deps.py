"""Authentication dependencies — extract and validate current teacher from JWT."""

from __future__ import annotations

from fastapi import Depends, Header
from pymongo.database import Database

from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import http_401
from app.models.teacher import teacher_full_name


def get_current_teacher(
    authorization: str = Header(None),
    db: Database = Depends(get_db),
) -> dict:
    """Extract teacher from Bearer token. Raises 401 if invalid."""
    if not authorization or not authorization.startswith("Bearer "):
        raise http_401("Missing or invalid authorization header")

    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise http_401("Invalid or expired access token")

    teacher_id = payload.get("sub")
    if not teacher_id:
        raise http_401("Invalid token payload")

    teacher = db.teachers.find_one({"id": teacher_id, "is_active": True})
    if not teacher:
        raise http_401("Teacher not found or inactive")

    # Attach computed property
    teacher["full_name"] = teacher_full_name(teacher)
    return teacher
