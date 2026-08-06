"""Students routes — directory, profile, filtering."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.core.exceptions import http_404, http_403
from app.models.teacher import Teacher
from app.models.student import Student
from app.models.enrollment import TeacherCourseAssignment
from app.models.academic import Year, Section, Semester
from app.models.attendance import AttendanceSession, AttendanceRecord
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.assessment import Assessment, AssessmentResult

router = APIRouter()


def _get_authorized_section_ids(db: Session, teacher: Teacher) -> list[str]:
    """Get section IDs the teacher is authorized to view."""
    tcas = (
        db.query(TeacherCourseAssignment.section_id)
        .filter(TeacherCourseAssignment.teacher_id == teacher.id, TeacherCourseAssignment.is_active == True)
        .distinct()
        .all()
    )
    return [t[0] for t in tcas]


@router.get("")
def list_students(
    class_id: str | None = Query(None),
    section_id: str | None = Query(None),
    year_id: str | None = Query(None),
    search: str | None = Query(None),
    risk: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """List students with filtering, search, and pagination."""
    authorized_sections = _get_authorized_section_ids(db, teacher)
    if not authorized_sections:
        return {"students": [], "total": 0, "page": page, "limit": limit}

    query = db.query(Student).filter(
        Student.is_active == True,
        Student.section_id.in_(authorized_sections),
    )

    # Filter by specific class assignment
    if class_id:
        tca = db.query(TeacherCourseAssignment).filter(
            TeacherCourseAssignment.id == class_id,
            TeacherCourseAssignment.teacher_id == teacher.id,
        ).first()
        if tca:
            query = query.filter(Student.section_id == tca.section_id)
        else:
            return {"students": [], "total": 0, "page": page, "limit": limit}

    if section_id:
        if section_id in authorized_sections:
            query = query.filter(Student.section_id == section_id)
        else:
            return {"students": [], "total": 0, "page": page, "limit": limit}

    if year_id:
        query = query.filter(Student.year_id == year_id)

    if risk:
        query = query.filter(Student.risk_level == risk)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Student.first_name.ilike(search_term),
                Student.last_name.ilike(search_term),
                Student.roll_number.ilike(search_term),
                Student.registration_number.ilike(search_term),
                Student.email.ilike(search_term),
            )
        )

    total = query.count()
    students = (
        query
        .join(Year, Student.year_id == Year.id)
        .join(Section, Student.section_id == Section.id)
        .order_by(Student.roll_number)
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    # Fetch year/section info
    result = []
    for s in students:
        year = db.query(Year).filter(Year.id == s.year_id).first()
        section = db.query(Section).filter(Section.id == s.section_id).first()
        result.append({
            "id": s.id,
            "student_uid": s.student_uid,
            "registration_number": s.registration_number,
            "roll_number": s.roll_number,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "full_name": s.full_name,
            "email": s.email,
            "phone": s.phone,
            "year_label": year.label if year else "",
            "year_number": year.year_number if year else 0,
            "section_name": section.name if section else "",
            "attendance_percentage": s.attendance_percentage,
            "average_score": s.average_score,
            "cgpa": s.cgpa,
            "risk_level": s.risk_level,
            "avatar_url": s.avatar_url,
        })

    return {"students": result, "total": total, "page": page, "limit": limit}


@router.get("/{student_id}")
def get_student_profile(
    student_id: str,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Get full 360-degree student profile."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise http_404("Student not found")

    # Authorization check
    authorized_sections = _get_authorized_section_ids(db, teacher)
    if student.section_id not in authorized_sections:
        raise http_403("Not authorized to view this student")

    year = db.query(Year).filter(Year.id == student.year_id).first()
    section = db.query(Section).filter(Section.id == student.section_id).first()
    semester = db.query(Semester).filter(Semester.id == student.semester_id).first()

    # Recent attendance
    recent_attendance = (
        db.query(AttendanceRecord.status, AttendanceSession.date)
        .join(AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id)
        .filter(AttendanceRecord.student_id == student_id)
        .order_by(AttendanceSession.date.desc())
        .limit(20)
        .all()
    )

    # Assignment submissions
    submissions = (
        db.query(AssignmentSubmission, Assignment)
        .join(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
        .filter(AssignmentSubmission.student_id == student_id)
        .order_by(AssignmentSubmission.submitted_at.desc())
        .limit(10)
        .all()
    )

    # Assessment results
    results = (
        db.query(AssessmentResult, Assessment)
        .join(Assessment, AssessmentResult.assessment_id == Assessment.id)
        .filter(AssessmentResult.student_id == student_id)
        .order_by(AssessmentResult.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "id": student.id,
        "student_uid": student.student_uid,
        "registration_number": student.registration_number,
        "roll_number": student.roll_number,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "full_name": student.full_name,
        "email": student.email,
        "phone": student.phone,
        "gender": student.gender,
        "year_label": year.label if year else "",
        "year_number": year.year_number if year else 0,
        "section_name": section.name if section else "",
        "semester_label": semester.label if semester else "",
        "attendance_percentage": student.attendance_percentage,
        "assignments_completed": student.assignments_completed,
        "assignments_total": student.assignments_total,
        "average_score": student.average_score,
        "cgpa": student.cgpa,
        "risk_level": student.risk_level,
        "risk_reasons": student.risk_reasons,
        "avatar_url": student.avatar_url,
        "recent_attendance": [
            {"status": status, "date": d.isoformat()} for status, d in recent_attendance
        ],
        "submissions": [
            {
                "assignment_title": a.title,
                "score": s.score,
                "max_score": s.max_score,
                "status": s.status,
                "is_late": s.is_late,
                "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
            }
            for s, a in submissions
        ],
        "assessment_results": [
            {
                "assessment_title": a.title,
                "score": r.score,
                "max_score": r.max_score,
                "percentage": r.percentage,
                "grade": r.grade,
            }
            for r, a in results
        ],
    }
