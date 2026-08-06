"""Communications routes — email compose, send, and history."""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.core.exceptions import http_403, http_404
from app.models.teacher import Teacher
from app.models.student import Student
from app.models.enrollment import TeacherCourseAssignment
from app.models.academic import Year, Section, Course
from app.models.communication import Communication

router = APIRouter()


class SendEmailRequest(BaseModel):
    class_id: str
    subject: str
    body: str
    recipient_type: str = "all"  # "all" or "selected"
    student_ids: list[str] | None = None
    template_type: str = "general"  # general, attendance_warning, assignment_reminder, daily_notes, report


@router.get("")
def list_communications(
    class_id: str | None = Query(None),
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """List communications sent by the teacher."""
    query = db.query(Communication).filter(Communication.teacher_id == teacher.id)

    if class_id:
        query = query.filter(Communication.teacher_course_assignment_id == class_id)

    comms = (
        query
        .order_by(Communication.created_at.desc())
        .limit(30)
        .all()
    )

    result = []
    for c in comms:
        tca = db.query(TeacherCourseAssignment).filter(
            TeacherCourseAssignment.id == c.teacher_course_assignment_id
        ).first() if c.teacher_course_assignment_id else None
        course = db.query(Course).filter(Course.id == tca.course_id).first() if tca else None
        year = db.query(Year).filter(Year.id == tca.year_id).first() if tca else None
        section = db.query(Section).filter(Section.id == tca.section_id).first() if tca else None

        result.append({
            "id": c.id,
            "type": c.comm_type,
            "template_type": c.template_type,
            "subject": c.subject,
            "body": c.body,
            "total_recipients": c.total_recipients,
            "sent_count": c.sent_count,
            "status": c.status,
            "course_name": course.name if course else "",
            "course_code": course.code if course else "",
            "year_label": year.label if year else "",
            "section_name": section.name if section else "",
            "sent_at": c.sent_at.isoformat() if c.sent_at else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })

    return result


@router.get("/student-emails")
def get_student_emails(
    class_id: str = Query(...),
    search: str | None = Query(None),
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Get student emails for a specific class."""
    tca = db.query(TeacherCourseAssignment).filter(
        TeacherCourseAssignment.id == class_id,
        TeacherCourseAssignment.teacher_id == teacher.id,
    ).first()
    if not tca:
        raise http_403("Not authorized for this class")

    query = db.query(Student).filter(
        Student.section_id == tca.section_id,
        Student.is_active == True,
    )

    if search:
        from sqlalchemy import or_
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Student.first_name.ilike(search_term),
                Student.last_name.ilike(search_term),
                Student.roll_number.ilike(search_term),
                Student.email.ilike(search_term),
            )
        )

    students = query.order_by(Student.roll_number).all()

    year = db.query(Year).filter(Year.id == tca.year_id).first()
    section = db.query(Section).filter(Section.id == tca.section_id).first()
    course = db.query(Course).filter(Course.id == tca.course_id).first()

    return {
        "class_info": {
            "course_name": course.name if course else "",
            "course_code": course.code if course else "",
            "year_label": year.label if year else "",
            "section_name": section.name if section else "",
        },
        "students": [
            {
                "id": s.id,
                "roll_number": s.roll_number,
                "name": s.full_name,
                "full_name": s.full_name,
                "email": s.email,
            }
            for s in students
        ],
        "total": len(students),
    }


@router.get("/templates")
def get_email_templates(
    teacher: Teacher = Depends(get_current_teacher),
):
    """Get pre-built email templates."""
    return [
        {
            "id": "attendance_warning",
            "name": "Attendance Warning",
            "subject": "⚠️ Attendance Warning — Action Required",
            "body": "Dear Student,\n\nThis is to inform you that your attendance in the course has fallen below the minimum required threshold of 75%.\n\nPlease ensure regular attendance to avoid academic penalties.\n\nRegards,\n{teacher_name}\n{designation}\nAdamas University",
        },
        {
            "id": "assignment_reminder",
            "name": "Assignment Reminder",
            "subject": "📝 Assignment Submission Reminder",
            "body": "Dear Student,\n\nThis is a reminder that the upcoming assignment deadline is approaching. Please ensure timely submission to avoid late penalties.\n\nIf you have any questions, feel free to reach out during office hours.\n\nRegards,\n{teacher_name}\n{designation}\nAdamas University",
        },
        {
            "id": "assessment_announcement",
            "name": "Assessment Announcement",
            "subject": "📋 Upcoming Assessment Notification",
            "body": "Dear Student,\n\nThis is to notify you about an upcoming assessment. Please review the course material and prepare accordingly.\n\nDetails will be shared in class.\n\nRegards,\n{teacher_name}\n{designation}\nAdamas University",
        },
        {
            "id": "general",
            "name": "General Announcement",
            "subject": "📢 Important Announcement",
            "body": "Dear Student,\n\n[Your message here]\n\nRegards,\n{teacher_name}\n{designation}\nAdamas University",
        },
        {
            "id": "daily_notes",
            "name": "Daily Notes Share",
            "subject": "📚 Today's Discussion Notes",
            "body": "Dear Student,\n\nPlease find the discussion notes from today's lecture. Review the key concepts and practice questions for better understanding.\n\nRegards,\n{teacher_name}\n{designation}\nAdamas University",
        },
    ]


@router.post("/send-email")
def send_email(
    body: SendEmailRequest,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Send email to students in a class (demo mode — logs without actual SMTP)."""
    tca = db.query(TeacherCourseAssignment).filter(
        TeacherCourseAssignment.id == body.class_id,
        TeacherCourseAssignment.teacher_id == teacher.id,
    ).first()
    if not tca:
        raise http_403("Not authorized for this class")

    # Get recipients
    if body.recipient_type == "selected" and body.student_ids:
        students = (
            db.query(Student)
            .filter(
                Student.id.in_(body.student_ids),
                Student.section_id == tca.section_id,
                Student.is_active == True,
            )
            .all()
        )
    else:
        students = (
            db.query(Student)
            .filter(Student.section_id == tca.section_id, Student.is_active == True)
            .order_by(Student.roll_number)
            .all()
        )

    if not students:
        return {"success": False, "message": "No students found for this class"}

    # Personalize body
    personalized_body = body.body.replace(
        "{teacher_name}", f"{teacher.first_name} {teacher.last_name}"
    ).replace(
        "{designation}", teacher.designation or "Faculty"
    )

    recipients = [
        {"student_id": s.id, "email": s.email, "name": s.full_name, "status": "sent"}
        for s in students
    ]

    comm = Communication(
        id=str(uuid.uuid4()),
        teacher_id=teacher.id,
        teacher_course_assignment_id=body.class_id,
        comm_type="email",
        template_type=body.template_type,
        subject=body.subject,
        body=personalized_body,
        recipients=json.dumps(recipients),
        total_recipients=len(students),
        sent_count=len(students),
        status="sent",
        sent_at=datetime.now(timezone.utc),
    )
    db.add(comm)
    db.commit()

    return {
        "success": True,
        "message": f"Email sent successfully to {len(students)} students",
        "communication_id": comm.id,
        "total_recipients": len(students),
        "student_emails": [s.email for s in students],
    }
