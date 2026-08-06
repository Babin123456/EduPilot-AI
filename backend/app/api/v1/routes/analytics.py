"""Analytics routes — class and student analytics."""

from __future__ import annotations
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.core.exceptions import http_403
from app.models.teacher import Teacher
from app.models.student import Student
from app.models.enrollment import TeacherCourseAssignment
from app.models.attendance import AttendanceSession, AttendanceRecord
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.assessment import Assessment, AssessmentResult

router = APIRouter()


@router.get("/classes/{class_id}/overview")
def get_class_analytics(
    class_id: str,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Get comprehensive analytics for a class."""
    tca = db.query(TeacherCourseAssignment).filter(
        TeacherCourseAssignment.id == class_id,
        TeacherCourseAssignment.teacher_id == teacher.id,
    ).first()
    if not tca:
        raise http_403("Not authorized")

    students = (
        db.query(Student)
        .filter(Student.section_id == tca.section_id, Student.is_active == True)
        .all()
    )

    # ── Attendance trend (last 10 sessions) ──
    sessions = (
        db.query(AttendanceSession)
        .filter(
            AttendanceSession.teacher_course_assignment_id == class_id,
            AttendanceSession.is_submitted == True,
        )
        .order_by(AttendanceSession.date.desc())
        .limit(10)
        .all()
    )
    sessions.reverse()

    attendance_trend = []
    for s in sessions:
        total = s.total_present + s.total_absent + s.total_late + s.total_excused
        pct = round((s.total_present + s.total_late) / total * 100, 1) if total > 0 else 0
        attendance_trend.append({
            "date": s.date.isoformat(),
            "present": s.total_present,
            "absent": s.total_absent,
            "late": s.total_late,
            "percentage": pct,
        })

    # ── Assignment completion ──
    assignments = (
        db.query(Assignment)
        .filter(Assignment.teacher_course_assignment_id == class_id)
        .all()
    )

    assignment_stats = []
    for a in assignments:
        submitted = (
            db.query(func.count(AssignmentSubmission.id))
            .filter(AssignmentSubmission.assignment_id == a.id, AssignmentSubmission.status != "pending")
            .scalar()
        )
        graded = (
            db.query(func.count(AssignmentSubmission.id))
            .filter(AssignmentSubmission.assignment_id == a.id, AssignmentSubmission.is_graded == True)
            .scalar()
        )
        assignment_stats.append({
            "id": a.id,
            "title": a.title,
            "total_students": len(students),
            "submitted": submitted,
            "graded": graded,
            "completion_rate": round(submitted / len(students) * 100, 1) if students else 0,
        })

    # ── Score distribution ──
    results = (
        db.query(AssessmentResult.percentage)
        .join(Assessment, AssessmentResult.assessment_id == Assessment.id)
        .filter(Assessment.teacher_course_assignment_id == class_id)
        .all()
    )
    score_distribution = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
    for (pct,) in results:
        if pct >= 90:
            score_distribution["A"] += 1
        elif pct >= 75:
            score_distribution["B"] += 1
        elif pct >= 60:
            score_distribution["C"] += 1
        elif pct >= 40:
            score_distribution["D"] += 1
        else:
            score_distribution["F"] += 1

    # ── Risk distribution ──
    risk_dist = {"normal": 0, "low": 0, "medium": 0, "high": 0}
    for s in students:
        risk_dist[s.risk_level] = risk_dist.get(s.risk_level, 0) + 1

    # ── At-risk students ──
    at_risk = [
        {
            "id": s.id,
            "name": s.full_name,
            "roll_number": s.roll_number,
            "attendance_percentage": s.attendance_percentage,
            "average_score": s.average_score,
            "risk_level": s.risk_level,
            "risk_reasons": s.risk_reasons,
        }
        for s in students if s.risk_level in ("medium", "high")
    ]

    return {
        "class_id": class_id,
        "total_students": len(students),
        "attendance_trend": attendance_trend,
        "assignment_stats": assignment_stats,
        "score_distribution": score_distribution,
        "risk_distribution": risk_dist,
        "at_risk_students": at_risk,
        "average_attendance": round(sum(s.attendance_percentage for s in students) / len(students), 1) if students else 0,
        "average_score": round(sum(s.average_score for s in students) / len(students), 1) if students else 0,
    }
