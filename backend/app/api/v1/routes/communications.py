"""Communications routes."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.models.teacher import Teacher
from app.models.communication import Communication

router = APIRouter()


@router.get("")
def list_communications(
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """List communications sent by the teacher."""
    comms = (
        db.query(Communication)
        .filter(Communication.teacher_id == teacher.id)
        .order_by(Communication.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": c.id,
            "type": c.comm_type,
            "template_type": c.template_type,
            "subject": c.subject,
            "total_recipients": c.total_recipients,
            "sent_count": c.sent_count,
            "status": c.status,
            "sent_at": c.sent_at.isoformat() if c.sent_at else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in comms
    ]
