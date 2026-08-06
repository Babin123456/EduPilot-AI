"""Timetable routes."""

from __future__ import annotations
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.models.teacher import Teacher
from app.models.enrollment import TeacherCourseAssignment
from app.models.timetable import TimetableEntry
from app.models.academic import Course, Section, Year
from app.models.attendance import AttendanceSession

router = APIRouter()

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


@router.get("/today")
def get_today_timetable(
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Get today's timetable for the teacher."""
    today_dow = date.today().weekday()
    return _get_timetable_for_day(db, teacher, today_dow)


@router.get("/week")
def get_week_timetable(
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Get full week timetable."""
    week = {}
    for day in range(0, 6):  # Mon-Sat
        entries = _get_timetable_for_day(db, teacher, day)
        week[DAY_NAMES[day]] = entries
    return week


def _get_timetable_for_day(db: Session, teacher: Teacher, day_of_week: int) -> list[dict]:
    rows = (
        db.query(TimetableEntry, TeacherCourseAssignment, Course, Section, Year)
        .join(TeacherCourseAssignment, TimetableEntry.teacher_course_assignment_id == TeacherCourseAssignment.id)
        .join(Course, TeacherCourseAssignment.course_id == Course.id)
        .join(Section, TeacherCourseAssignment.section_id == Section.id)
        .join(Year, TeacherCourseAssignment.year_id == Year.id)
        .filter(
            TeacherCourseAssignment.teacher_id == teacher.id,
            TimetableEntry.day_of_week == day_of_week,
        )
        .order_by(TimetableEntry.start_time)
        .all()
    )

    # Check attendance status for today
    today = date.today()

    result = []
    for entry, tca, course, section, year in rows:
        att_taken = False
        if day_of_week == today.weekday():
            att_session = (
                db.query(AttendanceSession)
                .filter(
                    AttendanceSession.teacher_course_assignment_id == tca.id,
                    AttendanceSession.date == today,
                    AttendanceSession.is_submitted == True,
                )
                .first()
            )
            att_taken = att_session is not None

        result.append({
            "id": entry.id,
            "class_id": tca.id,
            "course_code": course.code,
            "course_name": course.name,
            "course_type": course.course_type,
            "section_name": section.name,
            "year_label": year.label,
            "year_number": year.year_number,
            "start_time": entry.start_time,
            "end_time": entry.end_time,
            "room": entry.room or tca.room,
            "slot_type": entry.slot_type,
            "day": DAY_NAMES[day_of_week],
            "attendance_taken": att_taken,
        })

    return result
