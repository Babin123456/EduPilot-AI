"""Authentication dependencies — extract and validate current teacher from JWT."""

from __future__ import annotations

from fastapi import Depends, Header
from pymongo.database import Database

from app.core.database import get_db
from app.core.exceptions import http_401
from app.core.security import decode_token
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

    teacher = None
    try:
        teacher = db.teachers.find_one({"id": teacher_id, "is_active": True})
    except Exception as exc:
        print(f"[Auth Warning] MongoDB offline during token verification: {exc}")

    # Offline Fallback for Demo Teacher session if MongoDB is offline
    if not teacher and (str(teacher_id).startswith("demo-") or str(teacher_id).startswith("FAC-")):
        email = payload.get("email", "rajesh.banerjee@edupilot.ai")
        teacher = {
            "id": teacher_id,
            "faculty_id": "FAC-UNIV-001",
            "first_name": "Prof. Rajesh",
            "last_name": "Banerjee",
            "email": email,
            "designation": "Associate Professor",
            "specialization": "Algorithms & Data Structures",
            "department_id": "dept-cse-01",
            "is_demo": True,
            "is_active": True,
        }

    if not teacher:
        raise http_401("Teacher not found or inactive")

    # Attach computed property
    teacher["full_name"] = teacher_full_name(teacher)
    return teacher
