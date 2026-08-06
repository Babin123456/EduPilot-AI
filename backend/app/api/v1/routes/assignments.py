"""Assignments routes."""

from __future__ import annotations
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.core.exceptions import http_403, http_404
from app.models.teacher import Teacher
from app.models.enrollment import TeacherCourseAssignment
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.student import Student

router = APIRouter()


class CreateAssignmentRequest(BaseModel):
    class_id: str
    title: str
    description: str | None = None
    instructions: str | None = None
    topic: str | None = None
    difficulty: str = "medium"
    total_marks: int = 100
    deadline: str | None = None


@router.get("")
def list_assignments(
    class_id: str = Query(...),
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """List assignments for a class."""
    tca = db.query(TeacherCourseAssignment).filter(
        TeacherCourseAssignment.id == class_id,
        TeacherCourseAssignment.teacher_id == teacher.id,
    ).first()
    if not tca:
        raise http_403("Not authorized")

    assignments = (
        db.query(Assignment)
        .filter(Assignment.teacher_course_assignment_id == class_id)
        .order_by(Assignment.created_at.desc())
        .all()
    )

    from sqlalchemy import func
    result = []
    for a in assignments:
        submitted = db.query(func.count(AssignmentSubmission.id)).filter(
            AssignmentSubmission.assignment_id == a.id,
            AssignmentSubmission.status != "pending",
        ).scalar()
        total = db.query(func.count(Student.id)).filter(
            Student.section_id == tca.section_id, Student.is_active == True
        ).scalar()

        result.append({
            "id": a.id,
            "title": a.title,
            "topic": a.topic,
            "difficulty": a.difficulty,
            "total_marks": a.total_marks,
            "deadline": a.deadline.isoformat() if a.deadline else None,
            "status": a.status,
            "is_ai_generated": a.is_ai_generated,
            "submitted_count": submitted,
            "total_students": total,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })

    return result


@router.post("")
def create_assignment(
    body: CreateAssignmentRequest,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Create a new assignment."""
    tca = db.query(TeacherCourseAssignment).filter(
        TeacherCourseAssignment.id == body.class_id,
        TeacherCourseAssignment.teacher_id == teacher.id,
    ).first()
    if not tca:
        raise http_403("Not authorized")

    assignment = Assignment(
        id=str(uuid.uuid4()),
        teacher_course_assignment_id=body.class_id,
        teacher_id=teacher.id,
        title=body.title,
        description=body.description,
        instructions=body.instructions,
        topic=body.topic,
        difficulty=body.difficulty,
        total_marks=body.total_marks,
        deadline=datetime.fromisoformat(body.deadline) if body.deadline else None,
        status="published",
        is_published=True,
    )
    db.add(assignment)
    db.commit()

    return {"id": assignment.id, "message": "Assignment created successfully"}


@router.get("/{assignment_id}/submissions")
def get_submissions(
    assignment_id: str,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Get submissions for an assignment."""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise http_404("Assignment not found")

    tca = db.query(TeacherCourseAssignment).filter(
        TeacherCourseAssignment.id == assignment.teacher_course_assignment_id,
        TeacherCourseAssignment.teacher_id == teacher.id,
    ).first()
    if not tca:
        raise http_403("Not authorized")

    subs = (
        db.query(AssignmentSubmission, Student)
        .join(Student, AssignmentSubmission.student_id == Student.id)
        .filter(AssignmentSubmission.assignment_id == assignment_id)
        .order_by(Student.roll_number)
        .all()
    )

    return [
        {
            "id": s.id,
            "student_id": st.id,
            "student_name": st.full_name,
            "roll_number": st.roll_number,
            "status": s.status,
            "score": s.score,
            "max_score": s.max_score,
            "is_late": s.is_late,
            "is_graded": s.is_graded,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
        }
        for s, st in subs
    ]
