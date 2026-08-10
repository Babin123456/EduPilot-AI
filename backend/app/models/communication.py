"""Communication log document helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


COMMUNICATIONS = "communications"


def new_communication(*, teacher_id, comm_type, teacher_course_assignment_id=None,
                      template_type=None, subject=None, body=None,
                      recipients=None, total_recipients=0, sent_count=0, failed_count=0,
                      status="draft", attachment_url=None, related_document_id=None,
                      sent_at=None, id=None):
    return {
        "id": id or _uid(),
        "teacher_id": teacher_id,
        "teacher_course_assignment_id": teacher_course_assignment_id,
        "comm_type": comm_type,
        "template_type": template_type,
        "subject": subject,
        "body": body,
        "recipients": recipients,
        "total_recipients": total_recipients,
        "sent_count": sent_count,
        "failed_count": failed_count,
        "status": status,
        "attachment_url": attachment_url,
        "related_document_id": related_document_id,
        "sent_at": sent_at,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }
