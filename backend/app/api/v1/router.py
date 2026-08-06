"""API v1 Router — aggregates all route modules."""

from fastapi import APIRouter

from app.api.v1.routes import auth, teachers, classes, timetable, students, attendance, assignments, assessments, analytics, dashboard, ai, documents, communications, notifications

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(teachers.router, prefix="/teachers", tags=["Teachers"])
api_router.include_router(classes.router, prefix="/classes", tags=["Classes"])
api_router.include_router(timetable.router, prefix="/timetable", tags=["Timetable"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(assignments.router, prefix="/assignments", tags=["Assignments"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["Assessments"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(communications.router, prefix="/communications", tags=["Communications"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
