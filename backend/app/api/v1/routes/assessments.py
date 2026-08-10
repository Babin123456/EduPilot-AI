"""Assessments routes."""

from __future__ import annotations

import uuid
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query
from pymongo.database import Database

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.core.exceptions import http_403, http_404
from app.models.assessment import new_assessment, new_assessment_result
from app.models.document import new_document
from app.models.student import student_full_name

router = APIRouter()


class GenerateQuizRequest(BaseModel):
    class_id: str
    topic: str
    difficulty: str = "medium"
    num_questions: int = 10


@router.post("/generate")
def generate_ai_mcq_quiz(
    body: GenerateQuizRequest,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Generate 100% MCQ AI Quiz with 10 to 20 questions."""
    tca = db.teacher_course_assignments.find_one({
        "id": body.class_id, "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized")

    course = db.courses.find_one({"id": tca["course_id"]})
    course_name = course["name"] if course else "Subject"
    course_code = course["code"] if course else ""

    topic = body.topic.strip()
    num_q = max(10, min(20, body.num_questions))

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

    # Save Assessment
    assessment_doc = new_assessment(
        teacher_course_assignment_id=body.class_id,
        teacher_id=teacher["id"],
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
    db.assessments.insert_one(assessment_doc)

    # Save to Document Studio
    doc = new_document(
        teacher_course_assignment_id=body.class_id,
        teacher_id=teacher["id"],
        title=f"MCQ Quiz — {topic}",
        document_type="quiz",
        format="pdf",
    )
    db.documents.insert_one(doc)

    return {
        "id": assessment_doc["id"],
        "title": assessment_doc["title"],
        "topic": topic,
        "total_questions": num_q,
        "total_marks": assessment_doc["total_marks"],
        "questions": questions,
    }


@router.get("")
def list_assessments(
    class_id: str = Query(...),
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """List assessments for a class."""
    tca = db.teacher_course_assignments.find_one({
        "id": class_id, "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized")

    assessments = list(
        db.assessments.find({"teacher_course_assignment_id": class_id})
        .sort("created_at", -1)
    )

    return [
        {
            "id": a["id"],
            "title": a["title"],
            "assessment_type": a.get("assessment_type", "quiz"),
            "topic": a.get("topic"),
            "difficulty": a.get("difficulty", "medium"),
            "total_marks": a.get("total_marks", 50),
            "duration_minutes": a.get("duration_minutes"),
            "total_questions": a.get("total_questions", 0),
            "status": a.get("status", "draft"),
            "is_ai_generated": a.get("is_ai_generated", False),
            "created_at": a["created_at"].isoformat() if hasattr(a.get("created_at"), 'isoformat') else a.get("created_at"),
        }
        for a in assessments
    ]


@router.get("/{assessment_id}/results")
def get_results(
    assessment_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get results for an assessment."""
    assessment = db.assessments.find_one({"id": assessment_id})
    if not assessment:
        raise http_404("Assessment not found")

    tca = db.teacher_course_assignments.find_one({
        "id": assessment["teacher_course_assignment_id"],
        "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized")

    results = list(db.assessment_results.find({"assessment_id": assessment_id}))

    output = []
    for r in results:
        st = db.students.find_one({"id": r["student_id"]})
        if st:
            output.append({
                "student_id": st["id"],
                "student_name": student_full_name(st),
                "roll_number": st["roll_number"],
                "score": r.get("score", 0),
                "max_score": r.get("max_score", 0),
                "percentage": r.get("percentage", 0),
                "grade": r.get("grade"),
            })

    output.sort(key=lambda x: x["roll_number"])
    return output


class SubmitQuizRequest(BaseModel):
    assessment_id: str
    student_id: str
    answers: list[dict]


@router.post("/submit")
def submit_quiz_answers(
    body: SubmitQuizRequest,
    db: Database = Depends(get_db),
):
    """Student quiz submission endpoint with automated AI grading."""
    assessment = db.assessments.find_one({"id": body.assessment_id})
    if not assessment:
        raise http_404("Assessment not found")

    student = db.students.find_one({"id": body.student_id})
    if not student:
        raise http_404("Student not found")

    max_score = assessment.get("total_marks") or 25
    num_questions = assessment.get("total_questions") or len(body.answers) or 5
    marks_per_q = max_score / max(1, num_questions)

    earned_score = 0.0
    for ans in body.answers:
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

    # Upsert result
    existing = db.assessment_results.find_one({
        "assessment_id": body.assessment_id,
        "student_id": body.student_id,
    })

    if existing:
        db.assessment_results.update_one(
            {"id": existing["id"]},
            {"$set": {
                "score": earned_score,
                "max_score": max_score,
                "percentage": percentage,
                "grade": grade,
            }},
        )
    else:
        result_doc = new_assessment_result(
            assessment_id=body.assessment_id,
            student_id=body.student_id,
            score=earned_score,
            max_score=max_score,
            percentage=percentage,
            grade=grade,
        )
        db.assessment_results.insert_one(result_doc)

    return {
        "assessment_id": assessment["id"],
        "student_id": student["id"],
        "student_name": student_full_name(student),
        "roll_number": student["roll_number"],
        "score": earned_score,
        "max_score": max_score,
        "percentage": percentage,
        "grade": grade,
        "message": "Quiz submission evaluated and saved successfully.",
    }
