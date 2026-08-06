"""Enrollment and TeacherCourseAssignment models."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class Enrollment(Base):
    """Links a student to a course within a section."""
    __tablename__ = "enrollments"
    __table_args__ = (
        UniqueConstraint("student_id", "course_id", name="uq_student_course"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("students.id"), nullable=False)
    course_id: Mapped[str] = mapped_column(String(36), ForeignKey("courses.id"), nullable=False)
    section_id: Mapped[str] = mapped_column(String(36), ForeignKey("sections.id"), nullable=False)
    academic_session_id: Mapped[str] = mapped_column(String(36), ForeignKey("academic_sessions.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active")  # active, dropped, completed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


class TeacherCourseAssignment(Base):
    """Links a teacher to a course + section — the 'class' concept."""
    __tablename__ = "teacher_course_assignments"
    __table_args__ = (
        UniqueConstraint("teacher_id", "course_id", "section_id", name="uq_teacher_course_section"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    teacher_id: Mapped[str] = mapped_column(String(36), ForeignKey("teachers.id"), nullable=False)
    course_id: Mapped[str] = mapped_column(String(36), ForeignKey("courses.id"), nullable=False)
    section_id: Mapped[str] = mapped_column(String(36), ForeignKey("sections.id"), nullable=False)
    year_id: Mapped[str] = mapped_column(String(36), ForeignKey("years.id"), nullable=False)
    semester_id: Mapped[str] = mapped_column(String(36), ForeignKey("semesters.id"), nullable=False)
    academic_session_id: Mapped[str] = mapped_column(String(36), ForeignKey("academic_sessions.id"), nullable=False)
    room: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)
