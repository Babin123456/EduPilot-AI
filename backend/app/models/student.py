"""Student model with all required fields."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class Student(Base):
    __tablename__ = "students"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    university_id: Mapped[str] = mapped_column(String(36), ForeignKey("universities.id"), nullable=False)
    student_uid: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)  # University student ID
    registration_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    roll_number: Mapped[str] = mapped_column(String(30), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    
    # Academic placement
    program_id: Mapped[str] = mapped_column(String(36), ForeignKey("programs.id"), nullable=False)
    year_id: Mapped[str] = mapped_column(String(36), ForeignKey("years.id"), nullable=False)
    semester_id: Mapped[str] = mapped_column(String(36), ForeignKey("semesters.id"), nullable=False)
    section_id: Mapped[str] = mapped_column(String(36), ForeignKey("sections.id"), nullable=False)
    academic_session_id: Mapped[str] = mapped_column(String(36), ForeignKey("academic_sessions.id"), nullable=False)
    
    # Profile
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    date_of_birth: Mapped[str | None] = mapped_column(String(10), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    guardian_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    guardian_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    
    # Computed metrics (periodically refreshed)
    attendance_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    assignments_completed: Mapped[int] = mapped_column(Integer, default=0)
    assignments_total: Mapped[int] = mapped_column(Integer, default=0)
    average_score: Mapped[float] = mapped_column(Float, default=0.0)
    cgpa: Mapped[float | None] = mapped_column(Float, nullable=True)
    risk_level: Mapped[str] = mapped_column(String(20), default="normal")  # normal, low, medium, high
    risk_reasons: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array of reasons
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
