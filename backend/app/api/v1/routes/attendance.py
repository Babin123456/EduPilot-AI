"""Attendance routes — sessions, records, summary."""

from __future__ import annotations

import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.core.exceptions import http_404, http_403
from app.models.teacher import Teacher
from app.models.enrollment import TeacherCourseAssignment
from app.models.student import Student
from app.models.academic import Year, Section
from app.models.attendance import AttendanceSession, AttendanceRecord

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
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """List attendance sessions for a class."""
    tca = db.query(TeacherCourseAssignment).filter(
        TeacherCourseAssignment.id == class_id,
        TeacherCourseAssignment.teacher_id == teacher.id,
    ).first()
    if not tca:
        raise http_403("Not authorized")

    sessions = (
        db.query(AttendanceSession)
        .filter(AttendanceSession.teacher_course_assignment_id == class_id)
        .order_by(AttendanceSession.date.desc())
        .limit(30)
        .all()
    )

    return [
        {
            "id": s.id,
            "date": s.date.isoformat(),
            "total_present": s.total_present,
            "total_absent": s.total_absent,
            "total_late": s.total_late,
            "total_excused": s.total_excused,
            "is_submitted": s.is_submitted,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in sessions
    ]


@router.post("/sessions")
def create_session(
    body: CreateSessionRequest,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Create a new attendance session with records."""
    tca = db.query(TeacherCourseAssignment).filter(
        TeacherCourseAssignment.id == body.class_id,
        TeacherCourseAssignment.teacher_id == teacher.id,
    ).first()
    if not tca:
        raise http_403("Not authorized")

    att_date = date.fromisoformat(body.date)

    # Check for existing session
    existing = db.query(AttendanceSession).filter(
        AttendanceSession.teacher_course_assignment_id == body.class_id,
        AttendanceSession.date == att_date,
    ).first()

    if existing:
        # Update existing session
        session_obj = existing
        # Delete old records
        db.query(AttendanceRecord).filter(AttendanceRecord.session_id == existing.id).delete()
    else:
        session_obj = AttendanceSession(
            id=str(uuid.uuid4()),
            teacher_course_assignment_id=body.class_id,
            teacher_id=teacher.id,
            date=att_date,
        )
        db.add(session_obj)
        db.flush()

    present = absent = late = excused = 0
    for rec in body.records:
        record = AttendanceRecord(
            id=str(uuid.uuid4()),
            session_id=session_obj.id,
            student_id=rec.student_id,
            status=rec.status,
        )
        db.add(record)
        if rec.status == "present":
            present += 1
        elif rec.status == "absent":
            absent += 1
        elif rec.status == "late":
            late += 1
        elif rec.status == "excused":
            excused += 1

    session_obj.total_present = present
    session_obj.total_absent = absent
    session_obj.total_late = late
    session_obj.total_excused = excused
    session_obj.is_submitted = True

    db.commit()

    return {
        "id": session_obj.id,
        "message": "Attendance saved successfully",
        "total_present": present,
        "total_absent": absent,
        "total_late": late,
    }


@router.get("/classes/{class_id}/summary")
def get_class_attendance_summary(
    class_id: str,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Get attendance summary for a class."""
    tca = db.query(TeacherCourseAssignment).filter(
        TeacherCourseAssignment.id == class_id,
        TeacherCourseAssignment.teacher_id == teacher.id,
    ).first()
    if not tca:
        raise http_403("Not authorized")

    # Get students in section
    students = (
        db.query(Student)
        .filter(Student.section_id == tca.section_id, Student.is_active == True)
        .order_by(Student.roll_number)
        .all()
    )

    # Total sessions
    total_sessions = (
        db.query(func.count(AttendanceSession.id))
        .filter(
            AttendanceSession.teacher_course_assignment_id == class_id,
            AttendanceSession.is_submitted == True,
        )
        .scalar()
    )

    student_summaries = []
    below_threshold = 0
    for student in students:
        present_count = (
            db.query(func.count(AttendanceRecord.id))
            .join(AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id)
            .filter(
                AttendanceSession.teacher_course_assignment_id == class_id,
                AttendanceRecord.student_id == student.id,
                AttendanceRecord.status.in_(["present", "late"]),
            )
            .scalar()
        )
        pct = round((present_count / total_sessions * 100), 1) if total_sessions > 0 else 0
        if pct < 75:
            below_threshold += 1

        student_summaries.append({
            "student_id": student.id,
            "roll_number": student.roll_number,
            "name": student.full_name,
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
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Get students list for taking attendance in a class."""
    tca = db.query(TeacherCourseAssignment).filter(
        TeacherCourseAssignment.id == class_id,
        TeacherCourseAssignment.teacher_id == teacher.id,
    ).first()
    if not tca:
        raise http_403("Not authorized")

    students = (
        db.query(Student)
        .filter(Student.section_id == tca.section_id, Student.is_active == True)
        .order_by(Student.roll_number)
        .all()
    )

    # Get today's existing records if any
    today_session = (
        db.query(AttendanceSession)
        .filter(
            AttendanceSession.teacher_course_assignment_id == class_id,
            AttendanceSession.date == date.today(),
        )
        .first()
    )

    today_records = {}
    if today_session:
        records = db.query(AttendanceRecord).filter(
            AttendanceRecord.session_id == today_session.id
        ).all()
        today_records = {r.student_id: r.status for r in records}

    return [
        {
            "id": s.id,
            "roll_number": s.roll_number,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "full_name": s.full_name,
            "email": s.email,
            "attendance_percentage": s.attendance_percentage,
            "risk_level": s.risk_level,
            "avatar_url": s.avatar_url,
            "today_status": today_records.get(s.id),
        }
        for s in students
    ]
