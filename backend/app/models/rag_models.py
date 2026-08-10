"""RAG document and chunk MongoDB document helpers."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


RAG_DOCUMENTS = "rag_documents"
RAG_CHUNKS = "rag_chunks"


def new_rag_document(
    *,
    teacher_id: str,
    filename: str,
    file_type: str,
    chunk_count: int = 0,
    file_size_bytes: int = 0,
    status: str = "processing",
    id: str | None = None,
):
    """Create a new RAG document metadata record."""
    return {
        "id": id or _uid(),
        "teacher_id": teacher_id,
        "filename": filename,
        "file_type": file_type,
        "chunk_count": chunk_count,
        "file_size_bytes": file_size_bytes,
        "status": status,  # "processing" | "indexed" | "failed"
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def new_rag_chunk(
    *,
    document_id: str,
    teacher_id: str,
    chunk_index: int,
    content: str,
    embedding: list[float],
    metadata: dict | None = None,
    id: str | None = None,
):
    """Create a new RAG chunk record with its embedding vector."""
    return {
        "id": id or _uid(),
        "document_id": document_id,
        "teacher_id": teacher_id,
        "chunk_index": chunk_index,
        "content": content,
        "embedding": embedding,  # list[float], 384 dims for all-MiniLM-L6-v2
        "metadata": metadata or {},
        "created_at": _utcnow(),
    }
