"""Notifications routes."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from pymongo.database import Database

from app.core.database import get_db
from app.api.deps import get_current_teacher

router = APIRouter()


@router.get("")
def list_notifications(
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """List notifications."""
    notifs = list(
        db.notifications.find({"teacher_id": teacher["id"]})
        .sort("created_at", -1)
        .limit(30)
    )
    return [
        {
            "id": n["id"],
            "title": n["title"],
            "message": n["message"],
            "type": n.get("notification_type", "info"),
            "is_read": n.get("is_read", False),
            "link": n.get("link"),
            "created_at": n["created_at"].isoformat() if hasattr(n.get("created_at"), 'isoformat') else n.get("created_at"),
        }
        for n in notifs
    ]


@router.put("/{notification_id}/read")
def mark_read(
    notification_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Mark a notification as read."""
    db.notifications.update_one(
        {"id": notification_id, "teacher_id": teacher["id"]},
        {"$set": {"is_read": True}},
    )
    return {"message": "Marked as read"}
