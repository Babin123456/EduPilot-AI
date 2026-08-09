"""EduPilot AI — Deterministic database seeder.

Creates:
- Adamas University hierarchy
- CSE department, B.Tech program
- 4 years, 8 semesters, 12 sections (A/B/C per year)
- ~40 CSE courses across 8 semesters
- 8 demo teachers with assignments
- 720 unique students
- Timetable entries
- 30+ days of historical attendance
- Sample assignments, assessments, and scores
"""

from __future__ import annotations

import json
import random
import uuid
from datetime import date, datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.database import SessionLocal, create_tables
from app.core.security import hash_password
from app.models import (
    University, School, Department, Program,
    AcademicSession, Year, Semester, Section, Course,
    Teacher, Student, Enrollment, TeacherCourseAssignment,
    TimetableEntry, AttendanceSession, AttendanceRecord,
    Assignment, AssignmentSubmission, Assessment, Question, AssessmentResult,
    LessonPlan, Document, Notification,
)
from app.seed.names import STUDENT_NAMES

RANDOM_SEED = 42

COURSES_BY_SEMESTER = {
    1: [
        ("CS101", "Programming Fundamentals", "theory", 4),
        ("CS102", "Digital Logic Design", "theory", 3),
        ("MA101", "Engineering Mathematics I", "theory", 4),
        ("PH101", "Engineering Physics", "theory", 3),
        ("CS103", "Programming Lab", "lab", 2),
    ],
    2: [
        ("CS201", "Data Structures", "theory", 4),
        ("CS202", "Computer Organization", "theory", 3),
        ("MA201", "Engineering Mathematics II", "theory", 4),
        ("CS203", "Object-Oriented Programming", "theory", 3),
        ("CS204", "Data Structures Lab", "lab", 2),
    ],
    3: [
        ("CS301", "Algorithms", "theory", 4),
        ("CS302", "Database Management Systems", "theory", 4),
        ("CS303", "Discrete Mathematics", "theory", 3),
        ("CS304", "Operating Systems", "theory", 4),
        ("CS305", "DBMS Lab", "lab", 2),
    ],
    4: [
        ("CS401", "Computer Networks", "theory", 4),
        ("CS402", "Software Engineering", "theory", 3),
        ("CS403", "Theory of Computation", "theory", 3),
        ("CS404", "Microprocessors", "theory", 3),
        ("CS405", "Networks Lab", "lab", 2),
    ],
    5: [
        ("CS501", "Artificial Intelligence", "theory", 4),
        ("CS502", "Compiler Design", "theory", 3),
        ("CS503", "Web Technologies", "theory", 3),
        ("CS504", "Information Security", "theory", 3),
        ("CS505", "AI Lab", "lab", 2),
    ],
    6: [
        ("CS601", "Machine Learning", "theory", 4),
        ("CS602", "Cloud Computing", "theory", 3),
        ("CS603", "Mobile App Development", "theory", 3),
        ("CS604", "Data Mining", "theory", 3),
        ("CS605", "ML Lab", "lab", 2),
    ],
    7: [
        ("CS701", "Deep Learning", "theory", 4),
        ("CS702", "Big Data Analytics", "theory", 3),
        ("CS703", "Internet of Things", "theory", 3),
        ("CS704", "Natural Language Processing", "theory", 3),
        ("CS705", "Project Phase I", "project", 4),
    ],
    8: [
        ("CS801", "Blockchain Technology", "theory", 3),
        ("CS802", "Cyber Security", "theory", 3),
        ("CS803", "Ethics in Computing", "theory", 2),
        ("CS804", "Project Phase II", "project", 8),
    ],
}

DEMO_TEACHERS = [
    {
        "faculty_id": "FAC-AU-001",
        "first_name": "Rajesh",
        "last_name": "Banerjee",
        "email": "rajesh.banerjee@adamasuniversity.ac.in",
        "password": "demo@1234",
        "designation": "Associate Professor",
        "specialization": "Algorithms & Data Structures",
        "phone": "+91-9876543210",
    },
    {
        "faculty_id": "FAC-AU-002",
        "first_name": "Priya",
        "last_name": "Nair",
        "email": "priya.nair@adamasuniversity.ac.in",
        "password": "demo@1234",
        "designation": "Assistant Professor",
        "specialization": "Database Systems & Data Mining",
        "phone": "+91-9876543211",
    },
    {
        "faculty_id": "FAC-AU-003",
        "first_name": "Amitava",
        "last_name": "Chatterjee",
        "email": "amitava.chatterjee@adamasuniversity.ac.in",
        "password": "demo@1234",
        "designation": "Professor",
        "specialization": "Artificial Intelligence & Machine Learning",
        "phone": "+91-9876543212",
    },
    {
        "faculty_id": "FAC-AU-004",
        "first_name": "Sunita",
        "last_name": "Devi",
        "email": "sunita.devi@adamasuniversity.ac.in",
        "password": "demo@1234",
        "designation": "Assistant Professor",
        "specialization": "Computer Networks & Security",
        "phone": "+91-9876543213",
    },
    {
        "faculty_id": "FAC-AU-005",
        "first_name": "Debashis",
        "last_name": "Ghosh",
        "email": "debashis.ghosh@adamasuniversity.ac.in",
        "password": "demo@1234",
        "designation": "Associate Professor",
        "specialization": "Operating Systems & Cloud Computing",
        "phone": "+91-9876543214",
    },
    {
        "faculty_id": "FAC-AU-006",
        "first_name": "Meenakshi",
        "last_name": "Iyer",
        "email": "meenakshi.iyer@adamasuniversity.ac.in",
        "password": "demo@1234",
        "designation": "Assistant Professor",
        "specialization": "Software Engineering & Web Technologies",
        "phone": "+91-9876543215",
    },
    {
        "faculty_id": "FAC-AU-007",
        "first_name": "Arpan",
        "last_name": "Mukherjee",
        "email": "arpan.mukherjee@adamasuniversity.ac.in",
        "password": "demo@1234",
        "designation": "Professor",
        "specialization": "Deep Learning & NLP",
        "phone": "+91-9876543216",
    },
    {
        "faculty_id": "FAC-AU-008",
        "first_name": "Kavita",
        "last_name": "Sharma",
        "email": "kavita.sharma@adamasuniversity.ac.in",
        "password": "demo@1234",
        "designation": "Assistant Professor",
        "specialization": "Mathematics & Discrete Structures",
        "phone": "+91-9876543217",
    },
    {
        "faculty_id": "FAC-AU-009",
        "first_name": "Subhashis",
        "last_name": "Roy",
        "email": "subhashis.roy@adamasuniversity.ac.in",
        "password": "demo@1234",
        "designation": "Associate Professor",
        "specialization": "Blockchain & Cyber Security",
        "phone": "+91-9876543218",
    },
    {
        "faculty_id": "FAC-AU-010",
        "first_name": "Ananya",
        "last_name": "Sengupta",
        "email": "ananya.sengupta@adamasuniversity.ac.in",
        "password": "demo@1234",
        "designation": "Assistant Professor",
        "specialization": "Internet of Things & Embedded Systems",
        "phone": "+91-9876543219",
    },
]

TEACHER_ASSIGNMENTS = {
    0: [(3, "CS301", ["A", "B"]), (4, "CS401", ["A"]), (1, "CS101", ["A", "B", "C"])],
    1: [(3, "CS302", ["A", "B", "C"]), (6, "CS604", ["A"])],
    2: [(5, "CS501", ["A", "B", "C"]), (7, "CS701", ["A", "B"])],
    3: [(4, "CS401", ["B", "C"]), (5, "CS504", ["A", "B"]), (8, "CS802", ["A"])],
    4: [(3, "CS304", ["A", "B", "C"]), (6, "CS602", ["A", "B"])],
    5: [(4, "CS402", ["A", "B", "C"]), (5, "CS503", ["A"]), (6, "CS603", ["B"])],
    6: [(6, "CS601", ["A", "B", "C"]), (7, "CS704", ["A"]), (7, "CS702", ["B"])],
    7: [(1, "MA101", ["A", "B", "C"]), (2, "MA201", ["A", "B", "C"]), (3, "CS303", ["A"])],
    8: [(8, "CS801", ["A", "B", "C"]), (8, "CS802", ["B", "C"])],
    9: [(7, "CS703", ["A", "B", "C"]), (2, "CS202", ["A", "B"])],
}


def _uid() -> str:
    return str(uuid.uuid4())


def run_seed():
    """Execute the full database seed."""
    rng = random.Random(RANDOM_SEED)
    create_tables()
    db = SessionLocal()

    try:
        if db.query(University).first():
            print("[Seed] Database already seeded. Skipping.")
            return

        print("[Seed] Starting database seed...")

        # 1. University
        university = University(
            id=_uid(), name="Adamas University", short_name="AU",
            city="Kolkata", state="West Bengal", country="India",
            website="https://adamasuniversity.ac.in",
            address="Barasat - Barrackpore Road, Barbaria, P.O. Jagannathpur, Kolkata - 700126",
        )
        db.add(university)
        db.flush()

        # 2. School
        school = School(
            id=_uid(), university_id=university.id,
            name="School of Engineering & Technology", short_name="SOET",
        )
        db.add(school)
        db.flush()

        # 3. Department
        department = Department(
            id=_uid(), school_id=school.id,
            name="Computer Science & Engineering", short_name="CSE", code="CSE",
        )
        db.add(department)
        db.flush()

        # 4. Program
        program = Program(
            id=_uid(), department_id=department.id,
            name="Bachelor of Technology in Computer Science & Engineering",
            short_name="B.Tech CSE", degree_type="B.Tech", duration_years=4,
        )
        db.add(program)
        db.flush()

        # 5. Academic Session
        session = AcademicSession(
            id=_uid(), name="2025-2026",
            start_date=date(2025, 7, 1), end_date=date(2026, 6, 30),
            is_current=True,
        )
        db.add(session)
        db.flush()

        # 6. Years, Semesters, Sections
        years: dict[int, Year] = {}
        semesters: dict[int, Semester] = {}
        sections: dict[str, Section] = {}

        year_labels = {1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year"}
        for yn in range(1, 5):
            year = Year(
                id=_uid(), program_id=program.id,
                year_number=yn, label=year_labels[yn],
            )
            db.add(year)
            db.flush()
            years[yn] = year

            for sn in range(1, 3):
                sem_num = (yn - 1) * 2 + sn
                semester = Semester(
                    id=_uid(), year_id=year.id,
                    semester_number=sem_num,
                    label=f"Semester {sem_num}",
                    is_current=(sem_num % 2 == 1),
                )
                db.add(semester)
                db.flush()
                semesters[sem_num] = semester

            for sec_name in ["A", "B", "C"]:
                sec = Section(
                    id=_uid(), year_id=year.id,
                    name=sec_name, max_students=60,
                )
                db.add(sec)
                db.flush()
                sections[f"Y{yn}S{sec_name}"] = sec

        # 7. Courses
        courses: dict[str, Course] = {}
        for sem_num, course_list in COURSES_BY_SEMESTER.items():
            for code, name, ctype, credits in course_list:
                course = Course(
                    id=_uid(), department_id=department.id,
                    semester_id=semesters[sem_num].id,
                    code=code, name=name, course_type=ctype, credits=credits,
                )
                db.add(course)
                db.flush()
                courses[code] = course

        # 8. Teachers
        teachers: list[Teacher] = []
        for t_data in DEMO_TEACHERS:
            teacher = Teacher(
                id=_uid(), department_id=department.id,
                faculty_id=t_data["faculty_id"],
                first_name=t_data["first_name"],
                last_name=t_data["last_name"],
                email=t_data["email"],
                hashed_password=hash_password(t_data["password"]),
                designation=t_data["designation"],
                specialization=t_data["specialization"],
                phone=t_data["phone"],
                is_demo=True,
            )
            db.add(teacher)
            db.flush()
            teachers.append(teacher)

        # 9. Teacher Course Assignments
        tca_map: dict[str, TeacherCourseAssignment] = {}

        for t_idx, assignments in TEACHER_ASSIGNMENTS.items():
            teacher = teachers[t_idx]
            for sem_num, course_code, sec_names in assignments:
                course = courses[course_code]
                year_num = (sem_num + 1) // 2
                for sec_name in sec_names:
                    sec_key = f"Y{year_num}S{sec_name}"
                    sec = sections[sec_key]
                    rooms = [f"CSE-{rng.randint(101, 420)}", f"Lab-{rng.randint(1, 8)}" if course.course_type == "lab" else f"Room-{rng.randint(201, 310)}"]
                    tca = TeacherCourseAssignment(
                        id=_uid(),
                        teacher_id=teacher.id,
                        course_id=course.id,
                        section_id=sec.id,
                        year_id=years[year_num].id,
                        semester_id=semesters[sem_num].id,
                        academic_session_id=session.id,
                        room=rooms[0],
                        is_active=True,
                    )
                    db.add(tca)
                    db.flush()
                    tca_map[f"{course_code}_{sec_name}_{year_num}"] = tca

        # 10. Students (720)
        students_by_section: dict[str, list[Student]] = {}
        student_index = 0

        for yn in range(1, 5):
            for sec_name in ["A", "B", "C"]:
                sec_key = f"Y{yn}S{sec_name}"
                sec = sections[sec_key]
                current_sem = (yn - 1) * 2 + 1
                students_in_sec = []

                for i in range(60):
                    first_name, last_name = STUDENT_NAMES[student_index]
                    roll_num = f"AU{25 - yn + 1}{sec_name}{str(i + 1).zfill(3)}"
                    reg_num = f"REG-{25 - yn + 1}-CSE-{str(student_index + 1).zfill(4)}"
                    student_uid = f"AU{25 - yn + 1}CSE{str(student_index + 1).zfill(4)}"
                    email_name = f"{first_name.lower()}.{last_name.lower()}{rng.randint(1, 99)}"
                    email = f"{email_name}@student.adamasuniversity.ac.in"

                    att_pct = round(rng.gauss(82, 12), 1)
                    att_pct = max(40, min(100, att_pct))
                    avg_score = round(rng.gauss(68, 15), 1)
                    avg_score = max(20, min(100, avg_score))
                    cgpa = round(avg_score / 10 * rng.uniform(0.85, 1.1), 2)
                    cgpa = min(10.0, max(3.0, cgpa))

                    risk = "normal"
                    risk_reasons = []
                    if att_pct < 75:
                        risk = "medium" if att_pct >= 65 else "high"
                        risk_reasons.append(f"Attendance below threshold: {att_pct}%")
                    if avg_score < 50:
                        risk = "high"
                        risk_reasons.append(f"Low average score: {avg_score}")
                    elif avg_score < 60 and risk == "normal":
                        risk = "low"
                        risk_reasons.append(f"Below average score: {avg_score}")

                    student = Student(
                        id=_uid(),
                        university_id=university.id,
                        student_uid=student_uid,
                        registration_number=reg_num,
                        roll_number=roll_num,
                        first_name=first_name,
                        last_name=last_name,
                        email=email,
                        phone=f"+91-{rng.randint(7000000000, 9999999999)}",
                        program_id=program.id,
                        year_id=years[yn].id,
                        semester_id=semesters[current_sem].id,
                        section_id=sec.id,
                        academic_session_id=session.id,
                        attendance_percentage=att_pct,
                        average_score=avg_score,
                        cgpa=cgpa,
                        risk_level=risk,
                        risk_reasons=json.dumps(risk_reasons) if risk_reasons else None,
                        gender=rng.choice(["Male", "Female"]),
                    )
                    db.add(student)
                    db.flush()
                    students_in_sec.append(student)
                    student_index += 1

                students_by_section[sec_key] = students_in_sec

        # 11. Enrollments
        for yn in range(1, 5):
            current_sem = (yn - 1) * 2 + 1
            sem_courses = [c for code, c in courses.items()
                          if c.semester_id == semesters[current_sem].id]
            for sec_name in ["A", "B", "C"]:
                sec_key = f"Y{yn}S{sec_name}"
                for student in students_by_section[sec_key]:
                    for course in sem_courses:
                        enrollment = Enrollment(
                            id=_uid(),
                            student_id=student.id,
                            course_id=course.id,
                            section_id=sections[sec_key].id,
                            academic_session_id=session.id,
                            status="active",
                        )
                        db.add(enrollment)
                        db.flush()

        # 12. Timetable
        time_slots = [
            ("09:00", "10:00"), ("10:00", "11:00"), ("11:15", "12:15"),
            ("12:15", "13:15"), ("14:00", "15:00"), ("15:00", "16:00"),
            ("16:15", "17:15"),
        ]

        for tca_key, tca in tca_map.items():
            num_slots = rng.randint(2, 3)
            used_days = rng.sample(range(0, 5), num_slots)
            for day in used_days:
                slot = rng.choice(time_slots)
                entry = TimetableEntry(
                    id=_uid(),
                    teacher_course_assignment_id=tca.id,
                    day_of_week=day,
                    start_time=slot[0],
                    end_time=slot[1],
                    room=tca.room,
                    slot_type="lab" if "Lab" in tca.room else "lecture",
                )
                db.add(entry)
                db.flush()

        # 13. Historical Attendance
        today = date.today()
        attendance_dates = []
        d = today - timedelta(days=45)
        while d <= today - timedelta(days=1):
            if d.weekday() < 5:
                attendance_dates.append(d)
            d += timedelta(days=1)
        attendance_dates = attendance_dates[-30:]

        for tca_key, tca in tca_map.items():
            parts = tca_key.split("_")
            course_code = parts[0]
            sec_name = parts[1]
            year_num = int(parts[2])
            sec_key = f"Y{year_num}S{sec_name}"
            section_students = students_by_section.get(sec_key, [])

            if not section_students:
                continue

            num_sessions = rng.randint(10, min(15, len(attendance_dates)))
            session_dates = sorted(rng.sample(attendance_dates, num_sessions))

            for att_date in session_dates:
                present_count = 0
                absent_count = 0
                late_count = 0

                att_session = AttendanceSession(
                    id=_uid(),
                    teacher_course_assignment_id=tca.id,
                    teacher_id=tca.teacher_id,
                    date=att_date,
                    start_time="09:00",
                    end_time="10:00",
                    is_submitted=True,
                )
                db.add(att_session)
                db.flush()

                for student in section_students:
                    roll = rng.random()
                    if roll < 0.78:
                        status = "present"
                        present_count += 1
                    elif roll < 0.92:
                        status = "absent"
                        absent_count += 1
                    else:
                        status = "late"
                        late_count += 1

                    record = AttendanceRecord(
                        id=_uid(),
                        session_id=att_session.id,
                        student_id=student.id,
                        status=status,
                    )
                    db.add(record)

                att_session.total_present = present_count
                att_session.total_absent = absent_count
                att_session.total_late = late_count
                db.flush()

        # 14. Keep Assignments, Assessments, and Document Studio Vault empty initially.
        # Materials generated by teachers in Assignment, Quiz, or Daily Notes sections will be dynamically saved.


        # 16. Sample Notifications
        teacher_0 = teachers[0]
        notifs = [
            ("Quiz results ready", "Quiz 1 for 3rd Year Section A has been graded.", "success"),
            ("Low attendance alert", "5 students in CS301 Section B have attendance below 75%.", "warning"),
            ("Assignment deadline approaching", "Assignment 2 for CS101 Section A is due in 2 days.", "info"),
        ]
        for title, msg, ntype in notifs:
            db.add(Notification(
                id=_uid(), teacher_id=teacher_0.id,
                title=title, message=msg, notification_type=ntype,
            ))
            db.flush()

        db.commit()
        print(f"[Seed] Successfully seeded {student_index} students, {len(teachers)} teachers, "
              f"{len(courses)} courses, {len(tca_map)} class assignments.")
        print("[Seed] Demo login: rajesh.banerjee@adamasuniversity.ac.in / demo@1234")

    except Exception as e:
        db.rollback()
        print(f"[Seed] Error during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
