"""Authentication routes — login, logout, me, demo accounts."""

from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, EmailStr
from pymongo.database import Database

from app.api.deps import get_current_teacher
from app.core.config import get_settings
from app.core.database import get_db
from app.core.exceptions import http_401
from app.core.security import create_access_token, create_refresh_token, verify_password
from app.models.teacher import teacher_full_name

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
def login(body: LoginRequest, db: Database = Depends(get_db)):
    """Authenticate a teacher and return JWT tokens."""
    clean_email = str(body.email).strip().lower()
    teacher = None

    try:
        teacher = db.teachers.find_one({"email": clean_email})
        if not teacher:
            teacher = db.teachers.find_one({"email": {"$regex": f"^{clean_email}$", "$options": "i"}})
    except Exception as exc:
        print(f"[Auth Warning] MongoDB offline during login: {exc}")

    # Offline Fallback for Demo Faculty login if MongoDB is not running locally
    if not teacher and body.password == "demo@1234":
        demo_map = {
            "rajesh.banerjee@edupilot.ai": {"id": "demo-001", "faculty_id": "FAC-UNIV-001", "first_name": "Rajesh", "last_name": "Banerjee", "designation": "Associate Professor", "specialization": "Algorithms & Data Structures"},
            "priya.nair@edupilot.ai": {"id": "demo-002", "faculty_id": "FAC-UNIV-002", "first_name": "Priya", "last_name": "Nair", "designation": "Assistant Professor", "specialization": "Database Systems & Mining"},
            "amitava.chatterjee@edupilot.ai": {"id": "demo-003", "faculty_id": "FAC-UNIV-003", "first_name": "Amitava", "last_name": "Chatterjee", "designation": "Professor", "specialization": "AI & Machine Learning"},
            "sunita.devi@edupilot.ai": {"id": "demo-004", "faculty_id": "FAC-UNIV-004", "first_name": "Sunita", "last_name": "Devi", "designation": "Assistant Professor", "specialization": "Networks & Security"},
            "debashis.ghosh@edupilot.ai": {"id": "demo-005", "faculty_id": "FAC-UNIV-005", "first_name": "Debashis", "last_name": "Ghosh", "designation": "Associate Professor", "specialization": "OS & Cloud Computing"},
        }
        if clean_email in demo_map:
            d = demo_map[clean_email]
            teacher = {
                "id": d["id"],
                "faculty_id": d["faculty_id"],
                "first_name": d["first_name"],
                "last_name": d["last_name"],
                "email": clean_email,
                "designation": d["designation"],
                "specialization": d["specialization"],
                "is_demo": True,
                "is_active": True,
                "hashed_password": "",
            }

    if not teacher:
        raise http_401("Invalid email or password")

    if teacher.get("hashed_password") and not verify_password(body.password, teacher["hashed_password"]):
        raise http_401("Invalid email or password")

    if not teacher.get("is_active", True):
        raise http_401("Account is inactive")

    full_name = f"{teacher['first_name']} {teacher['last_name']}".strip()
    access_token = create_access_token({"sub": teacher["id"], "email": teacher["email"]})
    refresh_token = create_refresh_token({"sub": teacher["id"]})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        teacher={
            "id": teacher["id"],
            "faculty_id": teacher["faculty_id"],
            "first_name": teacher["first_name"],
            "last_name": teacher["last_name"],
            "full_name": full_name,
            "email": teacher["email"],
            "designation": teacher["designation"],
            "specialization": teacher.get("specialization"),
            "is_demo": teacher.get("is_demo", False),
        },
    )


@router.post("/logout")
def logout(teacher: dict = Depends(get_current_teacher)):
    """Logout — client discards tokens."""
    return {"message": "Logged out successfully"}


@router.get("/me")
def get_me(teacher: dict = Depends(get_current_teacher), db: Database = Depends(get_db)):
    """Get current teacher profile with class assignments."""
    dept = db.departments.find_one({"id": teacher["department_id"]})

    # Get class assignments
    tcas = list(db.teacher_course_assignments.find({
        "teacher_id": teacher["id"], "is_active": True,
    }))

    classes = []
    for tca in tcas:
        course = db.courses.find_one({"id": tca["course_id"]})
        section = db.sections.find_one({"id": tca["section_id"]})
        year = db.years.find_one({"id": tca["year_id"]})
        semester = db.semesters.find_one({"id": tca["semester_id"]})
        if course and section and year and semester:
            classes.append({
                "id": tca["id"],
                "course_id": course["id"],
                "course_code": course["code"],
                "course_name": course["name"],
                "section_id": section["id"],
                "section_name": section["name"],
                "year_id": year["id"],
                "year_label": year["label"],
                "year_number": year["year_number"],
                "semester_id": semester["id"],
                "semester_label": semester["label"],
                "room": tca.get("room"),
            })

    # Verify avatar file exists on disk if stored locally
    avatar_url = teacher.get("avatar_url")
    if avatar_url and "/media/" in avatar_url:
        settings = get_settings()
        fname = avatar_url.split("/media/")[-1]
        local_file = Path(settings.storage_local_path).resolve() / fname
        if not local_file.exists():
            avatar_url = None

    return {
        "id": teacher["id"],
        "faculty_id": teacher["faculty_id"],
        "first_name": teacher["first_name"],
        "last_name": teacher["last_name"],
        "full_name": teacher["full_name"],
        "email": teacher["email"],
        "phone": teacher.get("phone"),
        "designation": teacher["designation"],
        "specialization": teacher.get("specialization"),
        "department": dept["name"] if dept else "CSE",
        "department_short": dept.get("short_name", "CSE") if dept else "CSE",
        "is_demo": teacher.get("is_demo", False),
        "avatar_url": avatar_url,
        "classes": classes,
    }


@router.patch("/me")
def update_me(
    profile: TeacherProfileUpdate,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Update editable teacher profile preferences."""
    updates = profile.model_dump(exclude_unset=True)
    if updates:
        db.teachers.update_one({"id": teacher["id"]}, {"$set": updates})
        teacher.update(updates)
    return {
        "avatar_url": teacher.get("avatar_url"),
        "phone": teacher.get("phone"),
        "specialization": teacher.get("specialization"),
    }


@router.post("/me/avatar")
async def upload_avatar(
    image: UploadFile = File(...),
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Store a teacher-uploaded profile image and make it immediately available."""
    allowed_types = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
    if image.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Upload a JPG, PNG, or WebP image.")
    content = await image.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be smaller than 5 MB.")

    settings = get_settings()
    filename = f"teacher-{teacher['id']}-{uuid.uuid4().hex}{allowed_types[image.content_type]}"
    storage_path = Path(settings.storage_local_path).resolve()
    storage_path.mkdir(parents=True, exist_ok=True)
    (storage_path / filename).write_bytes(content)
    avatar_url = f"{settings.backend_url}/media/{filename}"
    db.teachers.update_one({"id": teacher["id"]}, {"$set": {"avatar_url": avatar_url}})
    return {"avatar_url": avatar_url}


@router.get("/demo-accounts", response_model=list[DemoTeacherCard])
def get_demo_accounts(db: Database = Depends(get_db)):
    """Return demo teacher accounts for the login page."""
    try:
        teachers = list(db.teachers.find({"is_demo": True, "is_active": True}))
        if teachers:
            return [
                DemoTeacherCard(
                    faculty_id=t["faculty_id"],
                    name=teacher_full_name(t),
                    email=t["email"],
                    password="demo@1234",
                    designation=t["designation"],
                    specialization=t.get("specialization"),
                )
                for t in teachers
            ]
    except Exception as exc:
        print(f"[Auth Warning] MongoDB connection error in /demo-accounts: {exc}")

    # Fallback default demo accounts when MongoDB is offline
    return [
        DemoTeacherCard(faculty_id="FAC-UNIV-004", name="Prof. Sunita Devi", email="sunita.devi@edupilot.ai", password="demo@1234", designation="Assistant Professor", specialization="Networks & Security"),
        DemoTeacherCard(faculty_id="FAC-UNIV-001", name="Prof. Rajesh Banerjee", email="rajesh.banerjee@edupilot.ai", password="demo@1234", designation="Associate Professor", specialization="Algorithms & Data Structures"),
        DemoTeacherCard(faculty_id="FAC-UNIV-002", name="Prof. Priya Nair", email="priya.nair@edupilot.ai", password="demo@1234", designation="Assistant Professor", specialization="Database Systems & Mining"),
        DemoTeacherCard(faculty_id="FAC-UNIV-003", name="Prof. Amitava Chatterjee", email="amitava.chatterjee@edupilot.ai", password="demo@1234", designation="Professor", specialization="AI & Machine Learning"),
        DemoTeacherCard(faculty_id="FAC-UNIV-005", name="Prof. Debashis Ghosh", email="debashis.ghosh@edupilot.ai", password="demo@1234", designation="Associate Professor", specialization="OS & Cloud Computing"),
        DemoTeacherCard(faculty_id="FAC-UNIV-006", name="Prof. Meenakshi Iyer", email="meenakshi.iyer@edupilot.ai", password="demo@1234", designation="Assistant Professor", specialization="Software Engineering & Web Technologies"),
        DemoTeacherCard(faculty_id="FAC-UNIV-007", name="Prof. Arpan Mukherjee", email="arpan.mukherjee@edupilot.ai", password="demo@1234", designation="Professor", specialization="Deep Learning & NLP"),
        DemoTeacherCard(faculty_id="FAC-UNIV-008", name="Prof. Kavita Sharma", email="kavita.sharma@edupilot.ai", password="demo@1234", designation="Assistant Professor", specialization="Mathematics & Discrete Structures"),
        DemoTeacherCard(faculty_id="FAC-UNIV-009", name="Prof. Subhashis Roy", email="subhashis.roy@edupilot.ai", password="demo@1234", designation="Associate Professor", specialization="Blockchain & Cyber Security"),
        DemoTeacherCard(faculty_id="FAC-UNIV-010", name="Prof. Ananya Sengupta", email="ananya.sengupta@edupilot.ai", password="demo@1234", designation="Assistant Professor", specialization="IoT & Embedded Systems"),
    ]
