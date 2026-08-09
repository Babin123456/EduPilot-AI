"""Authentication routes — login, logout, me, demo accounts."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.core.exceptions import http_401
from app.api.deps import get_current_teacher
from app.models.teacher import Teacher
from app.models.enrollment import TeacherCourseAssignment
from app.models.academic import Course, Section, Year, Semester

router = APIRouter()


# ── Schemas ──

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TeacherProfileUpdate(BaseModel):
    phone: str | None = None
    specialization: str | None = None
    avatar_url: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    teacher: dict


class TeacherProfile(BaseModel):
    id: str
    faculty_id: str
    first_name: str
    last_name: str
    full_name: str
    email: str
    phone: str | None
    designation: str
    specialization: str | None
    department: str
    is_demo: bool
    avatar_url: str | None


class DemoTeacherCard(BaseModel):
    faculty_id: str
    name: str
    email: str
    password: str
    designation: str
    specialization: str | None


# ── Routes ──

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a teacher and return JWT tokens."""
    from sqlalchemy import func
    clean_email = str(body.email).strip().lower()
    teacher = db.query(Teacher).filter(func.lower(Teacher.email) == clean_email).first()
    if not teacher or not verify_password(body.password, teacher.hashed_password):
        raise http_401("Invalid email or password")
    if not teacher.is_active:
        raise http_401("Account is inactive")

    access_token = create_access_token({"sub": teacher.id, "email": teacher.email})
    refresh_token = create_refresh_token({"sub": teacher.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        teacher={
            "id": teacher.id,
            "faculty_id": teacher.faculty_id,
            "first_name": teacher.first_name,
            "last_name": teacher.last_name,
            "full_name": teacher.full_name,
            "email": teacher.email,
            "designation": teacher.designation,
            "specialization": teacher.specialization,
            "is_demo": teacher.is_demo,
        },
    )


@router.post("/logout")
def logout(teacher: Teacher = Depends(get_current_teacher)):
    """Logout — client discards tokens."""
    return {"message": "Logged out successfully"}


@router.get("/me")
def get_me(teacher: Teacher = Depends(get_current_teacher), db: Session = Depends(get_db)):
    """Get current teacher profile with class assignments."""
    from app.models.university import Department
    dept = db.query(Department).filter(Department.id == teacher.department_id).first()

    # Get class assignments
    assignments = (
        db.query(TeacherCourseAssignment, Course, Section, Year, Semester)
        .join(Course, TeacherCourseAssignment.course_id == Course.id)
        .join(Section, TeacherCourseAssignment.section_id == Section.id)
        .join(Year, TeacherCourseAssignment.year_id == Year.id)
        .join(Semester, TeacherCourseAssignment.semester_id == Semester.id)
        .filter(TeacherCourseAssignment.teacher_id == teacher.id, TeacherCourseAssignment.is_active == True)
        .all()
    )

    classes = []
    for tca, course, section, year, semester in assignments:
        classes.append({
            "id": tca.id,
            "course_id": course.id,
            "course_code": course.code,
            "course_name": course.name,
            "section_id": section.id,
            "section_name": section.name,
            "year_id": year.id,
            "year_label": year.label,
            "year_number": year.year_number,
            "semester_id": semester.id,
            "semester_label": semester.label,
            "room": tca.room,
        })

    return {
        "id": teacher.id,
        "faculty_id": teacher.faculty_id,
        "first_name": teacher.first_name,
        "last_name": teacher.last_name,
        "full_name": teacher.full_name,
        "email": teacher.email,
        "phone": teacher.phone,
        "designation": teacher.designation,
        "specialization": teacher.specialization,
        "department": dept.name if dept else "CSE",
        "department_short": dept.short_name if dept else "CSE",
        "is_demo": teacher.is_demo,
        "avatar_url": teacher.avatar_url,
        "classes": classes,
    }


@router.patch("/me")
def update_me(
    profile: TeacherProfileUpdate,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Update editable teacher profile preferences."""
    for field, value in profile.model_dump(exclude_unset=True).items():
        setattr(teacher, field, value)
    db.commit()
    return {"avatar_url": teacher.avatar_url, "phone": teacher.phone, "specialization": teacher.specialization}


@router.get("/demo-accounts", response_model=list[DemoTeacherCard])
def get_demo_accounts(db: Session = Depends(get_db)):
    """Return demo teacher accounts for the login page."""
    teachers = db.query(Teacher).filter(Teacher.is_demo == True, Teacher.is_active == True).all()
    return [
        DemoTeacherCard(
            faculty_id=t.faculty_id,
            name=t.full_name,
            email=t.email,
            password="demo@1234",  # Demo password shown on login page
            designation=t.designation,
            specialization=t.specialization,
        )
        for t in teachers
    ]
