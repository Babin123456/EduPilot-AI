"""Authentication dependencies — extract and validate current teacher from JWT."""

from __future__ import annotations

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import http_401
from app.models.teacher import Teacher


def get_current_teacher(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> Teacher:
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

    teacher = db.query(Teacher).filter(Teacher.id == teacher_id, Teacher.is_active == True).first()
    if not teacher:
        raise http_401("Teacher not found or inactive")

    return teacher
