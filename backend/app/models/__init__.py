"""EduPilot AI — All MongoDB document helpers.

This module re-exports collection name constants and factory functions
from every model module for convenient imports.
"""

# Collection name constants
from app.models.university import UNIVERSITIES, SCHOOLS, DEPARTMENTS, PROGRAMS
from app.models.academic import ACADEMIC_SESSIONS, YEARS, SEMESTERS, SECTIONS, COURSES
from app.models.teacher import TEACHERS
from app.models.student import STUDENTS
from app.models.enrollment import ENROLLMENTS, TEACHER_COURSE_ASSIGNMENTS
from app.models.timetable import TIMETABLE_ENTRIES
from app.models.attendance import ATTENDANCE_SESSIONS, ATTENDANCE_RECORDS
from app.models.assignment import ASSIGNMENTS, ASSIGNMENT_SUBMISSIONS
from app.models.assessment import ASSESSMENTS, QUESTIONS, ASSESSMENT_RESULTS
from app.models.lesson import LESSON_PLANS
from app.models.document import DOCUMENTS, DOCUMENT_VERSIONS
from app.models.communication import COMMUNICATIONS
from app.models.ai_models import AI_CONVERSATIONS, AI_MESSAGES
from app.models.knowledge import KNOWLEDGE_DOCUMENTS, KNOWLEDGE_CHUNKS
from app.models.notification import NOTIFICATIONS
from app.models.daily_note import DAILY_NOTES

# Factory functions
from app.models.university import new_university, new_school, new_department, new_program
from app.models.academic import (
    new_academic_session, new_year, new_semester, new_section, new_course,
)
from app.models.teacher import new_teacher, teacher_full_name
from app.models.student import new_student, student_full_name
from app.models.enrollment import new_enrollment, new_teacher_course_assignment
from app.models.timetable import new_timetable_entry
from app.models.attendance import new_attendance_session, new_attendance_record
from app.models.assignment import new_assignment, new_assignment_submission
from app.models.assessment import new_assessment, new_question, new_assessment_result
from app.models.lesson import new_lesson_plan
from app.models.document import new_document, new_document_version
from app.models.communication import new_communication
from app.models.ai_models import new_ai_conversation, new_ai_message
from app.models.knowledge import new_knowledge_document, new_knowledge_chunk
from app.models.notification import new_notification
from app.models.daily_note import new_daily_note
