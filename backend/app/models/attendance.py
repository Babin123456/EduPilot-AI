"""Attendance session and record document helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


ATTENDANCE_SESSIONS = "attendance_sessions"
ATTENDANCE_RECORDS = "attendance_records"


def new_attendance_session(*, teacher_course_assignment_id, teacher_id, date,
                           start_time=None, end_time=None,
                           total_present=0, total_absent=0, total_late=0, total_excused=0,
                           is_submitted=False, id=None):
    return {
        "id": id or _uid(),
        "teacher_course_assignment_id": teacher_course_assignment_id,
        "teacher_id": teacher_id,
        "date": date,
        "start_time": start_time,
        "end_time": end_time,
        "total_present": total_present,
        "total_absent": total_absent,
        "total_late": total_late,
        "total_excused": total_excused,
        "is_submitted": is_submitted,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def new_attendance_record(*, session_id, student_id, status, remarks=None, id=None):
    return {
        "id": id or _uid(),
        "session_id": session_id,
        "student_id": student_id,
        "status": status,
        "remarks": remarks,
        "created_at": _utcnow(),
    }
