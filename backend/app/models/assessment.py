"""Assessment, Question, and AssessmentResult document helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


ASSESSMENTS = "assessments"
QUESTIONS = "questions"
ASSESSMENT_RESULTS = "assessment_results"


def new_assessment(*, teacher_course_assignment_id, teacher_id, title,
                   description=None, assessment_type="quiz", topic=None,
                   difficulty="medium", total_marks=50, duration_minutes=None,
                   total_questions=0, learning_objectives=None,
                   is_ai_generated=False, is_published=False,
                   questions_json=None, answer_key_json=None,
                   status="draft", id=None):
    return {
        "id": id or _uid(),
        "teacher_course_assignment_id": teacher_course_assignment_id,
        "teacher_id": teacher_id,
        "title": title,
        "description": description,
        "assessment_type": assessment_type,
        "topic": topic,
        "difficulty": difficulty,
        "total_marks": total_marks,
        "duration_minutes": duration_minutes,
        "total_questions": total_questions,
        "learning_objectives": learning_objectives,
        "is_ai_generated": is_ai_generated,
        "is_published": is_published,
        "questions_json": questions_json,
        "answer_key_json": answer_key_json,
        "status": status,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def new_question(*, assessment_id, question_number, question_type, question_text,
                 options=None, correct_answer=None, explanation=None,
                 marks=1, difficulty="medium", bloom_level=None, topic=None, id=None):
    return {
        "id": id or _uid(),
        "assessment_id": assessment_id,
        "question_number": question_number,
        "question_type": question_type,
        "question_text": question_text,
        "options": options,
        "correct_answer": correct_answer,
        "explanation": explanation,
        "marks": marks,
        "difficulty": difficulty,
        "bloom_level": bloom_level,
        "topic": topic,
        "created_at": _utcnow(),
    }


def new_assessment_result(*, assessment_id, student_id, score=0.0, max_score=0.0,
                          percentage=0.0, grade=None, answers_json=None,
                          feedback=None, evaluated_at=None, id=None):
    return {
        "id": id or _uid(),
        "assessment_id": assessment_id,
        "student_id": student_id,
        "score": score,
        "max_score": max_score,
        "percentage": percentage,
        "grade": grade,
        "answers_json": answers_json,
        "feedback": feedback,
        "evaluated_at": evaluated_at,
        "created_at": _utcnow(),
    }
