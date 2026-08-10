"""Timetable entry document helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


TIMETABLE_ENTRIES = "timetable_entries"


def new_timetable_entry(*, teacher_course_assignment_id, day_of_week,
                        start_time, end_time, room=None, slot_type="lecture", id=None):
    return {
        "id": id or _uid(),
        "teacher_course_assignment_id": teacher_course_assignment_id,
        "day_of_week": day_of_week,
        "start_time": start_time,
        "end_time": end_time,
        "room": room,
        "slot_type": slot_type,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }
