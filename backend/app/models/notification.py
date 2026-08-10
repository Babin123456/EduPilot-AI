"""Notification document helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


NOTIFICATIONS = "notifications"


def new_notification(*, teacher_id, title, message, notification_type="info",
                     link=None, is_read=False, related_entity_id=None,
                     related_entity_type=None, id=None):
    return {
        "id": id or _uid(),
        "teacher_id": teacher_id,
        "title": title,
        "message": message,
        "notification_type": notification_type,
        "link": link,
        "is_read": is_read,
        "related_entity_id": related_entity_id,
        "related_entity_type": related_entity_type,
        "created_at": _utcnow(),
    }
