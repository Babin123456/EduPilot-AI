"""Document and DocumentVersion document helpers for MongoDB."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc)


def _uid():
    return str(uuid.uuid4())


DOCUMENTS = "documents"
DOCUMENT_VERSIONS = "document_versions"


def new_document(*, teacher_id, title, document_type, teacher_course_assignment_id=None,
                 format="pdf", description=None, content_json=None,
                 file_path=None, file_size=None, source_id=None, source_type=None,
                 generation_status="completed", version=1, is_archived=False, id=None):
    return {
        "id": id or _uid(),
        "teacher_id": teacher_id,
        "teacher_course_assignment_id": teacher_course_assignment_id,
        "title": title,
        "document_type": document_type,
        "format": format,
        "description": description,
        "content_json": content_json,
        "file_path": file_path,
        "file_size": file_size,
        "source_id": source_id,
        "source_type": source_type,
        "generation_status": generation_status,
        "version": version,
        "is_archived": is_archived,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


def new_document_version(*, document_id, version, file_path=None,
                         content_json=None, change_note=None, id=None):
    return {
        "id": id or _uid(),
        "document_id": document_id,
        "version": version,
        "file_path": file_path,
        "content_json": content_json,
        "change_note": change_note,
        "created_at": _utcnow(),
    }
