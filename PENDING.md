<!-- markdownlint-disable -->
<div align="center">

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0060B5,100:8CC63F&height=200&section=header&text=Pending%20Tasks%20%26%20Roadmap&fontSize=48&fontColor=ffffff&fontAlign=50&fontAlignY=38" alt="Header Banner" width="100%" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3000&pause=1000&color=8CC63F&center=true&vCenter=true&width=650&lines=EduPilot+AI+Pending+Backend+Jobs;Unimplemented+Endpoints+%26+Route+Gaps;Test+Suite+%26+DevOps+Infrastructure" alt="Typing SVG" />
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Progress-F59E0B?style=for-the-badge&logo=githubactions&logoColor=white" alt="Status Badge" />
  <img src="https://img.shields.io/badge/Target-v1.1.0%20Milestone-0060B5?style=for-the-badge&logo=fastapi&logoColor=white" alt="Milestone Badge" />
  <img src="https://img.shields.io/badge/Priority-High-EF4444?style=for-the-badge&logo=target&logoColor=white" alt="Priority Badge" />
</p>

</div>

---

## 📌 Executive Summary

This document outlines the **unimplemented routes, missing background infrastructure, test suites, external service integrations, and devops requirements** needed to bring the **EduPilot-AI** backend from MVP/Demo state to full production grade.

---

## 🧭 Master Task Matrix

| # | Feature / Job Domain | Priority | Impact Area | Complexity | Status |
| :---: | :--- | :---: | :--- | :---: | :---: |
| **1** | [Lesson Plans API Route (`/lesson-plans`)](#1--lesson-plans-api-routes) | `HIGH` | Curriculum & Academic | Medium | ⏳ Pending |
| **2** | [Document Studio & Export Endpoints](#2--document-studio--export-engine) | `HIGH` | PDF / PPTX / Word Export | Medium | ✅ Completed (jsPDF) |
| **3** | [Assignment Submissions & AI Auto-Grading](#3--assignment-submissions--ai-grading) | `HIGH` | Evaluation Workflow | High | ⏳ Pending |
| **4** | [Assessment Questions CRUD & Auto-Quiz](#4--assessment--question-bank-management) | `HIGH` | Exam & Quiz Engine | Medium | ⏳ Pending |
| **5** | [Automated Test Suite (`pytest`)](#5--automated-testing-suite) | `CRITICAL` | Quality & Reliability | Medium | ⏳ Pending |
| **6** | [Database Migrations & Mongo Schemas](#6--database-migrations--schema-versioning) | `HIGH` | Data Integrity | Low | ⏳ Pending |
| **7** | [Async Task Queue (`Celery`/`Redis`/`Arq`)](#7--asynchronous-task-queue--worker) | `MEDIUM` | Performance & Concurrency | High | ⏳ Pending |
| **8** | [Real SMTP Server Integration & Queue](#8--production-smtp-email-relay) | `MEDIUM` | Student Communications | Medium | ⏳ Pending |
| **9** | [RAG Vector Index & Semantic Search](#9--vector-store--semantic-rag-layer) | `HIGH` | AI Retrieval Accuracy | High | ✅ Completed |
| **10** | [Persistent File Storage Manager](#10--persistent-file-storage-layer) | `MEDIUM` | Media & Document Storage | Medium | ✅ Completed |
| **11** | [Rate Limiting & Security Hardening](#11--security-rate-limiting--middleware) | `HIGH` | API Protection & DoS Guard | Low | ⏳ Pending |
| **12** | [Docker & Container Deployment Config](#12--docker--container-deployment) | `MEDIUM` | Cloud Hosting & DevOps | Low | ✅ Completed |

---

## 1. 📝 Lesson Plans API Routes

### 📋 Overview
The database model `LessonPlan` exists at [`backend/app/models/lesson.py`](file:///Users/subhajyotihalder/Desktop/Vibe_Forge2k26/EduPilot-AI/backend/app/models/lesson.py), but there is **no route file or router registration** in `backend/app/api/v1/router.py`.

### 🎯 Pending Tasks
- [ ] Create `backend/app/api/v1/routes/lesson_plans.py`
- [ ] Register `lesson_plans.router` with prefix `/lesson-plans` inside [`backend/app/api/v1/router.py`](file:///Users/subhajyotihalder/Desktop/Vibe_Forge2k26/EduPilot-AI/backend/app/api/v1/router.py)
- [ ] Implement Endpoints:
  - `GET /api/v1/lesson-plans?class_id={id}` — List all lesson plans for assigned course
  - `POST /api/v1/lesson-plans` — Create new lesson plan (draft or published)
  - `GET /api/v1/lesson-plans/{id}` — Fetch structured lesson breakdown (prerequisites, objectives, activities)
  - `PUT /api/v1/lesson-plans/{id}` — Update / edit lesson plan content
  - `DELETE /api/v1/lesson-plans/{id}` — Delete lesson plan
  - `POST /api/v1/lesson-plans/generate-ai` — AI-powered auto-generator using Groq/Gemini based on syllabus topic

---

## 2. 📄 Document Studio & Export Engine

### 📋 Overview
[`backend/app/api/v1/routes/documents.py`](file:///Users/subhajyotihalder/Desktop/Vibe_Forge2k26/EduPilot-AI/backend/app/api/v1/routes/documents.py) currently only lists documents. The backend dependencies `reportlab`, `python-docx`, `python-pptx`, and `openpyxl` are installed, but there are no generation/export endpoints.

### 🎯 Pending Tasks
- [ ] Implement server-side document generators in a new service `backend/app/services/document_builder.py`:
  - **PDF Builder**: Universal-branded syllabus, lesson notes, and test papers using `reportlab`
  - **PPTX Builder**: Multi-slide lecture presentation deck builder using `python-pptx`
  - **DOCX Builder**: Formatted assignment briefs and rubric sheets using `python-docx`
  - **Excel Builder**: Attendance ledger & semester gradebook exporter using `openpyxl`
- [ ] Add Endpoints:
  - `POST /api/v1/documents/export/pdf` — Compile and return downloadable PDF stream
  - `POST /api/v1/documents/export/pptx` — Compile and return PowerPoint file stream
  - `POST /api/v1/documents/export/attendance-sheet` — Export formatted `.xlsx` roster
  - `GET /api/v1/documents/{id}/download` — Stream stored artifact binary

---

## 3. 📥 Assignment Submissions & AI Grading

### 📋 Overview
[`backend/app/models/assignment.py`](file:///Users/subhajyotihalder/Desktop/Vibe_Forge2k26/EduPilot-AI/backend/app/models/assignment.py) defines `AssignmentSubmission`, but routes only list and create assignments.

### 🎯 Pending Tasks
- [ ] Implement Submission & Evaluation Routes in [`backend/app/api/v1/routes/assignments.py`](file:///Users/subhajyotihalder/Desktop/Vibe_Forge2k26/EduPilot-AI/backend/app/api/v1/routes/assignments.py):
  - `GET /api/v1/assignments/{id}/submissions` — List student submissions with grading status
  - `POST /api/v1/assignments/{id}/submit` — Ingest student submission text / document
  - `POST /api/v1/assignments/{id}/evaluate-ai` — LLM evaluation against assignment rubric & model answers
  - `PUT /api/v1/assignments/submissions/{sub_id}/grade` — Teacher override and final grade confirmation
  - `GET /api/v1/assignments/{id}/analytics` — Submission rate, score distribution, and late submission count

---

## 4. 🧪 Assessment & Question Bank Management

### 📋 Overview
`Question` and `AssessmentResult` models exist in [`backend/app/models/assessment.py`](file:///Users/subhajyotihalder/Desktop/Vibe_Forge2k26/EduPilot-AI/backend/app/models/assessment.py), but question-level editing and auto-quiz generation are missing.

### 🎯 Pending Tasks
- [ ] Implement Endpoints in [`backend/app/api/v1/routes/assessments.py`](file:///Users/subhajyotihalder/Desktop/Vibe_Forge2k26/EduPilot-AI/backend/app/api/v1/routes/assessments.py):
  - `POST /api/v1/assessments/generate` — Auto-generate MCQs, short answer, and coding questions from topic
  - `GET /api/v1/assessments/{id}/questions` — Retrieve individual question items with Bloom's taxonomy tags
  - `POST /api/v1/assessments/{id}/questions` — Add manual questions to quiz
  - `PUT /api/v1/assessments/questions/{q_id}` — Edit question text, options, or correct answers
  - `DELETE /api/v1/assessments/questions/{q_id}` — Remove question from assessment
  - `POST /api/v1/assessments/{id}/publish` — Publish quiz to student portal / section roster

---

## 5. 🧪 Automated Testing Suite

### 📋 Overview
The repository contains **no `tests/` directory** and 0% unit/integration test coverage.

### 🎯 Pending Tasks
- [ ] Create `backend/tests/` structure:
  - `conftest.py` with in-memory SQLite fixture and test client (`TestClient(app)`)
  - `test_auth.py` — Login, demo-accounts, JWT expiration, password hashing
  - `test_attendance.py` — Attendance session creation, bulk student status, attendance percentage calculation
  - `test_students.py` — Directory query, year/section filtering, search pagination
  - `test_timetable.py` — Weekly routine lookup, teacher conflict checking
  - `test_ai.py` — Groq execution, Gemini fallback, payload structure parsing
  - `test_seeder.py` — Database seeder verification (720 students, 10 faculty, courses, enrollments)
  - `test_security.py` — 401 Unauthorized, 403 Forbidden, expired JWT rejection

---

## 6. 🗄️ Database Migrations & Schema Versioning

### 📋 Overview
Database tables are initialized using `Base.metadata.create_all(bind=engine)`. No migration management exists.

### 🎯 Pending Tasks
- [ ] Initialize Alembic: `alembic init alembic` inside `backend/`
- [ ] Configure `alembic.ini` and `alembic/env.py` with `Base.metadata` and `settings.DATABASE_URL`
- [ ] Generate baseline migration: `alembic revision --autogenerate -m "initial_schema"`
- [ ] Add migration runner hook to startup or CI/CD workflow

---

## 7. ⚡ Asynchronous Task Queue & Worker

### 📋 Overview
Bulk operations (emailing 60–720 students, PDF rendering, background analytics aggregation) currently run synchronously.

### 🎯 Pending Tasks
- [ ] Select and install background task broker (`Arq` / `Celery` with Redis or `FastAPI.BackgroundTasks`)
- [ ] Offload heavy jobs:
  - Bulk Email Batching & Dispatch
  - Server-side PDF/PPTX Compilation
  - Nightly Student Risk Score Recalculation (Attendance < 75% alerts)
  - Ingestion & Vector Indexing of large uploaded textbooks/slides

---

## 8. 📧 Production SMTP Email Relay

### 📋 Overview
`app/api/v1/routes/communications.py` records messages in database without connecting to active SMTP transport.

### 🎯 Pending Tasks
- [ ] Add SMTP credentials to `.env.example` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAILS_FROM_EMAIL`)
- [ ] Build robust mail delivery service `backend/app/services/email_service.py` using `aiosmtplib`:
  - Connection pooling with TLS/STARTTLS
  - HTML email templates with university branding
  - Retry logic and bounce logging
  - Batching (chunks of 25 to respect SMTP rate limits)

---

## 9. 🧠 Vector Store & Semantic RAG Layer

### 📋 Overview
[`backend/app/models/knowledge.py`](file:///Users/subhajyotihalder/Desktop/Vibe_Forge2k26/EduPilot-AI/backend/app/models/knowledge.py) stores document chunks, but lacks an active vector embedding index for semantic search.

### 🎯 Pending Tasks
- [ ] Implement text chunker and vector embedding generator (using `langchain` / `google-genai` / `sentence-transformers`)
- [ ] Implement local Vector Store (e.g. `sqlite-vss`, `ChromaDB`, or `FAISS`)
- [ ] Wire semantic context retriever into [`backend/app/api/v1/routes/ai.py`](file:///Users/subhajyotihalder/Desktop/Vibe_Forge2k26/EduPilot-AI/backend/app/api/v1/routes/ai.py) to ground AI responses with syllabus documents

---

## 10. 💾 Persistent File Storage Layer

### 📋 Overview
Uploaded syllabus files and slides are parsed in-memory and discarded without file persistence.

### 🎯 Pending Tasks
- [ ] Create structured local media storage directory (`backend/storage/uploads/`, `backend/storage/exports/`)
- [ ] Implement File Storage Service (`backend/app/services/storage.py`):
  - Local Disk Provider
  - S3 / MinIO / Cloudflare R2 Provider (switchable via `.env`)
  - File validation (MIME check, max 25MB limit, virus/extension sanitization)

---

## 11. 🛡️ Security, Rate Limiting & Middleware

### 🎯 Pending Tasks
- [ ] **Rate Limiting**: Integrate `slowapi` on AI endpoints (`/api/v1/ai/chat`, `/api/v1/ai/generate-*`)
- [ ] **Security Headers Middleware**: Add `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`
- [ ] **Structured Request Logging**: Configure `structlog` middleware with unique Request-ID correlation
- [ ] **CORS Strict Whitelist**: Validate origins against production domain list

---

## 12. 🐳 Docker & Container Deployment

### 🎯 Pending Tasks
- [ ] `backend/Dockerfile` — Multi-stage Python 3.11 build with slim Debian base
- [ ] `frontend/Dockerfile` — Multi-stage Node.js build with Nginx Alpine
- [ ] `docker-compose.yml` — Full local stack (FastAPI Backend + Vite Frontend + SQLite/PostgreSQL)
- [ ] `docker-compose.prod.yml` — Production stack with Nginx reverse proxy and SSL
- [ ] `.dockerignore` files for both frontend and backend



<div align="center">
  <sub>EduPilot-AI • Universal Intelligent Academic Operating System</sub>
</div>

