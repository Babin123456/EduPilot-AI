"""EduPilot AI — All MongoDB document helpers.

This module re-exports collection name constants and factory functions
from every model module for convenient imports.
"""

# Collection name constants
from app.models.academic import (
    ACADEMIC_SESSIONS,
    COURSES,
    SECTIONS,
    SEMESTERS,
    YEARS,
    new_academic_session,
    new_course,
    new_section,
    new_semester,
    new_year,
)
from app.models.ai_models import AI_CONVERSATIONS, AI_MESSAGES, new_ai_conversation, new_ai_message
from app.models.assessment import (
    ASSESSMENT_RESULTS,
    ASSESSMENTS,
    QUESTIONS,
    new_assessment,
    new_assessment_result,
    new_question,
)
from app.models.assignment import (
    ASSIGNMENT_SUBMISSIONS,
    ASSIGNMENTS,
    new_assignment,
    new_assignment_submission,
)
from app.models.attendance import (
    ATTENDANCE_RECORDS,
    ATTENDANCE_SESSIONS,
    new_attendance_record,
    new_attendance_session,
)
from app.models.communication import COMMUNICATIONS, new_communication
from app.models.daily_note import DAILY_NOTES, new_daily_note
from app.models.document import DOCUMENT_VERSIONS, DOCUMENTS, new_document, new_document_version
from app.models.enrollment import (
    ENROLLMENTS,
    TEACHER_COURSE_ASSIGNMENTS,
    new_enrollment,
    new_teacher_course_assignment,
)
from app.models.knowledge import (
    KNOWLEDGE_CHUNKS,
    KNOWLEDGE_DOCUMENTS,
    new_knowledge_chunk,
    new_knowledge_document,
)
from app.models.lesson import LESSON_PLANS, new_lesson_plan
from app.models.notification import NOTIFICATIONS, new_notification
from app.models.student import STUDENTS, new_student, student_full_name
from app.models.teacher import TEACHERS, new_teacher, teacher_full_name
from app.models.timetable import TIMETABLE_ENTRIES, new_timetable_entry

# Factory functions
from app.models.university import (
    DEPARTMENTS,
    PROGRAMS,
    SCHOOLS,
    UNIVERSITIES,
    new_department,
    new_program,
    new_school,
    new_university,
)
