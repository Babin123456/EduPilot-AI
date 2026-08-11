"""Communications routes — email compose, send, and history."""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from pymongo.database import Database

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.core.exceptions import http_403, http_404
from app.models.student import student_full_name
from app.models.communication import new_communication

router = APIRouter()


class SendEmailRequest(BaseModel):
    class_id: str
    subject: str
    body: str
    recipient_type: str = "all"
    student_ids: list[str] | None = None
    template_type: str = "general"


@router.get("")
def list_communications(
    class_id: str | None = Query(None),
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """List communications sent by the teacher."""
    query_filter = {"teacher_id": teacher["id"]}
    if class_id:
        query_filter["teacher_course_assignment_id"] = class_id

    comms = list(
        db.communications.find(query_filter).sort("created_at", -1).limit(30)
    )

    result = []
    for c in comms:
        tca = db.teacher_course_assignments.find_one(
            {"id": c.get("teacher_course_assignment_id")}
        ) if c.get("teacher_course_assignment_id") else None
        course = db.courses.find_one({"id": tca["course_id"]}) if tca else None
        year = db.years.find_one({"id": tca["year_id"]}) if tca else None
        section = db.sections.find_one({"id": tca["section_id"]}) if tca else None

        sent_at = c.get("sent_at")
        created_at = c.get("created_at")
        result.append({
            "id": c["id"],
            "type": c.get("comm_type", "email"),
            "template_type": c.get("template_type"),
            "subject": c.get("subject"),
            "body": c.get("body"),
            "total_recipients": c.get("total_recipients", 0),
            "sent_count": c.get("sent_count", 0),
            "status": c.get("status", "draft"),
            "course_name": course["name"] if course else "",
            "course_code": course["code"] if course else "",
            "year_label": year["label"] if year else "",
            "section_name": section["name"] if section else "",
            "sent_at": sent_at.isoformat() if hasattr(sent_at, 'isoformat') else sent_at,
            "created_at": created_at.isoformat() if hasattr(created_at, 'isoformat') else created_at,
        })

    return result


@router.get("/student-emails")
def get_student_emails(
    class_id: str = Query(...),
    search: str | None = Query(None),
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get student emails for a specific class."""
    tca = db.teacher_course_assignments.find_one({
        "id": class_id, "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized for this class")

    query_filter = {"section_id": tca["section_id"], "is_active": True}
    if search:
        import re
        escaped = re.escape(search)
        query_filter["$or"] = [
            {"first_name": {"$regex": escaped, "$options": "i"}},
            {"last_name": {"$regex": escaped, "$options": "i"}},
            {"roll_number": {"$regex": escaped, "$options": "i"}},
            {"email": {"$regex": escaped, "$options": "i"}},
        ]

    students = list(db.students.find(query_filter).sort("roll_number", 1))

    year = db.years.find_one({"id": tca["year_id"]})
    section = db.sections.find_one({"id": tca["section_id"]})
    course = db.courses.find_one({"id": tca["course_id"]})

    return {
        "class_info": {
            "course_name": course["name"] if course else "",
            "course_code": course["code"] if course else "",
            "year_label": year["label"] if year else "",
            "section_name": section["name"] if section else "",
        },
        "students": [
            {
                "id": s["id"],
                "roll_number": s["roll_number"],
                "name": student_full_name(s),
                "full_name": student_full_name(s),
                "email": s["email"],
            }
            for s in students
        ],
        "total": len(students),
    }


@router.get("/templates")
def get_email_templates(
    teacher: dict = Depends(get_current_teacher),
):
    """Get pre-built email templates."""
    return [
        {
            "id": "attendance_warning",
            "name": "Attendance Warning",
            "subject": "⚠️ Attendance Warning — Action Required",
            "body": "Dear Student,\n\nThis is to inform you that your attendance in the course has fallen below the minimum required threshold of 75%.\n\nPlease ensure regular attendance to avoid academic penalties.\n\nRegards,\n{teacher_name}\n{designation}\nDepartment of Computer Science",
        },
        {
            "id": "assignment-reminder",
            "title": "Assignment Deadline Reminder",
            "category": "academic",
            "subject": "Reminder: Upcoming Assignment Submission Deadline",
            "body": "Dear Student,\n\nThis is a reminder that the upcoming assignment deadline is approaching. Please ensure timely submission to avoid late penalties.\n\nIf you have any questions, feel free to reach out during office hours.\n\nRegards,\n{teacher_name}\n{designation}\nDepartment of Computer Science",
        },
        {
            "id": "exam-notice",
            "title": "Assessment Schedule Announcement",
            "category": "exam",
            "subject": "Important Notice: Schedule Announcement for Course Assessment",
            "body": "Dear Student,\n\nThis is to notify you about an upcoming assessment. Please review the course material and prepare accordingly.\n\nDetails will be shared in class.\n\nRegards,\n{teacher_name}\n{designation}\nDepartment of Computer Science",
        },
        {
            "id": "general-announcement",
            "title": "General Class Announcement",
            "category": "general",
            "subject": "Important Announcement Regarding Class Operations",
            "body": "Dear Student,\n\n[Your message here]\n\nRegards,\n{teacher_name}\n{designation}\nDepartment of Computer Science",
        },
        {
            "id": "lecture-notes-sharing",
            "title": "Lecture Notes & Study Material Dispatch",
            "category": "academic",
            "subject": "Class Notes & Supplementary Reading Material Available",
            "body": "Dear Student,\n\nPlease find the discussion notes from today's lecture. Review the key concepts and practice questions for better understanding.\n\nRegards,\n{teacher_name}\n{designation}\nDepartment of Computer Science",
        },
    ]


@router.post("/send-email")
def send_email(
    body: SendEmailRequest,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Send email to students in a class (demo mode)."""
    tca = db.teacher_course_assignments.find_one({
        "id": body.class_id, "teacher_id": teacher["id"],
    })
    if not tca:
        raise http_403("Not authorized for this class")

    if body.recipient_type == "selected" and body.student_ids:
        students = list(db.students.find({
            "id": {"$in": body.student_ids},
            "section_id": tca["section_id"],
            "is_active": True,
        }))
    else:
        students = list(
            db.students.find({"section_id": tca["section_id"], "is_active": True})
            .sort("roll_number", 1)
        )

    if not students:
        return {"success": False, "message": "No students found for this class"}

    personalized_body = body.body.replace(
        "{teacher_name}", f"{teacher['first_name']} {teacher['last_name']}"
    ).replace(
        "{designation}", teacher.get("designation", "Faculty")
    )

    recipients = [
        {"student_id": s["id"], "email": s["email"], "name": student_full_name(s), "status": "sent"}
        for s in students
    ]

    comm = new_communication(
        teacher_id=teacher["id"],
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
    db.communications.insert_one(comm)

    return {
        "success": True,
        "message": f"Email sent successfully to {len(students)} students",
        "communication_id": comm["id"],
        "total_recipients": len(students),
        "student_emails": [s["email"] for s in students],
    }
