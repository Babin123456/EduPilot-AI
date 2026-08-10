"""University, School, Department, Program document helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


# ── Collection names ──
UNIVERSITIES = "universities"
SCHOOLS = "schools"
DEPARTMENTS = "departments"
PROGRAMS = "programs"


def new_university(*, name, short_name=None, address=None, city=None, state=None,
                   country="India", website=None, logo_url=None, id=None):
    return {
        "id": id or _uid(),
        "name": name,
        "short_name": short_name,
        "address": address,
        "city": city,
        "state": state,
        "country": country,
        "website": website,
        "logo_url": logo_url,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def new_school(*, university_id, name, short_name=None, id=None):
    return {
        "id": id or _uid(),
        "university_id": university_id,
        "name": name,
        "short_name": short_name,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def new_department(*, school_id, name, short_name=None, code=None, id=None):
    return {
        "id": id or _uid(),
        "school_id": school_id,
        "name": name,
        "short_name": short_name,
        "code": code,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def new_program(*, department_id, name, short_name=None, degree_type="B.Tech",
                duration_years=4, id=None):
    return {
        "id": id or _uid(),
        "department_id": department_id,
        "name": name,
        "short_name": short_name,
        "degree_type": degree_type,
        "duration_years": duration_years,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }
