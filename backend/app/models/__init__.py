"""EduPilot AI — All database models.

This module imports and exposes every SQLAlchemy model so that
`Base.metadata.create_all()` picks up all tables automatically.
"""

from app.core.database import Base

from app.models.university import University, School, Department, Program
from app.models.academic import AcademicSession, Year, Semester, Section, Course
from app.models.teacher import Teacher
from app.models.student import Student
from app.models.enrollment import Enrollment, TeacherCourseAssignment
from app.models.timetable import TimetableEntry
from app.models.attendance import AttendanceSession, AttendanceRecord
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.assessment import Assessment, Question, AssessmentResult
from app.models.lesson import LessonPlan
from app.models.document import Document, DocumentVersion
from app.models.communication import Communication
from app.models.ai_models import AIConversation, AIMessage
from app.models.knowledge import KnowledgeDocument, KnowledgeChunk
from app.models.notification import Notification

__all__ = [
    "Base",
    "University", "School", "Department", "Program",
    "AcademicSession", "Year", "Semester", "Section", "Course",
    "Teacher",
    "Student",
    "Enrollment", "TeacherCourseAssignment",
    "TimetableEntry",
    "AttendanceSession", "AttendanceRecord",
    "Assignment", "AssignmentSubmission",
    "Assessment", "Question", "AssessmentResult",
    "LessonPlan",
    "Document", "DocumentVersion",
    "Communication",
    "AIConversation", "AIMessage",
    "KnowledgeDocument", "KnowledgeChunk",
    "Notification",
]
