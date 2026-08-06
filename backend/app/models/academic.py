"""Academic structure models: Session, Year, Semester, Section, Course."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone, date

from sqlalchemy import String, Text, Integer, DateTime, Date, ForeignKey, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class AcademicSession(Base):
    __tablename__ = "academic_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "2025-2026"
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class Year(Base):
    __tablename__ = "years"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    program_id: Mapped[str] = mapped_column(String(36), ForeignKey("programs.id"), nullable=False)
    year_number: Mapped[int] = mapped_column(Integer, nullable=False)  # 1, 2, 3, 4
    label: Mapped[str] = mapped_column(String(50), nullable=False)  # "1st Year", "2nd Year", etc.
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)

    semesters: Mapped[list[Semester]] = relationship(back_populates="year", cascade="all, delete-orphan")
    sections: Mapped[list[Section]] = relationship(back_populates="year", cascade="all, delete-orphan")


class Semester(Base):
    __tablename__ = "semesters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    year_id: Mapped[str] = mapped_column(String(36), ForeignKey("years.id"), nullable=False)
    semester_number: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-8
    label: Mapped[str] = mapped_column(String(50), nullable=False)  # "Semester 1", etc.
    is_current: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)

    year: Mapped[Year] = relationship(back_populates="semesters")


class Section(Base):
    __tablename__ = "sections"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    year_id: Mapped[str] = mapped_column(String(36), ForeignKey("years.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(10), nullable=False)  # "A", "B", "C"
    max_students: Mapped[int] = mapped_column(Integer, default=60)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)

    year: Mapped[Year] = relationship(back_populates="sections")


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    department_id: Mapped[str] = mapped_column(String(36), ForeignKey("departments.id"), nullable=False)
    semester_id: Mapped[str] = mapped_column(String(36), ForeignKey("semesters.id"), nullable=False)
    code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    short_name: Mapped[str | None] = mapped_column(String(50), nullable=True)
    credits: Mapped[int] = mapped_column(Integer, default=3)
    course_type: Mapped[str] = mapped_column(String(30), default="theory")  # theory, lab, project
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    syllabus: Mapped[str | None] = mapped_column(Text, nullable=True)
    total_units: Mapped[int] = mapped_column(Integer, default=5)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)
