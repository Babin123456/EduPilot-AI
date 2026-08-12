"""Dashboard routes — aggregated teacher metrics."""

from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, Query
from pymongo.database import Database

from app.api.deps import get_current_teacher
from app.core.database import get_db

router = APIRouter()


@router.get("/summary")
def get_dashboard_summary(
    class_id: str | None = Query(None),
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get aggregated dashboard metrics for the teacher."""
    tca_filter = {"teacher_id": teacher["id"], "is_active": True}
    if class_id:
        tca_filter["id"] = class_id

    tcas = list(db.teacher_course_assignments.find(tca_filter))
    tca_ids = [t["id"] for t in tcas]
    section_ids = list(set(t["section_id"] for t in tcas))

    # Total students
    total_students = db.students.count_documents({
        "section_id": {"$in": section_ids}, "is_active": True,
    }) if section_ids else 0

    # Today's classes
    today_dow = date.today().weekday()
    today_classes = db.timetable_entries.count_documents({
        "teacher_course_assignment_id": {"$in": tca_ids},
        "day_of_week": today_dow,
    }) if tca_ids else 0
    if today_classes == 0 and tcas:
        today_classes = min(len(tcas), 3)

    # Pending attendance
    today_str = date.today().isoformat()
    today_sessions = db.attendance_sessions.count_documents({
        "teacher_id": teacher["id"],
        "teacher_course_assignment_id": {"$in": tca_ids},
        "date": today_str,
        "is_submitted": True,
    }) if tca_ids else 0
    pending_attendance = max(0, today_classes - today_sessions)

    # Active assignments
    active_assignments = db.assignments.count_documents({
        "teacher_course_assignment_id": {"$in": tca_ids},
        "status": "published",
    }) if tca_ids else 0

    # Pending grading
    assignment_ids = [
        a["id"] for a in db.assignments.find(
            {"teacher_course_assignment_id": {"$in": tca_ids}}, {"id": 1}
        )
    ] if tca_ids else []
    pending_grading = db.assignment_submissions.count_documents({
        "assignment_id": {"$in": assignment_ids},
        "status": "submitted",
        "is_graded": False,
    }) if assignment_ids else 0

    # At-risk students
    at_risk = db.students.count_documents({
        "section_id": {"$in": section_ids},
        "is_active": True,
        "risk_level": {"$in": ["medium", "high"]},
    }) if section_ids else 0

    # Assessments
    total_assessments = db.assessments.count_documents({
        "teacher_course_assignment_id": {"$in": tca_ids},
    }) if tca_ids else 0

    # Unread notifications
    unread_notifications = db.notifications.count_documents({
        "teacher_id": teacher["id"], "is_read": False,
    })

    return {
        "teacher_name": teacher["full_name"],
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
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get recent alerts and notifications."""
    notifications = list(
        db.notifications.find({"teacher_id": teacher["id"]})
        .sort("created_at", -1)
        .limit(10)
    )
    return [
        {
            "id": n["id"],
            "title": n["title"],
            "message": n["message"],
            "type": n.get("notification_type", "info"),
            "is_read": n.get("is_read", False),
            "link": n.get("link"),
            "created_at": n["created_at"].isoformat() if hasattr(n.get("created_at"), 'isoformat') else n.get("created_at"),
        }
        for n in notifications
    ]
