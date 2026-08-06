"""Dashboard routes — aggregated teacher metrics."""

from __future__ import annotations
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.models.teacher import Teacher
from app.models.enrollment import TeacherCourseAssignment
from app.models.student import Student
from app.models.enrollment import Enrollment
from app.models.attendance import AttendanceSession
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.assessment import Assessment
from app.models.notification import Notification
from app.models.timetable import TimetableEntry
from app.models.academic import Course, Section, Year

router = APIRouter()


@router.get("/summary")
def get_dashboard_summary(
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Get aggregated dashboard metrics for the teacher."""
    # Get teacher's active class assignments
    tcas = (
        db.query(TeacherCourseAssignment)
        .filter(TeacherCourseAssignment.teacher_id == teacher.id, TeacherCourseAssignment.is_active == True)
        .all()
    )
    tca_ids = [t.id for t in tcas]
    section_ids = list(set(t.section_id for t in tcas))

    # Total students across all sections
    total_students = (
        db.query(func.count(func.distinct(Student.id)))
        .filter(Student.section_id.in_(section_ids), Student.is_active == True)
        .scalar()
    ) if section_ids else 0

    # Today's classes
    today_dow = date.today().weekday()
    today_classes = (
        db.query(TimetableEntry)
        .filter(
            TimetableEntry.teacher_course_assignment_id.in_(tca_ids),
            TimetableEntry.day_of_week == today_dow,
        )
        .count()
    ) if tca_ids else 0

    # Pending attendance (today's classes not yet marked)
    today_sessions = (
        db.query(AttendanceSession)
        .filter(
            AttendanceSession.teacher_id == teacher.id,
            AttendanceSession.date == date.today(),
            AttendanceSession.is_submitted == True,
        )
        .count()
    )
    pending_attendance = max(0, today_classes - today_sessions)

    # Active assignments
    active_assignments = (
        db.query(func.count(Assignment.id))
        .filter(
            Assignment.teacher_course_assignment_id.in_(tca_ids),
            Assignment.status == "published",
        )
        .scalar()
    ) if tca_ids else 0

    # Pending grading
    pending_grading = (
        db.query(func.count(AssignmentSubmission.id))
        .join(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
        .filter(
            Assignment.teacher_course_assignment_id.in_(tca_ids),
            AssignmentSubmission.status == "submitted",
            AssignmentSubmission.is_graded == False,
        )
        .scalar()
    ) if tca_ids else 0

    # At-risk students
    at_risk = (
        db.query(func.count(Student.id))
        .filter(
            Student.section_id.in_(section_ids),
            Student.is_active == True,
            Student.risk_level.in_(["medium", "high"]),
        )
        .scalar()
    ) if section_ids else 0

    # Assessments
    total_assessments = (
        db.query(func.count(Assessment.id))
        .filter(Assessment.teacher_course_assignment_id.in_(tca_ids))
        .scalar()
    ) if tca_ids else 0

    # Unread notifications
    unread_notifications = (
        db.query(func.count(Notification.id))
        .filter(Notification.teacher_id == teacher.id, Notification.is_read == False)
        .scalar()
    )

    return {
        "teacher_name": teacher.full_name,
        "today_date": date.today().isoformat(),
        "total_classes": len(tca_ids),
        "today_classes": today_classes,
        "total_students": total_students,
        "pending_attendance": pending_attendance,
        "active_assignments": active_assignments,
        "pending_grading": pending_grading,
        "at_risk_students": at_risk,
        "total_assessments": total_assessments,
        "unread_notifications": unread_notifications,
    }


@router.get("/alerts")
def get_dashboard_alerts(
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Get recent alerts and notifications."""
    notifications = (
        db.query(Notification)
        .filter(Notification.teacher_id == teacher.id)
        .order_by(Notification.created_at.desc())
        .limit(10)
        .all()
    )
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.notification_type,
            "is_read": n.is_read,
            "link": n.link,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifications
    ]
