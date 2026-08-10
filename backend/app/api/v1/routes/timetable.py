"""Timetable routes."""

from __future__ import annotations
from datetime import date

from fastapi import APIRouter, Depends
from pymongo.database import Database

from app.core.database import get_db
from app.api.deps import get_current_teacher

router = APIRouter()

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


@router.get("/today")
def get_today_timetable(
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get today's timetable for the teacher."""
    today_dow = date.today().weekday()
    return _get_timetable_for_day(db, teacher, today_dow)


@router.get("/week")
def get_week_timetable(
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get full week timetable."""
    week = {}
    for day in range(0, 6):  # Mon-Sat
        entries = _get_timetable_for_day(db, teacher, day)
        week[DAY_NAMES[day]] = entries
    return week


def _get_timetable_for_day(db: Database, teacher: dict, day_of_week: int) -> list[dict]:
    # Get all TCA ids for this teacher
    tcas = {
        tca["id"]: tca
        for tca in db.teacher_course_assignments.find({"teacher_id": teacher["id"]})
    }
    tca_ids = list(tcas.keys())

    entries = list(db.timetable_entries.find({
        "teacher_course_assignment_id": {"$in": tca_ids},
        "day_of_week": day_of_week,
    }).sort("start_time", 1))

    today = date.today()
    result = []
    for entry in entries:
        tca = tcas[entry["teacher_course_assignment_id"]]
        course = db.courses.find_one({"id": tca["course_id"]})
        section = db.sections.find_one({"id": tca["section_id"]})
        year = db.years.find_one({"id": tca["year_id"]})

        att_taken = False
        if day_of_week == today.weekday():
            att_session = db.attendance_sessions.find_one({
                "teacher_course_assignment_id": tca["id"],
                "date": today.isoformat(),
                "is_submitted": True,
            })
            att_taken = att_session is not None

        result.append({
            "id": entry["id"],
            "class_id": tca["id"],
            "course_code": course["code"] if course else "",
            "course_name": course["name"] if course else "",
            "course_type": course["course_type"] if course else "theory",
            "section_name": section["name"] if section else "",
            "year_label": year["label"] if year else "",
            "year_number": year["year_number"] if year else 0,
            "start_time": entry["start_time"],
            "end_time": entry["end_time"],
            "room": entry.get("room") or tca.get("room"),
            "slot_type": entry.get("slot_type", "lecture"),
            "day": DAY_NAMES[day_of_week],
            "attendance_taken": att_taken,
        })

    return result
