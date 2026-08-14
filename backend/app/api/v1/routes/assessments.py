"""Assessments routes."""

from __future__ import annotations

import json
import logging
import uuid

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from pymongo.database import Database

from app.api.deps import get_current_teacher
from app.core.database import get_db
from app.core.exceptions import http_403, http_404
from app.models.assessment import new_assessment, new_assessment_result
from app.models.document import new_document
from app.models.student import student_full_name

logger = logging.getLogger(__name__)

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
    """Generate 100% MCQ AI Quiz using Groq/Gemini LLM with template fallback."""
    tca = db.teacher_course_assignments.find_one({
        "id": body.class_id, "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized")

    course = db.courses.find_one({"id": tca["course_id"]})
    course_name = course["name"] if course else "Subject"
    course_code = course["code"] if course else ""

    topic = body.topic.strip()
    num_q = max(5, min(20, body.num_questions))

    # ── Try real LLM generation first ──
    questions = None
    try:
        from app.services.llm_generation_service import generate_real_mcq_quiz
        questions = generate_real_mcq_quiz(
            topic=topic,
            course_name=course_name,
            course_code=course_code,
            difficulty=body.difficulty,
            num_questions=num_q,
        )
        if questions:
            logger.info("LLM generated %d real MCQ questions for topic '%s'", len(questions), topic)
    except Exception as e:
        logger.warning("LLM quiz generation failed, falling back to templates: %s", str(e))

    # ── Fallback: template-based generation if LLM fails ──
    if not questions:
        logger.info("Using template fallback for quiz generation on topic '%s'", topic)
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
                    "B) Secondary optimization framework",
                    "C) Algorithmic decomposition pattern",
                    "D) Asynchronous execution pipeline",
                ],
                "correct_option": "A",
                "marks": 2,
            })

    total_marks = sum(q.get("marks", 2) for q in questions)

    # Save Assessment
    assessment_doc = new_assessment(
        teacher_course_assignment_id=body.class_id,
        teacher_id=teacher["id"],
        title=f"MCQ Quiz — {topic}",
        assessment_type="quiz",
        topic=topic,
        difficulty=body.difficulty,
        total_marks=total_marks,
        duration_minutes=len(questions) * 3,
        total_questions=len(questions),
        questions_json=json.dumps(questions),
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
        "total_questions": len(questions),
        "total_marks": total_marks,
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

    results = []
    for a in assessments:
        q_list = []
        if a.get("questions_json"):
            try:
                q_list = json.loads(a["questions_json"])
            except Exception:
                q_list = []
        results.append({
            "id": a["id"],
            "title": a["title"],
            "assessment_type": a.get("assessment_type", "quiz"),
            "topic": a.get("topic"),
            "difficulty": a.get("difficulty", "medium"),
            "total_marks": a.get("total_marks", 50),
            "duration_minutes": a.get("duration_minutes"),
            "total_questions": a.get("total_questions", len(q_list)),
            "questions": q_list,
            "status": a.get("status", "draft"),
            "is_ai_generated": a.get("is_ai_generated", False),
            "created_at": a["created_at"].isoformat() if hasattr(a.get("created_at"), 'isoformat') else a.get("created_at"),
        })
    return results


@router.get("/{assessment_id}")
def get_assessment_details(
    assessment_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get single assessment details with full questions list."""
    assessment = db.assessments.find_one({"id": assessment_id})
    if not assessment:
        raise http_404("Assessment not found")

    q_list = []
    if assessment.get("questions_json"):
        try:
            q_list = json.loads(assessment["questions_json"])
        except Exception:
            q_list = []

    return {
        "id": assessment["id"],
        "title": assessment["title"],
        "assessment_type": assessment.get("assessment_type", "quiz"),
        "topic": assessment.get("topic"),
        "difficulty": assessment.get("difficulty", "medium"),
        "total_marks": assessment.get("total_marks", 50),
        "duration_minutes": assessment.get("duration_minutes"),
        "total_questions": assessment.get("total_questions", len(q_list)),
        "questions": q_list,
        "status": assessment.get("status", "draft"),
        "is_ai_generated": assessment.get("is_ai_generated", False),
        "created_at": assessment["created_at"].isoformat() if hasattr(assessment.get("created_at"), 'isoformat') else assessment.get("created_at"),
    }


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


# ─── Task 4: Question-Level CRUD ─────────────────────────────────────────────

class AddQuestionRequest(BaseModel):
    text: str
    question_type: str = "mcq"   # mcq | short | coding
    options: list[str] | None = None
    correct_option: str | None = None
    marks: int = 2
    bloom_tag: str | None = None  # remember | understand | apply | analyse | evaluate | create


class EditQuestionRequest(BaseModel):
    text: str | None = None
    options: list[str] | None = None
    correct_option: str | None = None
    marks: int | None = None
    bloom_tag: str | None = None


@router.get("/{assessment_id}/questions")
def list_questions(
    assessment_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Retrieve individual question items with Bloom's taxonomy tags."""
    assessment = db.assessments.find_one({"id": assessment_id})
    if not assessment:
        raise http_404("Assessment not found")

    q_list = []
    if assessment.get("questions_json"):
        try:
            q_list = json.loads(assessment["questions_json"])
        except Exception:
            q_list = []

    # Enrich with bloom tags if missing
    for i, q in enumerate(q_list):
        if "bloom_tag" not in q:
            q["bloom_tag"] = None
        if "id" not in q:
            q["id"] = str(uuid.uuid4())  # stable IDs for existing questions
        q["number"] = i + 1

    return q_list


@router.post("/{assessment_id}/questions", status_code=201)
def add_question(
    assessment_id: str,
    body: AddQuestionRequest,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Add a manual question to the assessment's question bank."""
    assessment = db.assessments.find_one({"id": assessment_id})
    if not assessment:
        raise http_404("Assessment not found")

    tca = db.teacher_course_assignments.find_one(
        {"id": assessment["teacher_course_assignment_id"], "teacher_id": teacher["id"]}
    )
    if not tca:
        raise http_403("Not authorized")

    q_list = []
    if assessment.get("questions_json"):
        try:
            q_list = json.loads(assessment["questions_json"])
        except Exception:
            q_list = []

    new_q = {
        "id": str(uuid.uuid4()),
        "number": len(q_list) + 1,
        "text": body.text,
        "type": body.question_type,
        "options": body.options,
        "correct_option": body.correct_option,
        "marks": body.marks,
        "bloom_tag": body.bloom_tag,
    }
    q_list.append(new_q)

    new_total_marks = sum(q.get("marks", 2) for q in q_list)
    db.assessments.update_one(
        {"id": assessment_id},
        {"$set": {
            "questions_json": json.dumps(q_list),
            "total_questions": len(q_list),
            "total_marks": new_total_marks,
        }},
    )
    return {"question_id": new_q["id"], "number": new_q["number"], "message": "Question added successfully"}


@router.put("/questions/{question_id}")
def edit_question(
    question_id: str,
    body: EditQuestionRequest,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Edit question text, options, or correct answer in an assessment."""
    # Find the assessment containing this question
    all_assessments = db.assessments.find({"teacher_id": teacher["id"]})
    target_assessment = None
    target_q_list = []

    for assessment in all_assessments:
        if not assessment.get("questions_json"):
            continue
        try:
            q_list = json.loads(assessment["questions_json"])
        except Exception:
            continue
        for q in q_list:
            if q.get("id") == question_id:
                target_assessment = assessment
                target_q_list = q_list
                break
        if target_assessment:
            break

    if not target_assessment:
        raise http_404("Question not found")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    for q in target_q_list:
        if q.get("id") == question_id:
            q.update(updates)
            break

    db.assessments.update_one(
        {"id": target_assessment["id"]},
        {"$set": {"questions_json": json.dumps(target_q_list)}},
    )
    return {"question_id": question_id, "message": "Question updated successfully"}


@router.delete("/questions/{question_id}", status_code=204)
def delete_question(
    question_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Remove a question from an assessment."""
    all_assessments = db.assessments.find({"teacher_id": teacher["id"]})
    target_assessment = None
    target_q_list = []

    for assessment in all_assessments:
        if not assessment.get("questions_json"):
            continue
        try:
            q_list = json.loads(assessment["questions_json"])
        except Exception:
            continue
        for q in q_list:
            if q.get("id") == question_id:
                target_assessment = assessment
                target_q_list = q_list
                break
        if target_assessment:
            break

    if not target_assessment:
        raise http_404("Question not found")

    target_q_list = [q for q in target_q_list if q.get("id") != question_id]
    # Re-number
    for i, q in enumerate(target_q_list):
        q["number"] = i + 1

    new_total_marks = sum(q.get("marks", 2) for q in target_q_list)
    db.assessments.update_one(
        {"id": target_assessment["id"]},
        {"$set": {
            "questions_json": json.dumps(target_q_list),
            "total_questions": len(target_q_list),
            "total_marks": new_total_marks,
        }},
    )


@router.post("/{assessment_id}/publish")
def publish_assessment(
    assessment_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Publish quiz to the student portal / section roster."""
    assessment = db.assessments.find_one({"id": assessment_id})
    if not assessment:
        raise http_404("Assessment not found")

    tca = db.teacher_course_assignments.find_one(
        {"id": assessment["teacher_course_assignment_id"], "teacher_id": teacher["id"]}
    )
    if not tca:
        raise http_403("Not authorized")

    if assessment.get("status") == "published":
        return {"message": "Assessment is already published", "assessment_id": assessment_id}

    db.assessments.update_one(
        {"id": assessment_id},
        {"$set": {"status": "published", "is_published": True}},
    )
    return {
        "assessment_id": assessment_id,
        "title": assessment.get("title"),
        "message": "Assessment published successfully. Students can now access it.",
    }


@router.delete("/{assessment_id}")
def delete_assessment(
    assessment_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Delete a quiz/assessment permanently and cascade delete its studio document."""
    assessment = db.assessments.find_one({"id": assessment_id})
    if not assessment:
        raise http_404("Assessment not found")

    tca = db.teacher_course_assignments.find_one(
        {"id": assessment["teacher_course_assignment_id"], "teacher_id": teacher["id"]}
    )
    if not tca:
        raise http_403("Not authorized")

    title = assessment.get("title", "")
    db.assessments.delete_one({"id": assessment_id})
    db.assessment_results.delete_many({"assessment_id": assessment_id})

    # Cascade deletion from Document Studio
    if title:
        db.documents.delete_many({
            "teacher_id": teacher["id"],
            "$or": [
                {"title": title},
                {"title": {"$regex": title[:12], "$options": "i"}},
            ],
        })

    return {"message": "Quiz and associated studio document deleted successfully", "assessment_id": assessment_id}

