<!-- markdownlint-disable -->
<div align="center">

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0060B5,100:8CC63F&height=200&section=header&text=Developer%20Instructions&fontSize=50&fontColor=ffffff&fontAlign=50&fontAlignY=38" alt="Header Banner" width="100%" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3000&pause=1000&color=8CC63F&center=true&vCenter=true&width=650&lines=Environment+Secrets+Setup+Guide;Step-by-step+working+principles+of+all+files;Vercel+Frontend+%2B+Render+Backend+Deployment" alt="Typing SVG" />
</p>

---

</div>

## 🔑 1. How to Obtain Environment Secrets (Step-by-Step)

### 🔐 Step 1: Generate Cryptographic Secret Keys (`SECRET_KEY` & `JWT_SECRET_KEY`)

You can generate 64-character hex secret keys using Python directly in your terminal:

```bash
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32)); print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
```

Copy the generated 64-character strings and set them as `SECRET_KEY` and `JWT_SECRET_KEY` in your `.env` file.

### 🤖 Step 2: Groq API Keys (Primary LLM)

1. Go to [Groq Console](https://console.groq.com/).
2. Sign in or create a free developer account.
3. Navigate to **API Keys** section.
4. Click **Create API Key** and copy the string (starts with `gsk_`). Put this as `GROQ_API_KEY_1`.
5. Repeat the step to generate a second key for `GROQ_API_KEY_2` to serve as a high-volume key backup.

### 🧠 Step 3: Google Gemini API Key (Fallback LLM)

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Log in with your Google account.
3. Click **Get API Key** -> **Create API key in new project**.
4. Copy the generated key string and set it as `GEMINI_API_KEY`.

> 💡 **Note on Email & Communications**: In demo mode, all email dispatching (student lecture notes, attendance alerts, announcements) is handled natively inside the teacher communications portal without requiring external SMTP configuration.

---

## 🛠️ 2. Principles & Purpose of Each File in the Codebase

### 🐍 Backend Files (`backend/app/`)

- `main.py`: Entry point for FastAPI application. Sets up CORS, mounts `/api/v1` routes, handles database index creation and automatic seeding on startup.
- `core/config.py`: Environment variable configuration loader built with `pydantic-settings`.
- `core/database.py`: MongoDB client & database connection setup (`pymongo`) with index creation helpers.
- `core/security.py`: Password hashing (bcrypt) and JWT access/refresh token generator and decoder.
- `core/exceptions.py`: Standardized HTTP exception helpers (401, 403, 404, 500).
- `models/__init__.py`: Registry importing all Pydantic and database domain schemas.
- `models/university.py`: University, School, Department, and Program entities.
- `models/academic.py`: AcademicSession, Year (1-4), Semester (1-8), Section (A/B/C), and Course entities.
- `models/teacher.py`: Faculty teacher user model with credentials and department metadata.
- `models/student.py`: Student canonical identity model containing roll numbers, placements, and risk metrics.
- `models/enrollment.py`: Student course enrollments and Teacher-Course-Section class mappings.
- `models/timetable.py`: Class schedule timetable entry slots per weekday.
- `models/attendance.py`: Daily attendance sessions and per-student attendance status records.
- `models/assignment.py`: Course assignments, rubrics, and student submission tracking.
- `models/assessment.py`: Quizzes/exams, question items, and student grade results.
- `models/daily_note.py`: Daily topic discussion notes model.
- `models/ai_models.py`: Persistent AI conversation logs and message histories.
- `models/knowledge.py`: RAG Knowledge base documents and text chunks.
- `models/notification.py`: Teacher in-app alert notifications.
- `seed/names.py`: Curated collection of **720 unique Indian student names**.
- `seed/seeder.py`: Deterministic database seeder creating 720 student records, 10 faculty accounts, courses, and attendance history in MongoDB.
- `api/deps.py`: Auth dependency extracting current logged-in teacher from Bearer JWT headers.
- `api/v1/routes/auth.py`: REST routes for teacher login, logout, profile fetching, profile avatar upload, and demo accounts listing.
- `api/v1/routes/dashboard.py`: Summary metrics for the teacher command center dashboard.
- `api/v1/routes/classes.py`: API listing teacher assigned classes and details.
- `api/v1/routes/timetable.py`: API providing daily and weekly timetable routine schedules.
- `api/v1/routes/students.py`: Searchable, filterable student directory API.
- `api/v1/routes/attendance.py`: Interactive attendance session recording API.
- `api/v1/routes/analytics.py`: Class grade distribution and attendance analytics API.
- `api/v1/routes/ai.py`: Context-aware AI chat API endpoint with RAG document library integration, local RapidOCR (`rapidocr-onnxruntime`) image text extraction, and Smart Task-Based LLM Model Router (Groq primary for standard text chat, Gemini 1.5 Flash Vision primary for file/image analysis).
- `api/v1/routes/daily_notes.py`: Daily topic discussion notes generation, listing, and bulk sharing API.
- `api/v1/routes/communications.py`: Teacher email composer, student email lookup, and communication history API.
- `api/v1/routes/personal_files.py`: Teacher personal file storage routes (upload, list, download, delete).

### ⚛️ Frontend Files (`frontend/src/`)

- `main.tsx`: Entry point mounting the React root DOM.
- `App.tsx`: Top-level router routing authenticated routes through `MainLayout`.
- `index.css`: Tailwind CSS directives and custom UI scrollbars.
- `.oxlintrc.json`: High-performance Rust-based Oxlint configuration enforcing React Hooks and component export rules.
- `api/client.ts`: Axios client instance equipped with automatic Bearer token injection and 401 redirect handling.
- `utils/pdfGenerator.ts`: Client-side jsPDF utility for professional university-branded PDF exports (quizzes, reports, notes).
- `context/AuthContext.tsx`: React Context managing token storage, current teacher profile, active class selection, and instant `/login` redirection upon logout.
- `context/ThemeContext.tsx`: React Context managing dark/light theme toggling and localStorage persistence across all views including the login page.
- `components/MainLayout.tsx`: Responsive application shell with enlarged brand logo, year-grouped dropdown, framer-motion page transitions, and theme toggle.
- `pages/LoginPage.tsx`: Next-gen sign-in page with prefillable demo faculty cards, dark/light mode toggle button, and "Back to Home" navigation button.
- `pages/DashboardPage.tsx`: Teacher Command Center dashboard showing statistics, routine, and quick actions with skeleton loaders.
- `pages/AttendancePage.tsx`: Attendance-taking interface supporting bulk selection and status updates.
- `pages/AIPage.tsx`: EduPilot AI Assistant conversational interface.
- `pages/StudentsPage.tsx`: 720-student directory with university emails, risk indicators, search filters, and PDF report download.
- `pages/TimetablePage.tsx`: Weekly teaching schedule routine grid.
- `pages/AnalyticsPage.tsx`: Interactive Recharts data charts for grade and attendance analytics.
- `pages/AssessmentsPage.tsx`: Assessment and quiz studio with expandable student results and jsPDF downloads.
- `pages/DailyNotesPage.tsx`: Daily lecture topic notes generator with one-click email distribution and PDF export.
- `pages/DocumentStudioPage.tsx`: Document Studio for on-demand branded PDF generation and download.
- `pages/CommunicationsPage.tsx`: Teacher email communications hub with student email directory, template composer, and history.

### 🐳 Docker & Infrastructure Files (`nginx/` & `docker-compose.yml`)

- `docker-compose.yml`: Multi-container orchestrator bringing up Backend (FastAPI:8000), Frontend (React:80), and Nginx reverse proxy (Port 80) simultaneously.
- `nginx/nginx.conf`: Production Nginx reverse proxy configuration. Routes `/api/*` and `/media/*` requests to the backend service and all single-page frontend routes (`/*`) to the React build with gzip compression and 50MB file size limits.
- `nginx/Dockerfile`: Lightweight Nginx Docker container wrapper bundling `nginx.conf`.

---

## 🌐 3. Deployment Process & Environment Setup

### 🐳 Option A: Single-Command Docker Deployment (Recommended)

To run the entire EduPilot AI stack (Frontend, Backend, Nginx Proxy) locally or on a VPS:

```bash
# 1. Build and start all services in detached mode
docker compose up --build -d

# 2. View live logs across all containers
docker compose logs -f

# 3. Stop all containers
docker compose down
```

> 🌐 **App Portal**: `http://localhost` (Port 80)  
> 📡 **API Documentation**: `http://localhost/api/docs`

---

### ⚛️ Option B: Frontend Cloud Deployment (Vercel)

1. Push project repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
3. Import the `EduPilot-AI` repository.
4. Set **Root Directory** to `frontend`.
5. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
6. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-render-url.onrender.com/api/v1`
7. Click **Deploy**.

### 🐍 Backend Deployment (Render)

1. Go to [Render Dashboard](https://render.com/) and create a **Web Service**.
2. Connect your GitHub repository `EduPilot-AI`.
3. Set **Root Directory** to `backend`.
4. Set **Runtime** to `Python 3`.
5. Set **Build Command** to `pip install -e .`.
6. Set **Start Command** to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
7. Add Environment Variables in Render:
   - `MONGODB_URI` = `mongodb+srv://user:pass@cluster.mongodb.net/` (or local `mongodb://localhost:27017`)
   - `MONGODB_DB_NAME` = `edupilot_db`
   - `JWT_SECRET_KEY` = your secret
   - `GROQ_API_KEY_1` = your key
   - `GROQ_API_KEY_2` = your key
   - `GEMINI_API_KEY` = your key
   - `SMTP_USERNAME` = your email
   - `SMTP_PASSWORD` = your app password
8. Click **Create Web Service**.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:8CC63F,100:0060B5&height=100&section=footer" alt="Footer Banner" width="100%" />
</p>
