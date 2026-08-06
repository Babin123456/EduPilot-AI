"""Notifications routes."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.models.teacher import Teacher
from app.models.notification import Notification

router = APIRouter()


@router.get("")
def list_notifications(
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """List notifications."""
    notifs = (
        db.query(Notification)
        .filter(Notification.teacher_id == teacher.id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.notification_type,
            "is_read": n.is_read,
            "link": n.link,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifs
    ]


@router.put("/{notification_id}/read")
def mark_read(
    notification_id: str,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Mark a notification as read."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.teacher_id == teacher.id,
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Marked as read"}
