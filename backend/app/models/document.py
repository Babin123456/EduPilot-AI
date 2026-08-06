"""Document and DocumentVersion models."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class Document(Base):
    """Generated document record — lesson plan, quiz, report, PPTX, etc."""
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    teacher_id: Mapped[str] = mapped_column(String(36), ForeignKey("teachers.id"), nullable=False)
    teacher_course_assignment_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("teacher_course_assignments.id"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    document_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: lesson_plan, quiz, assignment, assessment, answer_key, presentation,
    #        attendance_report, student_report, class_report, analytics_report, other
    format: Mapped[str] = mapped_column(String(10), default="pdf")  # pdf, pptx, docx, xlsx, csv, md
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    content_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # Source content
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source_id: Mapped[str | None] = mapped_column(String(36), nullable=True)  # FK to lesson/quiz/etc
    source_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    generation_status: Mapped[str] = mapped_column(String(20), default="completed")  # pending, processing, completed, failed
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class DocumentVersion(Base):
    """Version history for documents."""
    __tablename__ = "document_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id"), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    content_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    change_note: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
