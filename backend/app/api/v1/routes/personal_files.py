"""Personal file storage routes — upload, list, download, delete."""

from __future__ import annotations

import base64
import io
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Response
from fastapi.responses import FileResponse, StreamingResponse
from pymongo.database import Database

from app.api.deps import get_current_teacher
from app.core.config import get_settings
from app.core.database import get_db

router = APIRouter()

ALLOWED_EXTENSIONS = {
    ".pdf", ".docx", ".doc", ".csv", ".xlsx", ".xls",
    ".ppt", ".pptx", ".txt", ".png", ".jpg", ".jpeg", ".webp", ".gif"
}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB


def _personal_files_dir(teacher_id: str) -> Path:
    """Return (and create) the personal-files directory for a teacher."""
    settings = get_settings()
    base = Path(settings.storage_local_path).resolve() / "personal_files" / teacher_id
    base.mkdir(parents=True, exist_ok=True)
    return base


@router.post("/upload")
async def upload_personal_file(
    file: UploadFile = File(...),
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Upload a personal file to the teacher's private vault."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: PDF, DOCX, CSV, XLSX, PPT, TXT, Images.",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File must be smaller than 15 MB.")

    file_id = uuid.uuid4().hex
    safe_filename = f"{file_id}{ext}"

    # Try saving to disk
    try:
        dest = _personal_files_dir(teacher["id"]) / safe_filename
        dest.write_bytes(content)
    except Exception as exc:
        print(f"[PersonalFiles] Disk write warning: {exc}")

    # Base64 encode for database fallback (ensures availability in serverless environments)
    file_b64 = base64.b64encode(content).decode("utf-8")

    settings = get_settings()
    download_url = f"{settings.backend_url}/api/v1/personal-files/download/{file_id}"

    # Store metadata in MongoDB
    doc = {
        "id": file_id,
        "teacher_id": teacher["id"],
        "original_filename": file.filename,
        "stored_filename": safe_filename,
        "file_type": ext.lstrip("."),
        "file_size_bytes": len(content),
        "download_url": download_url,
        "file_b64": file_b64,
        "created_at": datetime.now(timezone.utc),
    }
    db.teacher_personal_files.insert_one(doc)

    # Auto-ingest profile file into RAG Knowledge Base if PDF or DOCX
    if ext in (".pdf", ".docx"):
        from app.services.rag_service import ingest_document
        try:
            ingest_document(
                file_bytes=content,
                filename=file.filename,
                teacher_id=teacher["id"],
                db=db,
            )
        except Exception as e:
            print(f"[Warning] RAG auto-ingest failed for personal file: {e}")

    return {
        "id": doc["id"],
        "original_filename": doc["original_filename"],
        "file_type": doc["file_type"],
        "file_size_bytes": doc["file_size_bytes"],
        "download_url": doc["download_url"],
        "created_at": doc["created_at"].isoformat(),
    }


@router.get("/")
def list_personal_files(
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """List all personal files for the authenticated teacher."""
    files = list(
        db.teacher_personal_files.find(
            {"teacher_id": teacher["id"]},
            {"file_b64": 0, "_id": 0},
        ).sort("created_at", -1).limit(100)
    )
    for f in files:
        if isinstance(f.get("created_at"), datetime):
            f["created_at"] = f["created_at"].isoformat()
    return files


@router.get("/download/{file_id}")
def download_personal_file(
    file_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Download a specific personal file."""
    doc = db.teacher_personal_files.find_one({
        "id": file_id,
        "teacher_id": teacher["id"],
    })
    if not doc:
        raise HTTPException(status_code=404, detail="File not found.")

    filename = doc.get("original_filename", "downloaded_file")

    # 1. Serve from MongoDB Base64 if available
    if doc.get("file_b64"):
        raw_bytes = base64.b64decode(doc["file_b64"])
        return Response(
            content=raw_bytes,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    # 2. Serve from local disk fallback
    file_path = _personal_files_dir(teacher["id"]) / doc["stored_filename"]
    if file_path.exists():
        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type="application/octet-stream",
        )

    raise HTTPException(status_code=404, detail="File data is unavailable.")


@router.delete("/{file_id}")
def delete_personal_file(
    file_id: str,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Delete a personal file from storage and database."""
    doc = db.teacher_personal_files.find_one({
        "id": file_id,
        "teacher_id": teacher["id"],
    })
    if not doc:
        raise HTTPException(status_code=404, detail="File not found.")

    # Remove from disk if exists
    try:
        file_path = _personal_files_dir(teacher["id"]) / doc["stored_filename"]
        if file_path.exists():
            os.unlink(file_path)
    except Exception:
        pass

    # Remove from DB
    db.teacher_personal_files.delete_one({"id": file_id})
    return {"message": "File deleted successfully."}
