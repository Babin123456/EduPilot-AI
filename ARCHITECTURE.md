<!-- markdownlint-disable -->
<div align="center">

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0060B5,100:8CC63F&height=200&section=header&text=System%20Architecture&fontSize=50&fontColor=ffffff&fontAlign=50&fontAlignY=38" alt="Header Banner" width="100%" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3000&pause=1000&color=8CC63F&center=true&vCenter=true&width=650&lines=Visualizing+EduPilot+AI+Core+Engine;FastAPI+REST+%E2%80%A2+MongoDB+Atlas+%E2%80%A2+Groq%2FGemini+Pipeline;Multi-Layer+Academic+Workflow+Diagrams" alt="Typing SVG" />
</p>

---

</div>

> 🎓 Universal AI Academic Operating System

---

## 🚀 High-Level System Architecture

### Cloud Topology: Unified Vercel Platform & External Services

```mermaid
flowchart LR
    T[Teacher User] --> VERCEL[Vercel Serverless Edge Platform]
    
    subgraph VERCEL[Vercel Unified Serverless Platform]
        FE[React 18 + Vite SPA Portal]
        API[FastAPI REST API Serverless Layer]
    end

    FE -->|Relative /api/v1 calls| API

    API --> AUTH[JWT Auth Guard & Rate Limiter]
    API --> CORE[EduPilot Core AI Orchestrator]
    API --> SERVICES[Academic Domain Services]

    SERVICES --> DB[(MongoDB Atlas Cloud DB)]

    CORE --> ROUTER[Smart Multimodal LLM & Vision Router]
    ROUTER -->|Standard Text Chat| GROQ[Groq Dual Primary: Llama-3.3-70B]
    ROUTER -->|Image & Document Vision| GEMINI[Gemini 1.5 Flash Vision Cloud API]
    ROUTER -->|Vector Knowledge RAG| RAG[MongoDB Vector Search + Embeddings]

    GROQ -.->|Fallback| GEMINI
    GEMINI -.->|Fallback| GROQ

    RAG --> DB

    CORE --> DOC[Document Studio Engine]
    CORE --> COMM[Teacher-Student Communications Hub]
```

---

## 🤖 Smart Model Router Execution Flow

EduPilot AI uses an automated task-based routing pipeline to deliver ultra-fast responses and multimodal image comprehension:

| Input Type | Primary Model | Fallback Model | Capabilities |
| :--- | :--- | :--- | :--- |
| **Standard Text Chat** | **Groq Llama-3.3-70B** | Gemini 1.5 Flash | Sub-second response speed, curriculum Q&A, lesson planning |
| **Image / Document Upload** | **Gemini 1.5 Flash Vision** | Groq Llama-3.3-70B | Visual comprehension of handwriting, diagrams, equations, and textbook screenshots |
| **RAG Vector Search** | **MongoDB Vector Engine** | Local Keyword RAG | Custom institutional syllabus and uploaded PDF knowledge retrieval |

```
Standard Chat  ─────► Groq Llama-3.3-70B (Primary) ──► Fast 0.5s Text Answer
Image Upload   ─────► Gemini 1.5 Flash Vision      ──► Visual Comprehension & Answer
API Key Unset  ─────► EduPilot Local Smart Engine   ──► Fallback Contextual Response
```

## 👥 Academic Hierarchy & Student Placement

```mermaid
flowchart TD
    AU[Universal Academic Platform]
    AU --> SET[School of Engineering & Technology]
    SET --> BTECH[B.Tech Program]
    BTECH --> CSE[Computer Science & Engineering]

    CSE --> Y1[1st Year]
    CSE --> Y2[2nd Year]
    CSE --> Y3[3rd Year]
    CSE --> Y4[4th Year]

    Y1 --> Y1A[Section A: 60 Students]
    Y1 --> Y1B[Section B: 60 Students]
    Y1 --> Y1C[Section C: 60 Students]

    Y2 --> Y2A[Section A: 60 Students]
    Y2 --> Y2B[Section B: 60 Students]
    Y2 --> Y2C[Section C: 60 Students]

    Y3 --> Y3A[Section A: 60 Students]
    Y3 --> Y3B[Section B: 60 Students]
    Y3 --> Y3C[Section C: 60 Students]

    Y4 --> Y4A[Section A: 60 Students]
    Y4 --> Y4B[Section B: 60 Students]
    Y4 --> Y4C[Section C: 60 Students]
```

---

## ⏱️ Teacher Daily Journey & Workflow

```mermaid
flowchart TD
    LOGIN[Teacher Authentication] --> DASH[Teacher Command Center]
    DASH --> ROUTINE[Review Today's Schedule]
    ROUTINE --> SELECT[Set Active Academic Context]
    SELECT --> ATTENDANCE[Take Class Attendance]
    ATTENDANCE --> PERSIST[(Save to MongoDB Database)]
    PERSIST --> INSIGHTS[Automatic Risk & Analytics Update]
    INSIGHTS --> COPILOT[EduPilot AI Chat & Query Assistant]
    COPILOT --> GENERATE[Generate Quiz / Assignment / Lesson Plan]
    GENERATE --> STUDIO[Document Studio & PDF/PPTX Export]
    STUDIO --> COMM[Email Distribution]
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:8CC63F,100:0060B5&height=100&section=footer" alt="Footer Banner" width="100%" />
</p>
