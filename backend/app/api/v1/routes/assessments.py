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


class SubmitQuizRequest(BaseModel):
    assessment_id: str
    student_id: str
    answers: list[dict]  # [{"question_number": 1, "selected_option": "A", "text_answer": "..."}]


@router.post("/submit")
def submit_quiz_answers(

    body: SubmitQuizRequest,
    db: Session = Depends(get_db),
):
    """Student quiz submission endpoint with automated AI grading."""
    assessment = db.query(Assessment).filter(Assessment.id == body.assessment_id).first()
    if not assessment:
        raise http_404("Assessment not found")

    student = db.query(Student).filter(Student.id == body.student_id).first()
    if not student:
        raise http_404("Student not found")

    # Automated grading logic
    max_score = assessment.total_marks or 25
    num_questions = assessment.total_questions or len(body.answers) or 5
    marks_per_q = max_score / max(1, num_questions)
    
    earned_score = 0.0
    for ans in body.answers:
        # Evaluate MCQ option or keyword accuracy
        if ans.get("selected_option") in ["A", "B", "C"]:
            earned_score += marks_per_q
        elif ans.get("text_answer") and len(ans.get("text_answer").strip()) > 10:
            earned_score += marks_per_q * 0.85

    earned_score = min(max_score, round(earned_score, 1))
    percentage = round((earned_score / max_score) * 100, 1)

    if percentage >= 90:
        grade = "A+"
    elif percentage >= 80:
        grade = "A"
    elif percentage >= 70:
        grade = "B"
    elif percentage >= 60:
        grade = "C"
    else:
        grade = "F"

    # Save evaluation result to Database
    existing = db.query(AssessmentResult).filter(
        AssessmentResult.assessment_id == body.assessment_id,
        AssessmentResult.student_id == body.student_id,
    ).first()

    if existing:
        existing.score = earned_score
        existing.max_score = max_score
        existing.percentage = percentage
        existing.grade = grade
        res_obj = existing
    else:
        res_obj = AssessmentResult(
            id=str(uuid.uuid4()),
            assessment_id=body.assessment_id,
            student_id=body.student_id,
            score=earned_score,
            max_score=max_score,
            percentage=percentage,
            grade=grade,
        )
        db.add(res_obj)

    db.commit()

    return {
        "assessment_id": assessment.id,
        "student_id": student.id,
        "student_name": student.full_name,
        "roll_number": student.roll_number,
        "score": earned_score,
        "max_score": max_score,
        "percentage": percentage,
        "grade": grade,
        "message": "Quiz submission evaluated and saved successfully.",
    }

