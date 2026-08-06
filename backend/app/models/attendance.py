"""Attendance models: session and individual records."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone, date

from sqlalchemy import String, Integer, Float, DateTime, Date, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class AttendanceSession(Base):
    """One attendance-taking event for a specific class on a date."""
    __tablename__ = "attendance_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    teacher_course_assignment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("teacher_course_assignments.id"), nullable=False
    )
    teacher_id: Mapped[str] = mapped_column(String(36), ForeignKey("teachers.id"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[str | None] = mapped_column(String(5), nullable=True)
    end_time: Mapped[str | None] = mapped_column(String(5), nullable=True)
    total_present: Mapped[int] = mapped_column(Integer, default=0)
    total_absent: Mapped[int] = mapped_column(Integer, default=0)
    total_late: Mapped[int] = mapped_column(Integer, default=0)
    total_excused: Mapped[int] = mapped_column(Integer, default=0)
    is_submitted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class AttendanceRecord(Base):
    """Individual student attendance in a session."""
    __tablename__ = "attendance_records"
    __table_args__ = (
        UniqueConstraint("session_id", "student_id", name="uq_session_student"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("attendance_sessions.id"), nullable=False)
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("students.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(10), nullable=False)  # present, absent, late, excused
    remarks: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
