"""AI conversation and message document helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


AI_CONVERSATIONS = "ai_conversations"
AI_MESSAGES = "ai_messages"


def new_ai_conversation(*, teacher_id, teacher_course_assignment_id=None,
                        title="New Conversation", context_summary=None,
                        message_count=0, is_active=True, id=None):
    return {
        "id": id or _uid(),
        "teacher_id": teacher_id,
        "teacher_course_assignment_id": teacher_course_assignment_id,
        "title": title,
        "context_summary": context_summary,
        "message_count": message_count,
        "is_active": is_active,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def new_ai_message(*, conversation_id, role, content, content_type="text",
                   metadata_json=None, model_used=None, tokens_used=None,
                   latency_ms=None, id=None):
    return {
        "id": id or _uid(),
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
        "content_type": content_type,
        "metadata_json": metadata_json,
        "model_used": model_used,
        "tokens_used": tokens_used,
        "latency_ms": latency_ms,
        "created_at": _utcnow(),
    }
