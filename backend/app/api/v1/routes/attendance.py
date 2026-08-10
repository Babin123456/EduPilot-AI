"""Attendance routes — sessions, records, summary."""

from __future__ import annotations

import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from pymongo.database import Database

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.core.exceptions import http_404, http_403
from app.models.student import student_full_name
from app.models.attendance import new_attendance_session, new_attendance_record

router = APIRouter()


class AttendanceRecordInput(BaseModel):
    student_id: str
    status: str  # present, absent, late, excused


class CreateSessionRequest(BaseModel):
    class_id: str
    date: str  # ISO date
    records: list[AttendanceRecordInput]


class UpdateRecordsRequest(BaseModel):
    records: list[AttendanceRecordInput]


@router.get("/sessions")
def list_sessions(
    class_id: str = Query(...),
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """List attendance sessions for a class."""
    tca = db.teacher_course_assignments.find_one({
        "id": class_id, "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized")

    sessions = list(
        db.attendance_sessions.find({"teacher_course_assignment_id": class_id})
        .sort("date", -1)
        .limit(30)
    )

    return [
        {
            "id": s["id"],
            "date": s["date"] if isinstance(s["date"], str) else s["date"].isoformat(),
            "total_present": s.get("total_present", 0),
            "total_absent": s.get("total_absent", 0),
            "total_late": s.get("total_late", 0),
            "total_excused": s.get("total_excused", 0),
            "is_submitted": s.get("is_submitted", False),
            "created_at": s["created_at"].isoformat() if hasattr(s.get("created_at"), 'isoformat') else s.get("created_at"),
        }
        for s in sessions
    ]


@router.post("/sessions")
def create_session(
    body: CreateSessionRequest,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Create a new attendance session with records."""
    tca = db.teacher_course_assignments.find_one({
        "id": body.class_id, "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized")

    att_date = body.date  # store as string

    # Check for existing session
    existing = db.attendance_sessions.find_one({
        "teacher_course_assignment_id": body.class_id,
        "date": att_date,
    })

    if existing:
        session_id = existing["id"]
        # Delete old records
        db.attendance_records.delete_many({"session_id": session_id})
    else:
        session_id = str(uuid.uuid4())
        session_doc = new_attendance_session(
            id=session_id,
            teacher_course_assignment_id=body.class_id,
            teacher_id=teacher["id"],
            date=att_date,
        )
        db.attendance_sessions.insert_one(session_doc)

    present = absent = late = excused = 0
    records_to_insert = []
    for rec in body.records:
        record = new_attendance_record(
            session_id=session_id,
            student_id=rec.student_id,
            status=rec.status,
        )
        records_to_insert.append(record)
        if rec.status == "present":
            present += 1
        elif rec.status == "absent":
            absent += 1
        elif rec.status == "late":
            late += 1
        elif rec.status == "excused":
            excused += 1

    if records_to_insert:
        db.attendance_records.insert_many(records_to_insert)

    db.attendance_sessions.update_one(
        {"id": session_id},
        {"$set": {
            "total_present": present,
            "total_absent": absent,
            "total_late": late,
            "total_excused": excused,
            "is_submitted": True,
        }},
    )

    return {
        "id": session_id,
        "message": "Attendance saved successfully",
        "total_present": present,
        "total_absent": absent,
        "total_late": late,
    }


@router.get("/classes/{class_id}/summary")
def get_class_attendance_summary(
    class_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get attendance summary for a class."""
    tca = db.teacher_course_assignments.find_one({
        "id": class_id, "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized")

    students = list(
        db.students.find({"section_id": tca["section_id"], "is_active": True})
        .sort("roll_number", 1)
    )

    total_sessions = db.attendance_sessions.count_documents({
        "teacher_course_assignment_id": class_id,
        "is_submitted": True,
    })

    # Get all session IDs for this class
    session_ids = [
        s["id"] for s in db.attendance_sessions.find(
            {"teacher_course_assignment_id": class_id, "is_submitted": True},
            {"id": 1},
        )
    ]

    student_summaries = []
    below_threshold = 0
    for student in students:
        present_count = db.attendance_records.count_documents({
            "session_id": {"$in": session_ids},
            "student_id": student["id"],
            "status": {"$in": ["present", "late"]},
        }) if session_ids else 0

        pct = round((present_count / total_sessions * 100), 1) if total_sessions > 0 else 0
        if pct < 75:
            below_threshold += 1

        student_summaries.append({
            "student_id": student["id"],
            "roll_number": student["roll_number"],
            "name": student_full_name(student),
            "present_count": present_count,
            "total_sessions": total_sessions,
            "percentage": pct,
            "risk": pct < 75,
        })

    return {
        "class_id": class_id,
        "total_sessions": total_sessions,
        "total_students": len(students),
        "below_threshold": below_threshold,
        "threshold": 75,
        "students": student_summaries,
    }


@router.get("/students/{class_id}")
def get_students_for_attendance(
    class_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get students list for taking attendance in a class."""
    tca = db.teacher_course_assignments.find_one({
        "id": class_id, "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized")

    students = list(
        db.students.find({"section_id": tca["section_id"], "is_active": True})
        .sort("roll_number", 1)
    )

    # Get today's existing records if any
    today_str = date.today().isoformat()
    today_session = db.attendance_sessions.find_one({
        "teacher_course_assignment_id": class_id,
        "date": today_str,
    })

    today_records = {}
    if today_session:
        records = list(db.attendance_records.find({"session_id": today_session["id"]}))
        today_records = {r["student_id"]: r["status"] for r in records}

    return [
        {
            "id": s["id"],
            "roll_number": s["roll_number"],
            "first_name": s["first_name"],
            "last_name": s["last_name"],
            "full_name": student_full_name(s),
            "email": s["email"],
            "attendance_percentage": s.get("attendance_percentage", 0),
            "risk_level": s.get("risk_level", "normal"),
            "avatar_url": s.get("avatar_url"),
            "today_status": today_records.get(s["id"]),
        }
        for s in students
    ]
