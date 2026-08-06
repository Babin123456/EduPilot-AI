"""Classes routes — teacher's course assignments."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.core.exceptions import http_404, http_403
from app.models.teacher import Teacher
from app.models.enrollment import TeacherCourseAssignment
from app.models.academic import Course, Section, Year, Semester

router = APIRouter()


@router.get("")
def get_classes(
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Get all classes assigned to the current teacher."""
    rows = (
        db.query(TeacherCourseAssignment, Course, Section, Year, Semester)
        .join(Course, TeacherCourseAssignment.course_id == Course.id)
        .join(Section, TeacherCourseAssignment.section_id == Section.id)
        .join(Year, TeacherCourseAssignment.year_id == Year.id)
        .join(Semester, TeacherCourseAssignment.semester_id == Semester.id)
        .filter(TeacherCourseAssignment.teacher_id == teacher.id, TeacherCourseAssignment.is_active == True)
        .order_by(Year.year_number, Section.name, Course.code)
        .all()
    )

    return [
        {
            "id": tca.id,
            "course_id": course.id,
            "course_code": course.code,
            "course_name": course.name,
            "course_type": course.course_type,
            "credits": course.credits,
            "section_id": section.id,
            "section_name": section.name,
            "year_id": year.id,
            "year_label": year.label,
            "year_number": year.year_number,
            "semester_id": semester.id,
            "semester_label": semester.label,
            "semester_number": semester.semester_number,
            "room": tca.room,
        }
        for tca, course, section, year, semester in rows
    ]


@router.get("/{class_id}")
def get_class_detail(
    class_id: str,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Get details of a specific class."""
    row = (
        db.query(TeacherCourseAssignment, Course, Section, Year, Semester)
        .join(Course, TeacherCourseAssignment.course_id == Course.id)
        .join(Section, TeacherCourseAssignment.section_id == Section.id)
        .join(Year, TeacherCourseAssignment.year_id == Year.id)
        .join(Semester, TeacherCourseAssignment.semester_id == Semester.id)
        .filter(TeacherCourseAssignment.id == class_id)
        .first()
    )
    if not row:
        raise http_404("Class not found")

    tca, course, section, year, semester = row
    if tca.teacher_id != teacher.id:
        raise http_403("Not authorized to view this class")

    from sqlalchemy import func
    from app.models.student import Student
    student_count = (
        db.query(func.count(Student.id))
        .filter(Student.section_id == section.id, Student.is_active == True)
        .scalar()
    )

    return {
        "id": tca.id,
        "course_id": course.id,
        "course_code": course.code,
        "course_name": course.name,
        "course_type": course.course_type,
        "credits": course.credits,
        "description": course.description,
        "syllabus": course.syllabus,
        "section_id": section.id,
        "section_name": section.name,
        "year_id": year.id,
        "year_label": year.label,
        "year_number": year.year_number,
        "semester_id": semester.id,
        "semester_label": semester.label,
        "room": tca.room,
        "student_count": student_count,
    }
