"""Classes routes — teacher's course assignments."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pymongo.database import Database

from app.api.deps import get_current_teacher
from app.core.database import get_db
from app.core.exceptions import http_403, http_404

router = APIRouter()


@router.get("")
def get_classes(
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get all classes assigned to the current teacher."""
    tcas = list(db.teacher_course_assignments.find({
        "teacher_id": teacher["id"], "is_active": True,
    }))

    result = []
    for tca in tcas:
        course = db.courses.find_one({"id": tca["course_id"]})
        section = db.sections.find_one({"id": tca["section_id"]})
        year = db.years.find_one({"id": tca["year_id"]})
        semester = db.semesters.find_one({"id": tca["semester_id"]})
        if course and section and year and semester:
            result.append({
                "id": tca["id"],
                "course_id": course["id"],
                "course_code": course["code"],
                "course_name": course["name"],
                "course_type": course["course_type"],
                "credits": course["credits"],
                "section_id": section["id"],
                "section_name": section["name"],
                "year_id": year["id"],
                "year_label": year["label"],
                "year_number": year["year_number"],
                "semester_id": semester["id"],
                "semester_label": semester["label"],
                "semester_number": semester["semester_number"],
                "room": tca.get("room"),
            })

    # Sort by year_number, section_name, course_code
    result.sort(key=lambda x: (x["year_number"], x["section_name"], x["course_code"]))
    return result


@router.get("/{class_id}")
def get_class_detail(
    class_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get details of a specific class."""
    tca = db.teacher_course_assignments.find_one({"id": class_id})
    if not tca:
        raise http_404("Class not found")
    if tca["teacher_id"] != teacher["id"]:
        raise http_403("Not authorized to view this class")

    course = db.courses.find_one({"id": tca["course_id"]})
    section = db.sections.find_one({"id": tca["section_id"]})
    year = db.years.find_one({"id": tca["year_id"]})
    semester = db.semesters.find_one({"id": tca["semester_id"]})

    student_count = db.students.count_documents({
        "section_id": section["id"], "is_active": True,
    }) if section else 0

    return {
        "id": tca["id"],
        "course_id": course["id"],
        "course_code": course["code"],
        "course_name": course["name"],
        "course_type": course["course_type"],
        "credits": course["credits"],
        "description": course.get("description"),
        "syllabus": course.get("syllabus"),
        "section_id": section["id"],
        "section_name": section["name"],
        "year_id": year["id"],
        "year_label": year["label"],
        "year_number": year["year_number"],
        "semester_id": semester["id"],
        "semester_label": semester["label"],
        "room": tca.get("room"),
        "student_count": student_count,
    }
