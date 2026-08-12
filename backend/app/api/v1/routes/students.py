"""Students routes — directory, profile, filtering."""

from __future__ import annotations

import re

from fastapi import APIRouter, Depends, Query
from pymongo.database import Database

from app.api.deps import get_current_teacher
from app.core.database import get_db
from app.core.exceptions import http_403, http_404
from app.models.student import student_full_name

router = APIRouter()


def _get_authorized_section_ids(db: Database, teacher: dict) -> list[str]:
    """Get section IDs the teacher is authorized to view."""
    tcas = db.teacher_course_assignments.find(
        {"teacher_id": teacher["id"], "is_active": True},
        {"section_id": 1},
    )
    return list(set(t["section_id"] for t in tcas))


@router.get("")
def list_students(
    class_id: str | None = Query(None),
    section_id: str | None = Query(None),
    year_id: str | None = Query(None),
    search: str | None = Query(None),
    risk: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=200),
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """List students with filtering, search, and pagination."""
    authorized_sections = _get_authorized_section_ids(db, teacher)
    if not authorized_sections:
        return {"students": [], "total": 0, "page": page, "limit": limit}

    query_filter: dict = {
        "is_active": True,
        "section_id": {"$in": authorized_sections},
    }

    if class_id:
        tca = db.teacher_course_assignments.find_one({
            "id": class_id, "teacher_id": teacher["id"],
        })
        if tca:
            query_filter["section_id"] = tca["section_id"]
        else:
            return {"students": [], "total": 0, "page": page, "limit": limit}

    if section_id:
        if section_id in authorized_sections:
            query_filter["section_id"] = section_id
        else:
            return {"students": [], "total": 0, "page": page, "limit": limit}

    if year_id:
        query_filter["year_id"] = year_id

    if risk:
        query_filter["risk_level"] = risk

    if search:
        escaped = re.escape(search)
        query_filter["$or"] = [
            {"first_name": {"$regex": escaped, "$options": "i"}},
            {"last_name": {"$regex": escaped, "$options": "i"}},
            {"roll_number": {"$regex": escaped, "$options": "i"}},
            {"registration_number": {"$regex": escaped, "$options": "i"}},
            {"email": {"$regex": escaped, "$options": "i"}},
        ]

    total = db.students.count_documents(query_filter)
    students = list(
        db.students.find(query_filter)
        .sort("roll_number", 1)
        .skip((page - 1) * limit)
        .limit(limit)
    )

    # Batch lookup years and sections to eliminate N+1 database queries
    year_ids = list(set(s["year_id"] for s in students if "year_id" in s))
    section_ids = list(set(s["section_id"] for s in students if "section_id" in s))
    years_map = {y["id"]: y for y in db.years.find({"id": {"$in": year_ids}})}
    sections_map = {sec["id"]: sec for sec in db.sections.find({"id": {"$in": section_ids}})}

    result = []
    for s in students:
        year = years_map.get(s.get("year_id"))
        section = sections_map.get(s.get("section_id"))
        result.append({
            "id": s["id"],
            "student_uid": s["student_uid"],
            "registration_number": s["registration_number"],
            "roll_number": s["roll_number"],
            "first_name": s["first_name"],
            "last_name": s["last_name"],
            "full_name": student_full_name(s),
            "email": s["email"],
            "phone": s.get("phone"),
            "year_label": year["label"] if year else "",
            "year_number": year["year_number"] if year else 0,
            "section_name": section["name"] if section else "",
            "attendance_percentage": s.get("attendance_percentage", 0),
            "average_score": s.get("average_score", 0),
            "cgpa": s.get("cgpa"),
            "risk_level": s.get("risk_level", "normal"),
            "avatar_url": s.get("avatar_url"),
        })

    return {"students": result, "total": total, "page": page, "limit": limit}


@router.get("/{student_id}")
def get_student_profile(
    student_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get full 360-degree student profile."""
    student = db.students.find_one({"id": student_id})
    if not student:
        raise http_404("Student not found")

    authorized_sections = _get_authorized_section_ids(db, teacher)
    if student["section_id"] not in authorized_sections:
        raise http_403("Not authorized to view this student")

    year = db.years.find_one({"id": student["year_id"]})
    section = db.sections.find_one({"id": student["section_id"]})
    semester = db.semesters.find_one({"id": student["semester_id"]})

    # Recent attendance
    att_records = list(
        db.attendance_records.find({"student_id": student_id})
    )
    session_ids = [r["session_id"] for r in att_records]
    att_sessions = {
        s["id"]: s for s in db.attendance_sessions.find({"id": {"$in": session_ids}})
    } if session_ids else {}

    recent_attendance = []
    for r in att_records:
        sess = att_sessions.get(r["session_id"])
        if sess:
            recent_attendance.append((r["status"], sess.get("date", "")))

    # Sort by date descending, take last 20
    recent_attendance.sort(key=lambda x: x[1], reverse=True)
    recent_attendance = recent_attendance[:20]

    # Assignment submissions
    submissions_raw = list(
        db.assignment_submissions.find({"student_id": student_id})
        .sort("submitted_at", -1)
        .limit(10)
    )
    submissions = []
    for s in submissions_raw:
        a = db.assignments.find_one({"id": s["assignment_id"]})
        if a:
            submitted_at = s.get("submitted_at")
            submissions.append({
                "assignment_title": a["title"],
                "score": s.get("score"),
                "max_score": s.get("max_score"),
                "status": s.get("status"),
                "is_late": s.get("is_late", False),
                "submitted_at": submitted_at.isoformat() if hasattr(submitted_at, 'isoformat') else submitted_at,
            })

    # Assessment results
    results_raw = list(
        db.assessment_results.find({"student_id": student_id})
        .sort("created_at", -1)
        .limit(10)
    )
    assessment_results = []
    for r in results_raw:
        a = db.assessments.find_one({"id": r["assessment_id"]})
        if a:
            assessment_results.append({
                "assessment_title": a["title"],
                "score": r.get("score"),
                "max_score": r.get("max_score"),
                "percentage": r.get("percentage"),
                "grade": r.get("grade"),
            })

    return {
        "id": student["id"],
        "student_uid": student["student_uid"],
        "registration_number": student["registration_number"],
        "roll_number": student["roll_number"],
        "first_name": student["first_name"],
        "last_name": student["last_name"],
        "full_name": student_full_name(student),
        "email": student["email"],
        "phone": student.get("phone"),
        "gender": student.get("gender"),
        "year_label": year["label"] if year else "",
        "year_number": year["year_number"] if year else 0,
        "section_name": section["name"] if section else "",
        "semester_label": semester["label"] if semester else "",
        "attendance_percentage": student.get("attendance_percentage", 0),
        "assignments_completed": student.get("assignments_completed", 0),
        "assignments_total": student.get("assignments_total", 0),
        "average_score": student.get("average_score", 0),
        "cgpa": student.get("cgpa"),
        "risk_level": student.get("risk_level", "normal"),
        "risk_reasons": student.get("risk_reasons"),
        "avatar_url": student.get("avatar_url"),
        "recent_attendance": [
            {"status": status, "date": d if isinstance(d, str) else d.isoformat() if hasattr(d, 'isoformat') else str(d)}
            for status, d in recent_attendance
        ],
        "submissions": submissions,
        "assessment_results": assessment_results,
    }
