# ⚙️ EduPilot AI — Backend API Engine

> Python FastAPI REST Backend & AI Orchestration Layer

---

## 📌 Overview

The backend service powers EduPilot AI using FastAPI, SQLAlchemy, and SQLite WAL mode. It manages data access for 720 unique students, teacher authentication, class scheduling, attendance persistence, and context-aware LLM query routing using Groq (dual primary keys) and Gemini (fallback).

---

## 🛠️ Key Technologies

- **Python 3.11+**
- **FastAPI 0.115**
- **SQLAlchemy 2.0 ORM**
- **SQLite** with `aiosqlite` and WAL Mode
- **JWT Authentication** (`python-jose`, `passlib`, `bcrypt`)
- **Groq & Google Gemini APIs**

---

## ⚡ Setup & Run Instructions

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

pip install -e .
uvicorn app.main:app --reload --port 8000
```

Refer to the main [INSTRUCTIONS.md](../INSTRUCTIONS.md) for full secret configuration.
