"""Assessments routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.core.exceptions import http_403, http_404
from app.models.teacher import Teacher
from app.models.enrollment import TeacherCourseAssignment
from app.models.assessment import Assessment, AssessmentResult
from app.models.student import Student

router = APIRouter()


@router.get("")
def list_assessments(
    class_id: str = Query(...),
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """List assessments for a class."""
    tca = db.query(TeacherCourseAssignment).filter(
        TeacherCourseAssignment.id == class_id,
        TeacherCourseAssignment.teacher_id == teacher.id,
    ).first()
    if not tca:
        raise http_403("Not authorized")

    assessments = (
        db.query(Assessment)
        .filter(Assessment.teacher_course_assignment_id == class_id)
        .order_by(Assessment.created_at.desc())
        .all()
    )

    return [
        {
            "id": a.id,
            "title": a.title,
            "assessment_type": a.assessment_type,
            "topic": a.topic,
            "difficulty": a.difficulty,
            "total_marks": a.total_marks,
            "duration_minutes": a.duration_minutes,
            "total_questions": a.total_questions,
            "status": a.status,
            "is_ai_generated": a.is_ai_generated,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in assessments
    ]


@router.get("/{assessment_id}/results")
def get_results(
    assessment_id: str,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Get results for an assessment."""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise http_404("Assessment not found")

    tca = db.query(TeacherCourseAssignment).filter(
        TeacherCourseAssignment.id == assessment.teacher_course_assignment_id,
        TeacherCourseAssignment.teacher_id == teacher.id,
    ).first()
    if not tca:
        raise http_403("Not authorized")

    results = (
        db.query(AssessmentResult, Student)
        .join(Student, AssessmentResult.student_id == Student.id)
        .filter(AssessmentResult.assessment_id == assessment_id)
        .order_by(Student.roll_number)
        .all()
    )

    return [
        {
            "student_id": st.id,
            "student_name": st.full_name,
            "roll_number": st.roll_number,
            "score": r.score,
            "max_score": r.max_score,
            "percentage": r.percentage,
            "grade": r.grade,
        }
        for r, st in results
    ]
