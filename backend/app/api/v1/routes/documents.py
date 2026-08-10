"""Documents routes."""
from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from pymongo.database import Database

from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.models.document import new_document

router = APIRouter()


@router.get("")
def list_documents(
    doc_type: str | None = Query(None),
    class_id: str | None = Query(None),
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """List generated documents."""
    query_filter = {
        "teacher_id": teacher["id"],
        "is_archived": False,
    }
    if doc_type:
        query_filter["document_type"] = doc_type
    if class_id:
        query_filter["teacher_course_assignment_id"] = class_id

    docs = list(
        db.documents.find(query_filter).sort("created_at", -1).limit(50)
    )
    return [
        {
            "id": d["id"],
            "title": d["title"],
            "document_type": d["document_type"],
            "format": d.get("format", "pdf"),
            "generation_status": d.get("generation_status", "completed"),
            "version": d.get("version", 1),
            "created_at": d["created_at"].isoformat() if hasattr(d.get("created_at"), 'isoformat') else d.get("created_at"),
        }
        for d in docs
    ]


class CreateDocumentRequest(BaseModel):
    title: str
    document_type: str
    format: str = "pdf"
    class_id: str | None = None
    content: str | None = None


@router.post("")
def create_document(
    req: CreateDocumentRequest,
    teacher: dict = Depends(get_current_teacher),
    db: Database = Depends(get_db),
):
    """Save a newly generated document record."""
    doc = new_document(
        teacher_id=teacher["id"],
        teacher_course_assignment_id=req.class_id,
        title=req.title,
        document_type=req.document_type,
        format=req.format,
        content_json=req.content,
        generation_status="completed",
        version=1,
    )
    db.documents.insert_one(doc)
    return {
        "id": doc["id"],
        "title": doc["title"],
        "document_type": doc["document_type"],
        "format": doc["format"],
        "generation_status": doc["generation_status"],
        "created_at": doc["created_at"].isoformat() if hasattr(doc.get("created_at"), 'isoformat') else doc.get("created_at"),
    }
