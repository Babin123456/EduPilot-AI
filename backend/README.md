<!-- markdownlint-disable -->
<div align="center">

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0060B5,100:8CC63F&height=180&section=header&text=Backend%20API%20Engine&fontSize=45&fontColor=ffffff&fontAlign=50&fontAlignY=38" alt="Header Banner" width="100%" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3000&pause=1000&color=8CC63F&center=true&vCenter=true&width=650&lines=Python+FastAPI+REST+Framework;PyMongo+%E2%80%A2+MongoDB+Atlas;Groq+Dual+Keys+%2B+Gemini+Fallback+Router" alt="Typing SVG" />
</p>

---

</div>

> 🐍 Python FastAPI REST Backend & AI Orchestration Layer

---

## 💡 Overview

The backend service powers EduPilot AI using FastAPI and MongoDB (PyMongo). It manages data access for 720 unique students, teacher authentication, class scheduling, attendance persistence, profile photo uploads, teacher personal file storage, RAG document library chunking & indexing, local offline image OCR via RapidOCR (`rapidocr-onnxruntime`), and smart task-based LLM query routing using Groq (primary for fast chat) and Gemini (primary for image/file vision analysis & fallback).

---

## ⚙️ Key Technologies

- 🐍 **Python 3.11+**
- ⚡ **FastAPI 0.115**
- 🍃 **MongoDB & PyMongo**
- 🔐 **JWT Authentication** (`python-jose`, `passlib`, `bcrypt`)
- 🤖 **Groq & Google Gemini APIs** (Smart Model Router)
- 👁️ **RapidOCR (`rapidocr-onnxruntime`)** (Pure Python offline image OCR — no Tesseract C++ required)
- 📚 **RAG Indexing & PyPDF / python-docx Parsing**

## 📊 Analytics, RAG & File APIs

- `GET /api/v1/analytics/classes/{class_id}/overview` returns attendance and assessment metrics scoped to the selected teacher class.
- `GET /api/v1/ai/rag/documents` & `POST /api/v1/ai/rag/upload` manages and indexes PDF/DOCX course materials for AI retrieval.
- `GET /api/v1/personal-files` & `POST /api/v1/personal-files/upload` manages teacher personal document storage.
- `PATCH /api/v1/auth/me` updates teacher profile details and avatar URL.
- `POST /api/v1/auth/me/avatar` accepts JPG, PNG, or WebP uploads up to 5 MB and returns the stored profile-photo URL.

---

## 🚀 Setup & Run Instructions

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

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:8CC63F,100:0060B5&height=100&section=footer" alt="Footer Banner" width="100%" />
</p>
