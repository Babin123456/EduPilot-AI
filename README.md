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
On the login screen, click any of the **Quick Demo Faculty Cards** to pre-fill credentials instantly, then click **Sign In to Portal**:
- 👨‍🏫 **Prof. Rajesh Banerjee**: `rajesh.banerjee@adamasuniversity.ac.in` / Password: `demo@1234`
- 👩‍🏫 **Prof. Priya Nair**: `priya.nair@adamasuniversity.ac.in` / Password: `demo@1234`

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
- 📄 **Professional PDF Downloads (jsPDF)**: Generate and download professionally branded Adamas University PDFs for quizzes, assessment reports, class reports, and daily notes — all from the Document Studio.
- 📓 **Daily Topic Discussion Notes**: Teachers generate structured notes for topics discussed in class, then share to all students via email in one click.
- 📧 **Student University Mail System**: Teacher-side communications hub with student email directory, template-based email composer, bulk send to all/selected students, and sent history.
- 👥 **720 Unique Student Dataset**: Full B.Tech CSE dataset across 4 academic years and 3 sections per year with complete unique identities and `@student.adamasuniversity.ac.in` demo emails.

---

## ⚡ Technical Stack Overview

### 🐍 Backend Architecture

- **Framework**: Python 3.11+ & FastAPI 0.115
- **Database**: SQLite with `aiosqlite` and WAL Mode enabled
- **Security**: JWT Access/Refresh tokens + bcrypt password hashing
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

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:8CC63F,100:0060B5&height=120&section=footer" alt="Footer Banner" width="100%" />
</p>
