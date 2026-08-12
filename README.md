<!-- markdownlint-disable -->
<div align="center">

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0060B5,100:8CC63F&height=220&section=header&text=EduPilot%20AI&fontSize=65&fontColor=ffffff&animation=fadeIn&fontAlign=50&fontAlignY=38&desc=AI%20Academic%20Operating%20System%20%E2%80%A2%20Universal%20University%20Edition&descFontSize=20&descAlign=50&descAlignY=62" alt="Header Banner" width="100%" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Outfit&weight=700&size=24&duration=3000&pause=1000&color=0060B5&center=true&vCenter=true&width=700&lines=Built+for+VibeForge+1.0+Hackathon;By+Team+Triangle;Empowering+Faculty+with+AI-Assisted+Classroom+Intelligence;Streamlined+Attendance%2C+Analytics+%26+Lesson+Planning" alt="Typing SVG" />
</p>

[![Hackathon](https://img.shields.io/badge/Hackathon-VibeForge%201.0-FF6B6B?style=for-the-badge&logo=rocket&logoColor=white)](https://github.com/Babin123456/EduPilot-AI)
[![Team](https://img.shields.io/badge/Team-Triangle-8CC63F?style=for-the-badge&logo=users&logoColor=slate)](https://github.com/Babin123456/EduPilot-AI)
[![Platform](https://img.shields.io/badge/Platform-Academic%20OS-0060B5?style=for-the-badge&logo=academic&logoColor=white)](https://github.com/Babin123456/EduPilot-AI)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&logo=open-source-initiative&logoColor=white)](LICENSE)

---

</div>

## 🏆 Hackathon Submission (VibeForge 1.0)

This project was crafted for **VibeForge 1.0 Hackathon** by **Team Triangle**:

| Role | Name | Institution |
| :--- | :--- | :--- |
| 👑 **Team Leader** | **Babin Bid** | University Student |
| 🛠️ **Team Member** | **Baibhab Adhikari** | University Student |
| 🚀 **Team Member** | **Subhajyoti Halder** | University Student |

---

## 🐳 Quick Start — Docker Compose (Recommended)

The easiest way to run the entire EduPilot AI stack (Frontend, Backend, and Nginx proxy) is using Docker Compose.

```bash
# 1. Copy the root environment template
cp .env.example .env
# Fill in your actual secrets in .env

# 2. Build and start all services in detached mode
docker compose up --build -d
```

> 🌐 **Application**: `http://localhost` (Port 80)
> 📡 **Backend API Docs**: `http://localhost/api/docs`

To view logs or stop the services:
```bash
# View logs
docker compose logs -f

# Stop and remove containers
docker compose down
```

---

## 🔐 Environment Configuration

EduPilot AI uses **separate `.env` files** for Backend and Frontend so each component only sees the variables it needs.

### Quick Setup

```bash
# 1. Backend environment
cp backend/.env.example backend/.env
#    → Edit backend/.env with your MongoDB URI, API keys, and secrets

# 2. Frontend environment
cp frontend/.env.example frontend/.env
#    → Edit frontend/.env with your backend API URL
```

### Environment Files Overview

| File | Tracked in Git? | Purpose |
| :--- | :---: | :--- |
| `.env.example` | ✅ Yes | Root-level master reference & Docker Compose template |
| `backend/.env.example` | ✅ Yes | Backend environment template with all FastAPI variables |
| `frontend/.env.example` | ✅ Yes | Frontend environment template (`VITE_API_URL` only) |
| `.env` | ❌ No | Root secrets for Docker Compose (copy from `.env.example`) |
| `backend/.env` | ❌ No | Backend secrets (copy from `backend/.env.example`) |
| `frontend/.env` | ❌ No | Frontend secrets (copy from `frontend/.env.example`) |

> ⚠️ **Never commit `.env` files** — they contain real credentials. Only `.env.example` templates are tracked.

### Key Variables

**Backend** (`backend/.env`):
| Variable | Description | How to Get |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas connection string | [MongoDB Atlas](https://cloud.mongodb.com) |
| `SECRET_KEY` | 64-char app secret | `python -c "import secrets; print(secrets.token_hex(32))"` |
| `JWT_SECRET_KEY` | 64-char JWT signing key | Same command as above |
| `GROQ_API_KEY_1` | Primary Groq LLM key | [Groq Console](https://console.groq.com) |
| `GROQ_API_KEY_2` | Backup Groq LLM key | Same console |
| `GEMINI_API_KEY` | Fallback Gemini key | [Google AI Studio](https://aistudio.google.com) |

**Frontend** (`frontend/.env`):
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` (local) or `https://your-app.onrender.com/api/v1` (production) |

---

## ⚡ Quick Start — Running in Browser Locally (Manual)

Follow these quick commands to launch EduPilot AI locally in your browser without Docker:

### Step 1: Start Backend API (Terminal 1)
```bash
cd backend
python -m venv .venv

# Activate Virtual Environment:
# On Git Bash / Linux / macOS:
source .venv/Scripts/activate

# On Windows PowerShell:
# .venv\Scripts\Activate.ps1

# On Windows Command Prompt (cmd):
# .venv\Scripts\activate.bat

pip install -e .
uvicorn app.main:app --reload --port 8000
```
> 🌐 **Backend API**: `http://localhost:8000` (OpenAPI Swagger Docs: `http://localhost:8000/api/docs`)

---

### Step 2: Start Frontend Web Portal (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
> 💻 **Web Application Portal**: Open **`http://localhost:5173`** (or `http://localhost:5174`) in your browser.

---

### 🔑 Step 3: Log In with Quick Demo Faculty Credentials
On the login screen, click any of the **Quick Demo Faculty Cards** to pre-fill credentials instantly (or use password `demo@1234`):

| # | Faculty Name | Designation & Specialization | Institutional Email | Demo Password |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Prof. Rajesh Banerjee** | Associate Professor • Algorithms & Data Structures | `rajesh.banerjee@edupilot.ai` | `demo@1234` |
| **2** | **Prof. Priya Nair** | Assistant Professor • Database Systems & Mining | `priya.nair@edupilot.ai` | `demo@1234` |
| **3** | **Prof. Amitava Chatterjee** | Professor • AI & Machine Learning | `amitava.chatterjee@edupilot.ai` | `demo@1234` |
| **4** | **Prof. Sunita Devi** | Assistant Professor • Networks & Security | `sunita.devi@edupilot.ai` | `demo@1234` |
| **5** | **Prof. Debashis Ghosh** | Associate Professor • OS & Cloud Computing | `debashis.ghosh@edupilot.ai` | `demo@1234` |
| **6** | **Prof. Meenakshi Iyer** | Assistant Professor • Software Engineering & Web | `meenakshi.iyer@edupilot.ai` | `demo@1234` |
| **7** | **Prof. Arpan Mukherjee** | Professor • Deep Learning & NLP | `arpan.mukherjee@edupilot.ai` | `demo@1234` |
| **8** | **Prof. Kavita Sharma** | Assistant Professor • Discrete Math & Structures | `kavita.sharma@edupilot.ai` | `demo@1234` |
| **9** | **Prof. Subhashis Roy** | Associate Professor • Blockchain & Security | `subhashis.roy@edupilot.ai` | `demo@1234` |
| **10** | **Prof. Ananya Sengupta** | Assistant Professor • IoT & Embedded Systems | `ananya.sengupta@edupilot.ai` | `demo@1234` |

---

## 🔗 Documentation & Quick Links

- 📐 **[Architecture Specifications](ARCHITECTURE.md)** — Complete Mermaid Diagrams & System Design
- 📘 **[Developer Instructions](INSTRUCTIONS.md)** — Step-by-Step API Secrets Guide, Code Principles & Deployment Guide
- ⚙️ **[Backend API Engine](backend/README.md)** — FastAPI Framework & Database Architecture
- 🎨 **[Frontend README](frontend/README.md)** — React 18 + Vite Portal Documentation
- 📄 **[MIT License](LICENSE)** — Software Licensing Information

---

## 🌟 Product Identity & Vision

**EduPilot AI** is an intelligent academic operational layer designed for higher education institutions globally. 

It unifies daily teaching workflows, institutional data, AI copilot intelligence, attendance automation, coursework generation, and communication into a single unified platform.

> 💡 **Core Principle**: AI assists; the teacher remains the final authority.

---

## 🔥 Key System Capabilities

- 📊 **Teacher Command Center**: Instant visibility into daily routine, pending attendance, grading tasks, and at-risk students with skeleton loaders and staggered animations.
- 🎯 **Smooth Class/Year Switching**: Changing year and class context updates all pages simultaneously with smooth framer-motion transitions, grouped-by-year dropdown, and animated content re-rendering.
- 📝 **Interactive Attendance Module**: One-click attendance taking with real-time risk alerts for attendance below 75%.
- 🤖 **Context-Aware EduPilot AI & Smart Model Router**: Dual Groq primary LLM execution for fast standard text chat, automatic Gemini 1.5 Flash Vision routing for image/file upload analysis, and local RapidOCR (`rapidocr-onnxruntime`) for pure Python offline text extraction without any external C++ dependencies.
- 🎨 **Adaptive Brand UI & Custom Favicon**: Features the official `brand_logo.png` favicon, enlarged sidebar/header logos, and seamless dark/light mode toggle with theme persistence across the entire portal including the login page.
- 🚪 **Streamlined Portal Navigation & Logout**: Logout instantly clears class session state and redirects to `/login` with a light/dark themed spinner loading fallback, skipping repeat neural intro animations within the same browser session.
- 📈 **Class Analytics**: Real-time grade distributions and attendance trends rendered via accessible charts with loading skeletons.
- 🎓 **Teacher Profile Photos**: Teachers can upload JPG, PNG, or WebP profile photos up to 5 MB; the photo is stored by the backend and shared across the profile and dashboard.
- 🎯 **Class-Linked Performance**: Attendance and assessment analytics are calculated only from records belonging to the selected class; classes without records show a clear empty state.
- 📄 **Professional PDF Downloads (jsPDF)**: Generate and download professionally branded university PDFs for quizzes, assessment reports, class reports, and daily notes — all from the Document Studio.
- 📓 **Daily Topic Discussion Notes**: Teachers generate structured notes for topics discussed in class, then share to all students via email in one click.
- 📧 **Student University Mail System**: Teacher-side communications hub with student email directory, template-based email composer, bulk send to all/selected students, and sent history.
- 👥 **720 Unique Student Dataset**: Full B.Tech CSE dataset across 4 academic years and 3 sections per year with complete unique identities and `@student.university.edu` demo emails.

---

## ⚡ Technical Stack Overview

### 🐍 Backend Architecture

- **Framework**: Python 3.11+ & FastAPI 0.115
- **Database**: MongoDB / Atlas & PyMongo
- **Security**: JWT Access/Refresh tokens + direct bcrypt password hashing
- **AI Engine & Router**: Smart Model Router with Groq API (`llama-3.3-70b-versatile` Dual Primary Keys) & Google Gemini (`gemini-1.5-flash` Vision)
- **Image OCR Engine**: Local RapidOCR (`rapidocr-onnxruntime`) for pure Python offline text extraction (zero C++ / Tesseract setup)
- **Vector RAG Engine**: HuggingFace `all-MiniLM-L6-v2` embeddings & MongoDB vector search / cosine similarity
- **Communications**: Integrated Teacher-Student Mail Engine & Gmail SMTP Integration
- **Keep-Alive Self-Ping**: Built-in background task pings `/api/health` every 13 minutes in production to prevent Render free tier cold starts

### ⚛️ Frontend Architecture

- **Framework**: React 18 + Vite 5 + TypeScript 5
- **Styling**: Tailwind CSS (Brand Blue `#0060B5` & Green `#8CC63F`)
- **UI Components**: Accessible Lucide React icons & Recharts visualizations
- **Animations**: Framer Motion for page transitions, staggered card animations, and smooth class switching
- **PDF Generation**: jsPDF + jspdf-autotable for client-side professional PDF creation with institutional branding
- **State & Data**: React Context API & Axios HTTP Client

---

## 💡 Future Implementation Roadmap & Suggestions

The following features and enhancements are recommended for future releases:

1. **RAG-Enhanced Daily Notes Generation**:
   - Integrate vector embeddings for syllabus documents so daily notes generated by EduPilot AI automatically align with official curriculum outcomes.
2. **Automated Cron Email Warnings**:
   - Implement scheduled background triggers that automatically email attendance warnings to students as soon as their attendance drops below 75%.
3. **Voice Audio Dictation for Post-Lecture Notes**:
   - Add a speech-to-text recording interface allowing teachers to dictate lecture summaries after class, auto-converting spoken audio into structured discussion notes.
4. **Multi-Format Presentation & Excel Export**:
   - Expand the Document Studio to generate PowerPoint slides (`.pptx`) and Excel marksheets (`.xlsx`) alongside PDFs.
5. **Student Portal Read-Only View**:
   - Provide a lightweight student portal where students log in with their roll numbers to review daily notes, check attendance percentages, and view announcements.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:8CC63F,100:0060B5&height=120&section=footer" alt="Footer Banner" width="100%" />
</p>
