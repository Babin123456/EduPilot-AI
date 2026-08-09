"""Documents routes."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_teacher
from app.models.teacher import Teacher
from app.models.document import Document

router = APIRouter()


@router.get("")
def list_documents(
    doc_type: str | None = Query(None),
    class_id: str | None = Query(None),
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """List generated documents."""
    query = db.query(Document).filter(
        Document.teacher_id == teacher.id,
        Document.is_archived == False,
    )
    if doc_type:
        query = query.filter(Document.document_type == doc_type)
    if class_id:
        query = query.filter(Document.teacher_course_assignment_id == class_id)

    docs = query.order_by(Document.created_at.desc()).limit(50).all()
    return [
        {
            "id": d.id,
            "title": d.title,
            "document_type": d.document_type,
            "format": d.format,
            "generation_status": d.generation_status,
            "version": d.version,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in docs
    ]


from pydantic import BaseModel
import uuid

class CreateDocumentRequest(BaseModel):
    title: str
    document_type: str  # quiz, assignment, assessment, report, notes
    format: str = "pdf"  # pdf, excel, ppt
    class_id: str | None = None
    content: str | None = None

@router.post("")
def create_document(
    req: CreateDocumentRequest,
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Save a newly generated document record."""
    new_doc = Document(
        id=str(uuid.uuid4()),
        teacher_id=teacher.id,
        teacher_course_assignment_id=req.class_id,
        title=req.title,
        document_type=req.document_type,
        format=req.format,
        content=req.content,
        generation_status="completed",
        version=1,
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return {
        "id": new_doc.id,
        "title": new_doc.title,
        "document_type": new_doc.document_type,
        "format": new_doc.format,
        "generation_status": new_doc.generation_status,
        "created_at": new_doc.created_at.isoformat() if new_doc.created_at else None,
    }

