"""Timetable entry model."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone, time

from sqlalchemy import String, Time, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    teacher_course_assignment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("teacher_course_assignments.id"), nullable=False
    )
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)  # 0=Mon, 1=Tue, ..., 6=Sun
    start_time: Mapped[str] = mapped_column(String(5), nullable=False)  # "09:00"
    end_time: Mapped[str] = mapped_column(String(5), nullable=False)    # "10:00"
    room: Mapped[str | None] = mapped_column(String(50), nullable=True)
    slot_type: Mapped[str] = mapped_column(String(20), default="lecture")  # lecture, lab, tutorial
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)
