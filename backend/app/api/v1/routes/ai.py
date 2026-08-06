"""AI routes — EduPilot AI chat and generation endpoints."""

from __future__ import annotations
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.models.teacher import Teacher
from app.models.ai_models import AIConversation, AIMessage

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None
    class_id: str | None = None


class GenerateRequest(BaseModel):
    class_id: str
    topic: str
    additional_instructions: str | None = None
    difficulty: str = "medium"


@router.post("/chat")
def chat(
    body: ChatRequest,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Send a message to EduPilot AI."""
    # Create or get conversation
    if body.conversation_id:
        conversation = db.query(AIConversation).filter(
            AIConversation.id == body.conversation_id,
            AIConversation.teacher_id == teacher.id,
        ).first()
        if not conversation:
            conversation = None

    if not body.conversation_id or not conversation:
        conversation = AIConversation(
            id=str(uuid.uuid4()),
            teacher_id=teacher.id,
            teacher_course_assignment_id=body.class_id,
            title=body.message[:100],
        )
        db.add(conversation)
        db.flush()

    # Save user message
    user_msg = AIMessage(
        id=str(uuid.uuid4()),
        conversation_id=conversation.id,
        role="user",
        content=body.message,
    )
    db.add(user_msg)

    # AI response (placeholder — will be replaced with actual LLM call)
    ai_response = _generate_ai_response(body.message, teacher, db, body.class_id)

    assistant_msg = AIMessage(
        id=str(uuid.uuid4()),
        conversation_id=conversation.id,
        role="assistant",
        content=ai_response,
        model_used="placeholder",
    )
    db.add(assistant_msg)

    conversation.message_count += 2
    db.commit()

    return {
        "conversation_id": conversation.id,
        "message": {
            "id": assistant_msg.id,
            "role": "assistant",
            "content": ai_response,
            "created_at": assistant_msg.created_at.isoformat() if assistant_msg.created_at else None,
        },
    }


@router.get("/conversations")
def list_conversations(
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """List teacher's AI conversations."""
    convos = (
        db.query(AIConversation)
        .filter(AIConversation.teacher_id == teacher.id)
        .order_by(AIConversation.updated_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": c.id,
            "title": c.title,
            "message_count": c.message_count,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        }
        for c in convos
    ]


@router.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: str,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Get full conversation with messages."""
    from app.core.exceptions import http_404, http_403
    convo = db.query(AIConversation).filter(AIConversation.id == conversation_id).first()
    if not convo:
        raise http_404("Conversation not found")
    if convo.teacher_id != teacher.id:
        raise http_403("Not authorized")

    messages = (
        db.query(AIMessage)
        .filter(AIMessage.conversation_id == conversation_id)
        .order_by(AIMessage.created_at)
        .all()
    )

    return {
        "id": convo.id,
        "title": convo.title,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "content_type": m.content_type,
                "model_used": m.model_used,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ],
    }


def _generate_ai_response(message: str, teacher: Teacher, db: Session, class_id: str | None) -> str:
    """Generate AI response — placeholder for LLM integration."""
    msg_lower = message.lower()

    if any(kw in msg_lower for kw in ["hello", "hi", "hey"]):
        return f"Hello, {teacher.first_name}! I'm EduPilot AI, your academic assistant. I can help you with attendance queries, lesson planning, quiz generation, student analytics, and more. How can I assist you today?"

    if "attendance" in msg_lower and "below" in msg_lower:
        from app.models.student import Student
        from app.models.enrollment import TeacherCourseAssignment
        students = []
        if class_id:
            tca = db.query(TeacherCourseAssignment).filter(
                TeacherCourseAssignment.id == class_id
            ).first()
            if tca:
                students = (
                    db.query(Student)
                    .filter(
                        Student.section_id == tca.section_id,
                        Student.attendance_percentage < 75,
                        Student.is_active == True,
                    )
                    .order_by(Student.attendance_percentage)
                    .all()
                )
        if students:
            lines = [f"**Students with attendance below 75%:**\n"]
            for i, s in enumerate(students, 1):
                lines.append(f"{i}. **{s.full_name}** (Roll: {s.roll_number}) — {s.attendance_percentage}%")
            lines.append(f"\nTotal: {len(students)} students need attention.")
            return "\n".join(lines)
        return "No students with attendance below 75% in the selected class."

    if any(kw in msg_lower for kw in ["next class", "schedule", "timetable"]):
        return f"Let me check your schedule. You can view your complete timetable in the **Timetable** section. Use the sidebar navigation to access it."

    return (
        f"Thank you for your question, {teacher.first_name}. "
        f"I'm currently being enhanced with Groq and Gemini AI capabilities. "
        f"Soon I'll be able to answer detailed questions about your students, attendance, "
        f"assignments, and generate lesson plans, quizzes, and presentations. "
        f"For now, please use the sidebar navigation to access the relevant module."
    )
