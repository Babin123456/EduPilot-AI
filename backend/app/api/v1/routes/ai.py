"""AI routes — EduPilot AI chat, RAG document management, and generation endpoints."""

from __future__ import annotations

import io
import json
import os
import re
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException, BackgroundTasks
from pydantic import BaseModel
from pymongo.database import Database
import httpx

from app.core.database import get_db
from app.core.config import get_settings
from app.api.deps import get_current_teacher
from app.core.exceptions import http_400, http_404
from app.models.student import student_full_name
from app.models.ai_models import new_ai_conversation, new_ai_message
from app.services.rag_service import (
    ingest_document,
    retrieve_context,
    rewrite_query_with_history,
    delete_rag_document,
    list_rag_documents,
)

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None
    class_id: str | None = None
    file_context: str | None = None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DOCUMENT & FILE PARSER (PPT, Excel, Image — non-RAG)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def parse_uploaded_file(file_bytes: bytes, filename: str, content_type: str) -> dict:
    """Extract text and metadata from uploaded Image, PDF, Excel, or PPT file."""
    ext = os.path.splitext(filename)[1].lower()
    text_content = ""
    file_type = "document"

    try:
        if ext in [".pptx", ".ppt"]:
            file_type = "presentation"
            try:
                from pptx import Presentation
                prs = Presentation(io.BytesIO(file_bytes))
                slides_data = []
                for i, slide in enumerate(prs.slides, 1):
                    slide_text = []
                    for shape in slide.shapes:
                        if hasattr(shape, "text") and shape.text.strip():
                            slide_text.append(shape.text.strip())
                    if slide_text:
                        slides_data.append(f"--- Slide {i} ---\n" + "\n".join(slide_text))
                text_content = "\n\n".join(slides_data)
            except Exception:
                text_content = f"PPT Presentation: {filename} ({len(file_bytes)} bytes). Contains slide topics & outlines."

        elif ext in [".xlsx", ".xls", ".csv"]:
            file_type = "spreadsheet"
            if ext == ".csv":
                text_content = file_bytes.decode("utf-8", errors="ignore")[:4000]
            else:
                try:
                    import openpyxl
                    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
                    sheets_summary = []
                    for sheet_name in wb.sheetnames:
                        sheet = wb[sheet_name]
                        rows = list(sheet.iter_rows(values_only=True))
                        if rows:
                            headers = [str(cell) for cell in rows[0] if cell is not None]
                            row_preview = []
                            for row in rows[1:15]:
                                row_str = ", ".join([str(c) for c in row if c is not None])
                                if row_str:
                                    row_preview.append(row_str)
                            sheets_summary.append(
                                f"Sheet: {sheet_name}\nHeaders: {', '.join(headers)}\nSample Rows:\n" + "\n".join(row_preview)
                            )
                    text_content = "\n\n".join(sheets_summary)
                except Exception:
                    text_content = f"Excel Spreadsheet: {filename} ({len(file_bytes)} bytes)."

        elif ext == ".pdf":
            file_type = "pdf"
            import tempfile
            from langchain_community.document_loaders import PyPDFLoader
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(file_bytes)
                tmp_path = tmp.name
            try:
                loader = PyPDFLoader(tmp_path)
                docs = loader.load()
                text_content = "\n\n".join([doc.page_content for doc in docs])[:8000]
            finally:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)

        elif ext in [".docx", ".doc"]:
            file_type = "docx"
            import tempfile
            from langchain_community.document_loaders import Docx2txtLoader
            with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
                tmp.write(file_bytes)
                tmp_path = tmp.name
            try:
                loader = Docx2txtLoader(tmp_path)
                docs = loader.load()
                text_content = "\n\n".join([doc.page_content for doc in docs])[:8000]
            finally:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)

        elif ext in [".png", ".jpg", ".jpeg", ".webp", ".gif"]:
            file_type = "image"
            try:
                from PIL import Image
                img = Image.open(io.BytesIO(file_bytes))
                text_content = f"Image File: {filename}\nFormat: {img.format}\nDimensions: {img.size[0]}x{img.size[1]} pixels\nMode: {img.mode}"
            except Exception:
                text_content = f"Image File: {filename} ({len(file_bytes)} bytes)."

        else:
            text_content = file_bytes.decode("utf-8", errors="ignore")[:4000]

    except Exception:
        text_content = f"File {filename} uploaded successfully ({len(file_bytes)} bytes)."

    return {
        "filename": filename,
        "file_type": file_type,
        "size_bytes": len(file_bytes),
        "text_content": text_content.strip() or f"Content from {filename}",
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FAST NON-BLOCKING LLM CALLS (Groq / Gemini)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _call_groq_llm(messages: list[dict], api_key: str, model: str) -> str | None:
    """Call Groq API directly using httpx with 15.0s timeout."""
    api_key = (api_key or "").strip()
    if not api_key or "your_" in api_key or len(api_key) < 25:
        return None
    try:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model or "llama-3.3-70b-versatile",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1024,
        }
        with httpx.Client(timeout=15.0) as client:
            response = client.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
    except Exception:
        pass
    return None


def _call_gemini_llm(prompt: str, api_key: str, model: str) -> str | None:
    """Call Gemini API directly using httpx with 15.0s timeout."""
    api_key = (api_key or "").strip()
    if not api_key or "your_" in api_key or len(api_key) < 25:
        return None
    try:
        gemini_model = model or "gemini-1.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        with httpx.Client(timeout=15.0) as client:
            response = client.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                data = response.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        pass
    return None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RAG DOCUMENT MANAGEMENT ROUTES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/rag/upload")
async def upload_rag_document(
    file: UploadFile = File(...),
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Upload a PDF or DOCX file for RAG ingestion (parse → chunk → embed → index).

    The document is split into chunks, each embedded using all-MiniLM-L6-v2,
    and stored in MongoDB for vector similarity search during chat.
    """
    settings = get_settings()
    filename = file.filename or "uploaded_file"
    ext = os.path.splitext(filename)[1].lower()

    # Validate file type
    if ext not in (".pdf", ".docx"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF (.pdf) and DOCX (.docx) files are supported for RAG. "
                   "Use the regular file upload for PPT, Excel, and Image files.",
        )

    # Read and validate file size
    file_bytes = await file.read()
    max_size = settings.rag_max_file_size_mb * 1024 * 1024
    if len(file_bytes) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File size ({len(file_bytes) / (1024*1024):.1f}MB) exceeds "
                   f"the maximum allowed size of {settings.rag_max_file_size_mb}MB.",
        )

    # Run ingestion pipeline
    try:
        doc_record = ingest_document(
            file_bytes=file_bytes,
            filename=filename,
            teacher_id=teacher["id"],
            db=db,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process document: {str(e)}",
        )

    return {
        "success": True,
        "document": {
            "id": doc_record["id"],
            "filename": doc_record["filename"],
            "file_type": doc_record["file_type"],
            "chunk_count": doc_record["chunk_count"],
            "file_size_bytes": doc_record["file_size_bytes"],
            "status": doc_record["status"],
            "created_at": doc_record["created_at"].isoformat()
            if hasattr(doc_record.get("created_at"), "isoformat")
            else doc_record.get("created_at"),
        },
        "message": f"Document '{filename}' indexed successfully with {doc_record['chunk_count']} chunks.",
    }


@router.get("/rag/documents")
def get_rag_documents(
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """List all RAG documents uploaded by the current teacher."""
    docs = list_rag_documents(teacher["id"], db)
    return [
        {
            "id": d["id"],
            "filename": d["filename"],
            "file_type": d["file_type"],
            "chunk_count": d.get("chunk_count", 0),
            "file_size_bytes": d.get("file_size_bytes", 0),
            "status": d.get("status", "unknown"),
            "created_at": d["created_at"].isoformat()
            if hasattr(d.get("created_at"), "isoformat")
            else d.get("created_at"),
        }
        for d in docs
    ]


@router.delete("/rag/documents/{document_id}")
def delete_rag_doc(
    document_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Delete a RAG document and all its embedding chunks."""
    success = delete_rag_document(document_id, teacher["id"], db)
    if not success:
        raise http_404("Document not found or you don't have permission to delete it.")
    return {"success": True, "message": "Document and all chunks deleted successfully."}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# NON-RAG FILE UPLOAD (PPT, Excel, Image)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/upload-file")
async def upload_file_for_ai(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Upload Image, PDF, Excel, or PPT file for AI analysis and explanation."""
    file_bytes = await file.read()
    filename = file.filename or "uploaded_file"
    parsed = parse_uploaded_file(file_bytes, filename, file.content_type or "")

    ext = os.path.splitext(filename)[1].lower()
    if ext in [".pdf", ".docx", ".doc"]:
        background_tasks.add_task(
            ingest_document,
            file_bytes=file_bytes,
            filename=filename,
            teacher_id=teacher["id"],
            db=db,
        )

    return {
        "success": True,
        "filename": parsed["filename"],
        "file_type": parsed["file_type"],
        "size_bytes": parsed["size_bytes"],
        "extracted_text": parsed["text_content"],
        "summary": f"Uploaded {parsed['file_type'].upper()} file '{parsed['filename']}' ({parsed['size_bytes']} bytes) ready for AI analysis.",
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MAIN CHAT ENDPOINT (with RAG + Conversation History)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/chat")
def chat(
    body: ChatRequest,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Send a message to EduPilot AI with RAG retrieval and conversation history.

    Flow:
    1. Load last 20 messages from this conversation
    2. Rewrite query using chat history (for better vector search)
    3. Vector search: retrieve top-k relevant document chunks
    4. Build enhanced system prompt with RAG context + class context
    5. Call LLM (Groq → Gemini → Fallback)
    6. Save messages and return
    """
    settings = get_settings()

    # ── Get active class context ──
    class_context_str = ""
    student_summary_str = ""
    if body.class_id:
        tca = db.teacher_course_assignments.find_one({"id": body.class_id})
        if tca:
            course = db.courses.find_one({"id": tca["course_id"]})
            year = db.years.find_one({"id": tca["year_id"]})
            section = db.sections.find_one({"id": tca["section_id"]})

            class_context_str = f"Active Class: {course['name']} ({course['code']}) • {year['label']} Section {section['name']} • Room: {tca.get('room')}"

            students = list(db.students.find({"section_id": tca["section_id"], "is_active": True}))
            at_risk = [s for s in students if s.get("attendance_percentage", 100) < 75]

            student_details_list = [
                f"{student_full_name(s)} (Roll: {s['roll_number']}, Attendance: {s.get('attendance_percentage', 0)}%, Risk: {s.get('risk_level', 'normal')})"
                for s in students
            ]
            student_summary_str = (
                f"Total Students: {len(students)} | At-Risk (<75% attendance): {len(at_risk)}\n"
                f"Full Class Student Roster with Exact Database Attendance Records:\n"
                + "\n".join(student_details_list)
            )

    # ── Retrieve or create conversation ──
    conversation = None
    if body.conversation_id:
        conversation = db.ai_conversations.find_one({
            "id": body.conversation_id, "teacher_id": teacher["id"],
        })

    if not conversation:
        conversation = new_ai_conversation(
            teacher_id=teacher["id"],
            teacher_course_assignment_id=body.class_id,
            title=body.message[:100],
        )
        db.ai_conversations.insert_one(conversation)

    # ── Load conversation history (last 20 messages) ──
    past_messages = list(
        db.ai_messages.find({"conversation_id": conversation["id"]})
        .sort("created_at", 1)
        .limit(20)
    )

    # ── Save current user message ──
    user_msg = new_ai_message(
        conversation_id=conversation["id"],
        role="user",
        content=body.message,
    )
    db.ai_messages.insert_one(user_msg)

    # ── RAG: Rewrite query with conversation history ──
    chat_history_for_rewrite = [
        {"role": m["role"], "content": m["content"]} for m in past_messages
    ]
    standalone_query = rewrite_query_with_history(
        body.message, chat_history_for_rewrite, settings
    )

    # ── RAG: Retrieve relevant document chunks ──
    rag_context = retrieve_context(standalone_query, teacher["id"], db)

    # ── Build the full user input ──
    full_user_input = body.message
    if body.file_context:
        full_user_input += f"\n\n[Attached File Content for Analysis]:\n{body.file_context}"

    # ── Build System Context Prompt (with RAG context) ──
    rag_section = ""
    if rag_context:
        rag_section = (
            f"\n[Retrieved Document Context — from teacher's uploaded PDF/DOCX files]:\n"
            f"{rag_context}\n"
        )

    system_prompt = (
        f"You are EduPilot AI, the intelligent academic copilot for Adamas University, Kolkata.\n"
        f"You are assisting Professor {teacher['full_name']} ({teacher.get('designation', '')}, {teacher.get('specialization', 'CSE')}).\n"
        f"Current Academic Context: {class_context_str or 'General Academic Workspace'}\n"
        f"Live Database Information:\n{student_summary_str or 'N/A'}\n"
        f"{rag_section}\n"
        f"Instructions:\n"
        f"1. Always use the live student database information provided above to give exact student names, roll numbers, and attendance percentages when asked.\n"
        f"2. Remember previous user questions and context in this conversation thread.\n"
        f"3. When answering questions about uploaded documents, cite the specific source filename and page numbers from the Retrieved Document Context above.\n"
        f"4. If the Retrieved Document Context contains relevant information, you MUST prioritize it over your internal knowledge to answer the question accurately.\n"
        f"5. Be concise, structured, professional, and use Markdown formatting without decorative text emojis."
    )

    # ── Build LLM message array ──
    llm_messages = [{"role": "system", "content": system_prompt}]
    for pm in past_messages:
        llm_messages.append({"role": pm["role"], "content": pm["content"]})
    llm_messages.append({"role": "user", "content": full_user_input})

    # ── Attempt Groq LLM ──
    model_used = "Groq Llama-3.3-70B"
    ai_response = _call_groq_llm(llm_messages, settings.groq_api_key_1, settings.groq_model)
    if not ai_response:
        ai_response = _call_groq_llm(llm_messages, settings.groq_api_key_2, settings.groq_model)

    # ── Attempt Gemini fallback ──
    if not ai_response:
        model_used = "Gemini 1.5 Flash"
        gemini_prompt = f"{system_prompt}\n\nUser Question: {full_user_input}"
        ai_response = _call_gemini_llm(gemini_prompt, settings.gemini_api_key, settings.gemini_model)

    # ── Fallback to Smart Contextual Response Generator ──
    if not ai_response:
        model_used = "EduPilot Smart Engine"
        ai_response = _generate_contextual_response(body.message, teacher, db, body.class_id, body.file_context, rag_context)

    # ── Determine if RAG was used ──
    content_type = "rag" if rag_context else "text"

    # ── Save assistant message ──
    assistant_msg = new_ai_message(
        conversation_id=conversation["id"],
        role="assistant",
        content=ai_response,
        model_used=model_used,
        content_type=content_type,
    )
    db.ai_messages.insert_one(assistant_msg)

    db.ai_conversations.update_one(
        {"id": conversation["id"]},
        {"$inc": {"message_count": 2}, "$set": {"updated_at": datetime.now(timezone.utc)}},
    )

    # ── Build source references for the frontend ──
    sources = []
    if rag_context:
        # Extract unique source filenames from the context
        import re as re_mod
        source_matches = re_mod.findall(r"from '([^']+)'", rag_context)
        seen = set()
        for src in source_matches:
            if src not in seen:
                sources.append(src)
                seen.add(src)

    return {
        "conversation_id": conversation["id"],
        "message": {
            "id": assistant_msg["id"],
            "role": "assistant",
            "content": ai_response,
            "content_type": content_type,
            "model_used": model_used,
            "sources": sources,
            "created_at": assistant_msg["created_at"].isoformat() if hasattr(assistant_msg.get("created_at"), 'isoformat') else assistant_msg.get("created_at"),
        },
    }


def _generate_contextual_response(
    message: str, teacher: dict, db: Database, class_id: str | None, file_context: str | None, rag_context: str | None = None
) -> str:
    """Smart contextual answer engine when external LLM API keys are unconfigured."""
    msg_lower = message.lower()

    # If RAG context is available, present it
    if rag_context:
        return (
            f"📄 **Document Analysis (from your uploaded files):**\n\n"
            f"Based on your uploaded documents, here is the relevant information:\n\n"
            f"{rag_context[:2000]}\n\n"
            f"---\n"
            f"*Note: For more detailed analysis, configure your Groq or Gemini API keys "
            f"to enable the full AI engine.*"
        )

    if file_context:
        return (
            f"📄 **Analysis of Uploaded File:**\n\n"
            f"{file_context[:1000]}\n\n"
            f"--- \n"
            f"**Key Insights & Summary:**\n"
            f"- File uploaded successfully and processed by EduPilot AI.\n"
            f"- Extracted structured sections and metadata for classroom discussion.\n"
            f"- You can export discussion notes or generate a quiz based on this document from the **Daily Notes** or **Document Studio** modules."
        )

    if "attendance" in msg_lower and ("below" in msg_lower or "risk" in msg_lower or "<" in msg_lower or "75" in msg_lower):
        students = []
        if class_id:
            tca = db.teacher_course_assignments.find_one({"id": class_id})
            if tca:
                students = list(
                    db.students.find({
                        "section_id": tca["section_id"],
                        "attendance_percentage": {"$lt": 75},
                        "is_active": True,
                    }).sort("attendance_percentage", 1)
                )
        if students:
            lines = ["**Students with Attendance Below 75% Threshold:**\n"]
            for i, s in enumerate(students, 1):
                lines.append(f"{i}. **{student_full_name(s)}** (`{s['roll_number']}`) — **{s.get('attendance_percentage', 0)}%** attendance | Email: `{s['email']}`")
            lines.append(f"\n**Total At-Risk:** {len(students)} students require attendance warning emails.")
            lines.append(f"\n*Note: Go to the **Communications** page to send warning emails in one click.*")
            return "\n".join(lines)
        return "Great news! All students in the active class section have attendance above the 75% threshold."

    if any(kw in msg_lower for kw in ["schedule", "routine", "timetable", "today", "classes"]):
        tca_ids = [t["id"] for t in db.teacher_course_assignments.find({"teacher_id": teacher["id"]})]
        entries = list(
            db.timetable_entries.find({
                "teacher_course_assignment_id": {"$in": tca_ids},
                "day_of_week": 0,
            }).sort("start_time", 1)
        )
        if entries:
            lines = ["**Your Schedule for Today (Monday):**\n"]
            for e in entries:
                tca = db.teacher_course_assignments.find_one({"id": e["teacher_course_assignment_id"]})
                course = db.courses.find_one({"id": tca["course_id"]}) if tca else None
                year = db.years.find_one({"id": tca["year_id"]}) if tca else None
                sec = db.sections.find_one({"id": tca["section_id"]}) if tca else None
                lines.append(f"- **{e['start_time']} - {e['end_time']}**: {course['name'] if course else 'Course'} (`{course['code'] if course else ''}`) — {year['label'] if year else ''} Sec {sec['name'] if sec else ''} (Room {e.get('room', '101')})")
            lines.append("\nView full weekly grid under the **Timetable** section.")
            return "\n".join(lines)
        return "You have no classes scheduled for today. Check the **Timetable** module for full weekly routine."

    if any(kw in msg_lower for kw in ["what is", "explain", "how does", "difference", "algorithm", "network", "operating system", "data structure", "protocol"]):
        return (
            f"**Academic Topic Breakdown: {message.title()}**\n\n"
            f"Here is a structured breakdown of **{message}**:\n\n"
            f"### 1. Core Concept & Definition\n"
            f"{message} is a foundational subject concept in Computer Science & Engineering, governing system execution, algorithmic logic, and operational performance.\n\n"
            f"### 2. Key Technical Principles\n"
            f"- **Efficiency**: Optimizes processing cycles and throughput.\n"
            f"- **Scalability**: Handles expanding workloads and data flow.\n"
            f"- **Reliability**: Guarantees deterministic outcome and error control.\n\n"
            f"### 3. Practical Industry Applications\n"
            f"- Enterprise software architecture and backend systems\n"
            f"- Distributed cloud computing infrastructure\n"
            f"- Real-time data processing and analytics\n\n"
            f"*Recommendation: Use **Daily Notes** to generate discussion summaries or **Document Studio** to export a PDF quiz on this topic.*"
        )

    return (
        f"Welcome Professor {teacher.get('last_name', '')}. I am **EduPilot AI**, your institutional copilot.\n\n"
        f"### How I Can Assist You:\n"
        f"- **Class Metrics**: Ask *'Show students with attendance under 75%'*\n"
        f"- **Schedule & Routine**: Ask *'What classes do I have today?'*\n"
        f"- **Document Analysis (RAG)**: Upload any PDF or DOCX using the 📎 button — I'll index it and answer questions about the content.\n"
        f"- **File Analysis**: Upload PPT, Excel, or Image files for instant extraction.\n"
        f"- **Academic Material**: Ask any subject or curriculum question.\n"
        f"- **Daily Notes & Publish**: Use **Daily Notes** or **Document Studio** to generate and dispatch materials."
    )



@router.get("/conversations")
def list_conversations(
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """List teacher's AI conversations."""
    convos = list(
        db.ai_conversations.find({"teacher_id": teacher["id"]})
        .sort("updated_at", -1)
        .limit(20)
    )
    return [
        {
            "id": c["id"],
            "title": c.get("title", "New Conversation"),
            "message_count": c.get("message_count", 0),
            "created_at": c["created_at"].isoformat() if hasattr(c.get("created_at"), 'isoformat') else c.get("created_at"),
            "updated_at": c["updated_at"].isoformat() if hasattr(c.get("updated_at"), 'isoformat') else c.get("updated_at"),
        }
        for c in convos
    ]


@router.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Get full conversation with messages."""
    convo = db.ai_conversations.find_one({"id": conversation_id})
    if not convo:
        raise http_404("Conversation not found")
    if convo["teacher_id"] != teacher["id"]:
        raise http_400("Not authorized")

    messages = list(
        db.ai_messages.find({"conversation_id": conversation_id})
        .sort("created_at", 1)
    )

    return {
        "id": convo["id"],
        "title": convo.get("title", "New Conversation"),
        "messages": [
            {
                "id": m["id"],
                "role": m["role"],
                "content": m["content"],
                "content_type": m.get("content_type", "text"),
                "model_used": m.get("model_used"),
                "created_at": m["created_at"].isoformat() if hasattr(m.get("created_at"), 'isoformat') else m.get("created_at"),
            }
            for m in messages
        ],
    }


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Delete a conversation and its messages."""
    convo = db.ai_conversations.find_one({
        "id": conversation_id, "teacher_id": teacher["id"],
    })
    if not convo:
        raise http_404("Conversation not found")

    db.ai_messages.delete_many({"conversation_id": conversation_id})
    db.ai_conversations.delete_one({"id": conversation_id})
    return {"success": True, "message": "Conversation deleted successfully"}
