"""Knowledge document and chunk helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


KNOWLEDGE_DOCUMENTS = "knowledge_documents"
KNOWLEDGE_CHUNKS = "knowledge_chunks"


def new_knowledge_document(*, title, document_type, teacher_id=None,
                           file_path=None, content=None,
                           department_id=None, program_id=None,
                           course_id=None, semester_id=None,
                           chunk_count=0, is_indexed=False,
                           visibility="department", id=None):
    return {
        "id": id or _uid(),
        "teacher_id": teacher_id,
        "title": title,
        "document_type": document_type,
        "file_path": file_path,
        "content": content,
        "department_id": department_id,
        "program_id": program_id,
        "course_id": course_id,
        "semester_id": semester_id,
        "chunk_count": chunk_count,
        "is_indexed": is_indexed,
        "visibility": visibility,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def new_knowledge_chunk(*, document_id, chunk_index, content,
                        embedding=None, token_count=None, metadata_json=None, id=None):
    return {
        "id": id or _uid(),
        "document_id": document_id,
        "chunk_index": chunk_index,
        "content": content,
        "embedding": embedding,
        "token_count": token_count,
        "metadata_json": metadata_json,
        "created_at": _utcnow(),
    }
