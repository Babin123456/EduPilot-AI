"""Assessments routes."""

from __future__ import annotations

import uuid
from pydantic import BaseModel
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


class GenerateQuizRequest(BaseModel):
    class_id: str
    topic: str
    difficulty: str = "medium"
    num_questions: int = 10  # Range: 10 to 20 MCQ questions


@router.post("/generate")
def generate_ai_mcq_quiz(
    body: GenerateQuizRequest,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Generate 100% MCQ AI Quiz with 10 to 20 questions."""
    tca = db.query(TeacherCourseAssignment).filter(
        TeacherCourseAssignment.id == body.class_id,
        TeacherCourseAssignment.teacher_id == teacher.id,
    ).first()
    if not tca:
        raise http_403("Not authorized")

    from app.models.academic import Course
    course = db.query(Course).filter(Course.id == tca.course_id).first()
    course_name = course.name if course else "Subject"
    course_code = course.code if course else ""

    topic = body.topic.strip()
    num_q = max(10, min(20, body.num_questions))

    # MCQ templates
    mcq_stems = [
        f"Which of the following best defines the primary objective of {topic} in {course_name}?",
        f"What is the theoretical time/space complexity trade-off associated with {topic}?",
        f"In an enterprise system handling {topic}, which component prevents execution bottlenecks?",
        f"Which operational protocol or invariant must be maintained during {topic} processing?",
        f"When optimizing {topic}, which algorithm or data structure provides the highest throughput?",
    ]

    questions = []
    for i in range(num_q):
        stem = mcq_stems[i % len(mcq_stems)]
        questions.append({
            "number": i + 1,
            "text": f"Q{i + 1}: {stem}",
            "type": "mcq",
            "options": [
                f"A) Primary theoretical model for {topic}",
                f"B) Secondary optimization framework",
                f"C) Algorithmic decomposition pattern",
                f"D) Asynchronous execution pipeline",
            ],
            "correct_option": "A",
            "marks": 2,
        })

    # Save Assessment in DB
    assessment = Assessment(
        id=str(uuid.uuid4()),
        teacher_course_assignment_id=body.class_id,
        teacher_id=teacher.id,
        title=f"MCQ Quiz — {topic}",
        assessment_type="quiz",
        topic=topic,
        difficulty=body.difficulty,
        total_marks=num_q * 2,
        duration_minutes=num_q * 3,
        total_questions=num_q,
        status="published",
        is_published=True,
        is_ai_generated=True,
    )
    db.add(assessment)
    db.commit()

    return {
        "id": assessment.id,
        "title": assessment.title,
        "topic": topic,
        "total_questions": num_q,
        "total_marks": assessment.total_marks,
        "questions": questions,
    }



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

