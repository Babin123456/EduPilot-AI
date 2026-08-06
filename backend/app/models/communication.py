"""Communication log model."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class Communication(Base):
    __tablename__ = "communications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    teacher_id: Mapped[str] = mapped_column(String(36), ForeignKey("teachers.id"), nullable=False)
    teacher_course_assignment_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("teacher_course_assignments.id"), nullable=True
    )
    comm_type: Mapped[str] = mapped_column(String(20), nullable=False)  # email, whatsapp
    template_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # Types: attendance_warning, assignment_reminder, assessment_announcement, report_distribution, general
    subject: Mapped[str | None] = mapped_column(String(500), nullable=True)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    recipients: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON list of {student_id, email, status}
    total_recipients: Mapped[int] = mapped_column(default=0)
    sent_count: Mapped[int] = mapped_column(default=0)
    failed_count: Mapped[int] = mapped_column(default=0)
    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft, sending, sent, partial, failed
    attachment_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    related_document_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)
