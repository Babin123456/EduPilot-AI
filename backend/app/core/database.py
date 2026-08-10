"""EduPilot AI — MongoDB database connection and helpers."""

from __future__ import annotations

from pymongo import MongoClient
from pymongo.database import Database

from app.core.config import get_settings

settings = get_settings()

_client: MongoClient | None = None


def get_client() -> MongoClient:
    """Return (and lazily create) a singleton MongoClient."""
    global _client
    if _client is None:
        _client = MongoClient(settings.mongodb_uri)
    return _client


def get_db() -> Database:
    """FastAPI dependency — returns the PyMongo Database object."""
    return get_client()[settings.mongodb_db_name]


def ensure_indexes():
    """Create indexes for performance and uniqueness constraints."""
    db = get_db()

    # Teachers
    db.teachers.create_index("email", unique=True)
    db.teachers.create_index("faculty_id", unique=True)

    # Students
    db.students.create_index("email", unique=True)
    db.students.create_index("student_uid", unique=True)
    db.students.create_index("registration_number", unique=True)
    db.students.create_index("section_id")
    db.students.create_index("year_id")

    # Courses
    db.courses.create_index("code", unique=True)
    db.courses.create_index("semester_id")

    # Teacher Course Assignments
    db.teacher_course_assignments.create_index("teacher_id")
    db.teacher_course_assignments.create_index(
        [("teacher_id", 1), ("course_id", 1), ("section_id", 1)],
        unique=True,
    )

    # Enrollments
    db.enrollments.create_index(
        [("student_id", 1), ("course_id", 1)],
        unique=True,
    )

    # Timetable
    db.timetable_entries.create_index("teacher_course_assignment_id")

    # Attendance
    db.attendance_sessions.create_index("teacher_course_assignment_id")
    db.attendance_sessions.create_index("date")
    db.attendance_records.create_index("session_id")
    db.attendance_records.create_index(
        [("session_id", 1), ("student_id", 1)],
        unique=True,
    )

    # Assignments
    db.assignments.create_index("teacher_course_assignment_id")
    db.assignment_submissions.create_index("assignment_id")

    # Assessments
    db.assessments.create_index("teacher_course_assignment_id")
    db.assessment_results.create_index("assessment_id")

    # AI
    db.ai_conversations.create_index("teacher_id")
    db.ai_messages.create_index("conversation_id")

    # Documents
    db.documents.create_index("teacher_id")

    # Communications
    db.communications.create_index("teacher_id")

    # Notifications
    db.notifications.create_index("teacher_id")

    # Daily Notes
    db.daily_notes.create_index("teacher_id")
    db.daily_notes.create_index("teacher_course_assignment_id")
