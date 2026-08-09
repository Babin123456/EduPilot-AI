<!-- markdownlint-disable -->
<div align="center">

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0060B5,100:8CC63F&height=220&section=header&text=EduPilot%20AI&fontSize=65&fontColor=ffffff&animation=fadeIn&fontAlign=50&fontAlignY=38&desc=AI%20Academic%20Operating%20System%20%E2%80%A2%20Adamas%20University&descFontSize=20&descAlign=50&descAlignY=62" alt="Header Banner" width="100%" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Outfit&weight=700&size=24&duration=3000&pause=1000&color=0060B5&center=true&vCenter=true&width=700&lines=Built+for+VibeForge+1.0+Hackathon;By+Team+Triangle+%E2%80%A2+Adamas+University;Empowering+Faculty+with+AI-Assisted+Classroom+Intelligence;Streamlined+Attendance%2C+Analytics+%26+Lesson+Planning" alt="Typing SVG" />
</p>

[![Hackathon](https://img.shields.io/badge/Hackathon-VibeForge%201.0-FF6B6B?style=for-the-badge&logo=rocket&logoColor=white)](https://adamasuniversity.ac.in)
[![Team](https://img.shields.io/badge/Team-Triangle-8CC63F?style=for-the-badge&logo=users&logoColor=slate)](https://github.com/Babin123456/EduPilot-AI)
[![Institution](https://img.shields.io/badge/Institution-Adamas%20University-0060B5?style=for-the-badge&logo=academic&logoColor=white)](https://adamasuniversity.ac.in)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&logo=open-source-initiative&logoColor=white)](LICENSE)

---

</div>

## 🏆 Hackathon Submission (VibeForge 1.0)

This project was crafted for **VibeForge 1.0 Hackathon** by **Team Triangle** from **Adamas University, Kolkata**:

| Role | Name | Institution |
| :--- | :--- | :--- |
| 👑 **Team Leader** | **Babin Bid** | Adamas University |
| 🛠️ **Team Member** | **Baibhab Adhikari** | Adamas University |
| 🚀 **Team Member** | **Subhajyoti Halder** | Adamas University |

---

## ⚡ Quick Start — Running in Browser Locally

Follow these quick commands to launch EduPilot AI locally in your browser:

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
| **1** | **Prof. Rajesh Banerjee** | Associate Professor • Algorithms & Data Structures | `rajesh.banerjee@adamasuniversity.ac.in` | `demo@1234` |
| **2** | **Prof. Priya Nair** | Assistant Professor • Database Systems & Mining | `priya.nair@adamasuniversity.ac.in` | `demo@1234` |
| **3** | **Prof. Amitava Chatterjee** | Professor • AI & Machine Learning | `amitava.chatterjee@adamasuniversity.ac.in` | `demo@1234` |
| **4** | **Prof. Sunita Devi** | Assistant Professor • Networks & Security | `sunita.devi@adamasuniversity.ac.in` | `demo@1234` |
| **5** | **Prof. Debashis Ghosh** | Associate Professor • OS & Cloud Computing | `debashis.ghosh@adamasuniversity.ac.in` | `demo@1234` |
| **6** | **Prof. Meenakshi Iyer** | Assistant Professor • Software Engineering & Web | `meenakshi.iyer@adamasuniversity.ac.in` | `demo@1234` |
| **7** | **Prof. Arpan Mukherjee** | Professor • Deep Learning & NLP | `arpan.mukherjee@adamasuniversity.ac.in` | `demo@1234` |
| **8** | **Prof. Kavita Sharma** | Assistant Professor • Discrete Math & Structures | `kavita.sharma@adamasuniversity.ac.in` | `demo@1234` |
| **9** | **Prof. Subhashis Roy** | Associate Professor • Blockchain & Security | `subhashis.roy@adamasuniversity.ac.in` | `demo@1234` |
| **10** | **Prof. Ananya Sengupta** | Assistant Professor • IoT & Embedded Systems | `ananya.sengupta@adamasuniversity.ac.in` | `demo@1234` |

---

## 🔗 Documentation & Quick Links

- 📐 **[Architecture Specifications](ARCHITECTURE.md)** — Complete Mermaid Diagrams & System Design
- 📘 **[Developer Instructions](INSTRUCTIONS.md)** — Step-by-Step API Secrets Guide, Code Principles & Deployment Guide
- ⚙️ **[Backend API Engine](backend/README.md)** — FastAPI Framework & Database Architecture
- 🎨 **[Frontend README](frontend/README.md)** — React 18 + Vite Portal Documentation
- 📄 **[MIT License](LICENSE)** — Software Licensing Information

---

## 🌟 Product Identity & Vision

**EduPilot AI** is an intelligent academic operational layer designed for higher education institutions, tailored for **Adamas University, Kolkata, West Bengal, India**. 

It unifies daily teaching workflows, institutional data, AI copilot intelligence, attendance automation, coursework generation, and communication into a single unified platform.

> 💡 **Core Principle**: AI assists; the teacher remains the final authority.

---

## 🔥 Key System Capabilities

- 📊 **Teacher Command Center**: Instant visibility into daily routine, pending attendance, grading tasks, and at-risk students with skeleton loaders and staggered animations.
- 🎯 **Smooth Class/Year Switching**: Changing year and class context updates all pages simultaneously with smooth framer-motion transitions, grouped-by-year dropdown, and animated content re-rendering.
- 📝 **Interactive Attendance Module**: One-click attendance taking with real-time risk alerts for attendance below 75%.
- 🤖 **Context-Aware EduPilot AI**: Dual Groq primary LLM execution with automatic Gemini fallback for student queries, lesson planning, and quiz generation.
- 📈 **Class Analytics**: Real-time grade distributions and attendance trends rendered via accessible charts with loading skeletons.
- 🎓 **Teacher Profile Photos**: Teachers can upload JPG, PNG, or WebP profile photos up to 5 MB; the photo is stored by the backend and shared across the profile and dashboard.
- 🎯 **Class-Linked Performance**: Attendance and assessment analytics are calculated only from records belonging to the selected class; classes without records show a clear empty state.
- 📄 **Professional PDF Downloads (jsPDF)**: Generate and download professionally branded Adamas University PDFs for quizzes, assessment reports, class reports, and daily notes — all from the Document Studio.
- 📓 **Daily Topic Discussion Notes**: Teachers generate structured notes for topics discussed in class, then share to all students via email in one click.
- 📧 **Student University Mail System**: Teacher-side communications hub with student email directory, template-based email composer, bulk send to all/selected students, and sent history.
- 👥 **720 Unique Student Dataset**: Full B.Tech CSE dataset across 4 academic years and 3 sections per year with complete unique identities and `@student.adamasuniversity.ac.in` demo emails.

---

## ⚡ Technical Stack Overview

### 🐍 Backend Architecture

- **Framework**: Python 3.11+ & FastAPI 0.115
- **Database**: SQLite with `aiosqlite` and WAL Mode enabled
- **Security**: JWT Access/Refresh tokens + direct bcrypt password hashing
- **AI Engine**: Groq API (Dual Primary Keys) & Google Gemini (Fallback)
- **Communications**: Gmail SMTP Integration

### ⚛️ Frontend Architecture

- **Framework**: React 18 + Vite 5 + TypeScript 5
- **Styling**: Tailwind CSS (Adamas University Brand Blue `#0060B5` & Green `#8CC63F`)
- **UI Components**: Accessible Lucide React icons & Recharts visualizations
- **Animations**: Framer Motion for page transitions, staggered card animations, and smooth class switching
- **PDF Generation**: jsPDF + jspdf-autotable for client-side professional PDF creation with university branding
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
