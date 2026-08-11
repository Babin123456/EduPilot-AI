"""Analytics routes — class and student analytics."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pymongo.database import Database

from app.api.deps import get_current_teacher
from app.core.database import get_db
from app.core.exceptions import http_403
from app.models.student import student_full_name

router = APIRouter()


@router.get("/classes/{class_id}/overview")
def get_class_analytics(
    class_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get comprehensive analytics for a class."""
    tca = db.teacher_course_assignments.find_one({
        "id": class_id, "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized")

    students = list(
        db.students.find({"section_id": tca["section_id"], "is_active": True})
    )

    # ── Attendance trend (last 10 sessions) ──
    sessions = list(
        db.attendance_sessions.find({
            "teacher_course_assignment_id": class_id,
            "is_submitted": True,
        }).sort("date", -1).limit(10)
    )
    sessions.reverse()

    attendance_trend = []
    for s in sessions:
        total = s.get("total_present", 0) + s.get("total_absent", 0) + s.get("total_late", 0) + s.get("total_excused", 0)
        pct = round((s.get("total_present", 0) + s.get("total_late", 0)) / total * 100, 1) if total > 0 else 0
        d = s.get("date", "")
        attendance_trend.append({
            "date": d if isinstance(d, str) else d.isoformat() if hasattr(d, 'isoformat') else str(d),
            "present": s.get("total_present", 0),
            "absent": s.get("total_absent", 0),
            "late": s.get("total_late", 0),
            "percentage": pct,
        })

    # ── Assignment completion ──
    assignments = list(
        db.assignments.find({"teacher_course_assignment_id": class_id})
    )

    assignment_stats = []
    for a in assignments:
        submitted = db.assignment_submissions.count_documents({
            "assignment_id": a["id"], "status": {"$ne": "pending"},
        })
        graded = db.assignment_submissions.count_documents({
            "assignment_id": a["id"], "is_graded": True,
        })
        assignment_stats.append({
            "id": a["id"],
            "title": a["title"],
            "total_students": len(students),
            "submitted": submitted,
            "graded": graded,
            "completion_rate": round(submitted / len(students) * 100, 1) if students else 0,
        })

    # ── Score distribution ──
    assessment_ids = [
        a["id"] for a in db.assessments.find(
            {"teacher_course_assignment_id": class_id}, {"id": 1}
        )
    ]
    results = list(
        db.assessment_results.find(
            {"assessment_id": {"$in": assessment_ids}},
            {"percentage": 1},
        )
    ) if assessment_ids else []

    score_distribution = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
    for r in results:
        pct = r.get("percentage", 0)
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
        rl = s.get("risk_level", "normal")
        risk_dist[rl] = risk_dist.get(rl, 0) + 1

    # ── At-risk students ──
    at_risk = [
        {
            "id": s["id"],
            "name": student_full_name(s),
            "roll_number": s["roll_number"],
            "attendance_percentage": s.get("attendance_percentage", 0),
            "average_score": s.get("average_score", 0),
            "risk_level": s.get("risk_level", "normal"),
            "risk_reasons": s.get("risk_reasons"),
        }
        for s in students if s.get("risk_level") in ("medium", "high")
    ]

    attendance_total = sum(
        s.get("total_present", 0) + s.get("total_absent", 0) + s.get("total_late", 0) + s.get("total_excused", 0)
        for s in sessions
    )
    attendance_present = sum(s.get("total_present", 0) + s.get("total_late", 0) for s in sessions)
    average_attendance = round(attendance_present / attendance_total * 100, 1) if attendance_total else None
    average_score = round(sum(r.get("percentage", 0) for r in results) / len(results), 1) if results else None

    return {
        "class_id": class_id,
        "total_students": len(students),
        "attendance_trend": attendance_trend,
        "assignment_stats": assignment_stats,
        "score_distribution": score_distribution,
        "risk_distribution": risk_dist,
        "at_risk_students": at_risk,
        "average_attendance": average_attendance,
        "average_score": average_score,
        "has_performance_data": bool(sessions or results),
    }
