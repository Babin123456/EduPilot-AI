"""Test fixtures and shared configuration for EduPilot-AI backend tests.

Uses mongomock to provide an in-memory MongoDB replacement, so no real
MongoDB instance is needed during CI/CD runs.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Generator

import pytest
from fastapi.testclient import TestClient

# ── Patch pymongo with mongomock before importing the app ────────────────────
import mongomock
import pymongo

# Replace MongoClient globally so the app module picks up the mock
_original_mongo_client = pymongo.MongoClient
pymongo.MongoClient = mongomock.MongoClient  # type: ignore[assignment]

from app.main import app  # noqa: E402 — must import AFTER patch
from app.core.database import get_db  # noqa: E402

# ── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def mock_db():
    """Return an in-memory mongomock database instance."""
    client = mongomock.MongoClient()
    db = client["edupilot_test"]
    _seed_test_db(db)
    return db


@pytest.fixture(scope="session")
def client(mock_db) -> Generator:
    """Return a FastAPI TestClient that uses the mock database."""
    app.dependency_overrides[get_db] = lambda: mock_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="session")
def auth_headers(client) -> dict:
    """Return Authorization headers using the demo teacher account."""
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": "teacher@edupilot.ai", "password": "teacher123"},
    )
    if resp.status_code == 200:
        token = resp.json().get("access_token", "")
        return {"Authorization": f"Bearer {token}"}
    # Fallback: try demo endpoint
    resp2 = client.get("/api/v1/auth/demo-token")
    token = resp2.json().get("access_token", "") if resp2.status_code == 200 else ""
    return {"Authorization": f"Bearer {token}"}


# ── Seed helper ───────────────────────────────────────────────────────────────

def _uid() -> str:
    return str(uuid.uuid4())


def _utcnow():
    return datetime.now(timezone.utc)


def _seed_test_db(db) -> None:
    """Populate the in-memory DB with minimal fixtures needed by tests."""
    teacher_id = "teacher-test-001"
    section_id = "section-test-001"
    course_id  = "course-test-001"
    tca_id     = "tca-test-001"
    student_id = "student-test-001"

    # Teacher
    if not db.teachers.find_one({"id": teacher_id}):
        db.teachers.insert_one({
            "id": teacher_id,
            "email": "teacher@edupilot.ai",
            "password_hash": "$2b$12$KIXbDZEw1JVnUYPgAiJQvuFI7.W/fmDjH8QrkOksmT89/9Lx9Vxh2",  # teacher123
            "first_name": "Test",
            "last_name": "Teacher",
            "designation": "Assistant Professor",
            "is_active": True,
            "created_at": _utcnow(),
        })

    # Section
    if not db.sections.find_one({"id": section_id}):
        db.sections.insert_one({
            "id": section_id,
            "name": "CSE-A",
            "year": 2,
            "department": "CSE",
        })

    # Course
    if not db.courses.find_one({"id": course_id}):
        db.courses.insert_one({
            "id": course_id,
            "name": "Data Structures",
            "code": "CS201",
            "department": "CSE",
        })

    # Teacher-Course Assignment
    if not db.teacher_course_assignments.find_one({"id": tca_id}):
        db.teacher_course_assignments.insert_one({
            "id": tca_id,
            "teacher_id": teacher_id,
            "course_id": course_id,
            "section_id": section_id,
            "semester": "ODD 2025-26",
        })

    # 3 students
    for i in range(1, 4):
        sid = f"student-test-{i:03d}"
        if not db.students.find_one({"id": sid}):
            db.students.insert_one({
                "id": sid,
                "roll_number": f"CSE2024{i:03d}",
                "first_name": f"Student{i}",
                "last_name": "Test",
                "email": f"student{i}@edupilot.ai",
                "section_id": section_id,
                "year": 2,
                "department": "CSE",
                "is_active": True,
                "created_at": _utcnow(),
            })
