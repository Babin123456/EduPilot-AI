"""Teachers routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_current_teacher

router = APIRouter()


@router.get("/me")
def get_current(teacher: dict = Depends(get_current_teacher)):
    """Get current teacher info (alias for /auth/me)."""
    return {
        "id": teacher["id"],
        "faculty_id": teacher["faculty_id"],
        "first_name": teacher["first_name"],
        "last_name": teacher["last_name"],
        "full_name": teacher["full_name"],
        "email": teacher["email"],
        "designation": teacher["designation"],
        "specialization": teacher.get("specialization"),
    }
