# 🎓 EduPilot AI — System Architecture & Workflow Specifications

> AI Academic Operating System tailored for Adamas University

---

## 🚀 High-Level System Architecture

```mermaid
flowchart LR
    T[Teacher User] --> FE[React + Vite Teacher Portal]

    FE --> API[FastAPI REST API Layer]

    API --> AUTH[Authentication & Authorization Guard]
    API --> CORE[EduPilot Core Orchestrator]
    API --> SERVICES[Academic Services]

    SERVICES --> DB[(SQLite / PostgreSQL)]
    SERVICES --> STORE[Local File Storage]

    CORE --> ROUTER[Intent & LLM Workflow Router]
    ROUTER --> GROQ[Groq LLM Primary: Dual Keys]
    ROUTER --> GEMINI[Gemini LLM Fallback]
    ROUTER --> RAG[RAG Retrieval Layer]

    RAG --> DB

    CORE --> DOC[Document Studio Engine]
    CORE --> COMM[Gmail SMTP Communication]

    DOC --> STORE
    COMM --> MAIL[Gmail SMTP Server]
    COMM --> WA[WhatsApp Sharing Workflow]

    API --> FE
```

---

## 🏛️ Academic Hierarchy & Student Placement

```mermaid
flowchart TD
    AU[Adamas University]
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

## 🔄 Teacher Daily Journey & Workflow

```mermaid
flowchart TD
    LOGIN[Teacher Authentication] --> DASH[Teacher Command Center]
    DASH --> ROUTINE[Review Today's Schedule]
    ROUTINE --> SELECT[Set Active Academic Context]
    SELECT --> ATTENDANCE[Take Class Attendance]
    ATTENDANCE --> PERSIST[(Save to SQLite Database)]
    PERSIST --> INSIGHTS[Automatic Risk & Analytics Update]
    INSIGHTS --> COPILOT[EduPilot AI Chat & Query Assistant]
    COPILOT --> GENERATE[Generate Quiz / Assignment / Lesson Plan]
    GENERATE --> STUDIO[Document Studio & PDF/PPTX Export]
    STUDIO --> COMM[Email / WhatsApp Distribution]
```
