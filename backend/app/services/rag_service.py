"""EduPilot AI — RAG Service: Document ingestion, embedding, and retrieval.

This module provides the core RAG pipeline:
  1. ingest_document  — parse PDF/DOCX → chunk → embed → store in MongoDB
  2. retrieve_context — embed query → vector search → return relevant chunks
  3. rewrite_query    — use LLM to rewrite follow-up questions into standalone queries
"""

from __future__ import annotations

import logging
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import httpx
from pymongo.database import Database

from app.core.config import get_settings
from app.models.rag_models import new_rag_chunk, new_rag_document

logger = logging.getLogger(__name__)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SINGLETON: HuggingFace Embedding Model
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_embeddings_instance = None


def get_embeddings():
    """Return a singleton HuggingFaceEmbeddings instance (all-MiniLM-L6-v2, 384 dims).

    Downloads the model on first call (~80MB), then uses local cache.
    Runs entirely on CPU — no API key or external service required.
    """
    global _embeddings_instance
    if _embeddings_instance is None:
        from langchain_huggingface import HuggingFaceEmbeddings

        settings = get_settings()
        model_name = f"sentence-transformers/{settings.embedding_model}"
        logger.info("Loading embedding model: %s (first load downloads ~80MB)", model_name)
        _embeddings_instance = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        logger.info("Embedding model loaded successfully.")
    return _embeddings_instance


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DOCUMENT INGESTION PIPELINE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _save_temp_file(file_bytes: bytes, filename: str) -> str:
    """Save file bytes to a temporary file and return the path."""
    suffix = Path(filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file_bytes)
        return tmp.name


def _load_document(tmp_path: str, filename: str):
    """Load a document using the appropriate LangChain loader."""
    ext = Path(filename).suffix.lower()

    if ext == ".pdf":
        from langchain_community.document_loaders import PyPDFLoader
        loader = PyPDFLoader(tmp_path)
        return loader.load()

    elif ext == ".docx":
        from langchain_community.document_loaders import Docx2txtLoader
        loader = Docx2txtLoader(tmp_path)
        return loader.load()

    else:
        raise ValueError(f"Unsupported file type: {ext}. Only PDF and DOCX are supported for RAG.")


def _split_documents(documents: list, chunk_size: int, chunk_overlap: int):
    """Split documents into chunks using RecursiveCharacterTextSplitter."""
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
        length_function=len,
    )
    return splitter.split_documents(documents)


def ingest_document(
    file_bytes: bytes,
    filename: str,
    teacher_id: str,
    db: Database,
) -> dict:
    """Full RAG ingestion pipeline: parse → chunk → embed → store in MongoDB.

    Args:
        file_bytes: Raw file content.
        filename: Original filename (used to determine loader type).
        teacher_id: ID of the teacher uploading the document.
        db: MongoDB Database instance.

    Returns:
        The rag_document record dict with status="indexed" on success.

    Raises:
        ValueError: If the file type is unsupported.
    """
    settings = get_settings()
    ext = Path(filename).suffix.lower()
    file_type = "pdf" if ext == ".pdf" else "docx"

    # 1. Create the document record (status = "processing")
    doc_record = new_rag_document(
        teacher_id=teacher_id,
        filename=filename,
        file_type=file_type,
        file_size_bytes=len(file_bytes),
        status="processing",
    )
    db.rag_documents.insert_one(doc_record)

    tmp_path = None
    try:
        # 2. Save to temp file (LangChain loaders need file paths)
        tmp_path = _save_temp_file(file_bytes, filename)

        # 3. Load document text using LangChain loader
        documents = _load_document(tmp_path, filename)
        if not documents:
            raise ValueError("No text content could be extracted from the file.")

        # 4. Split into chunks
        chunks = _split_documents(
            documents,
            chunk_size=settings.rag_chunk_size,
            chunk_overlap=settings.rag_chunk_overlap,
        )

        if not chunks:
            raise ValueError("Document produced no text chunks after splitting.")

        # 5. Embed all chunks
        embeddings = get_embeddings()
        chunk_texts = [chunk.page_content for chunk in chunks]
        chunk_vectors = embeddings.embed_documents(chunk_texts)

        # 6. Store chunks in MongoDB
        chunk_records = []
        for i, (chunk, vector) in enumerate(zip(chunks, chunk_vectors)):
            record = new_rag_chunk(
                document_id=doc_record["id"],
                teacher_id=teacher_id,
                chunk_index=i,
                content=chunk.page_content,
                embedding=vector,
                metadata={
                    "source": filename,
                    "page": chunk.metadata.get("page"),
                    "chunk_of": len(chunks),
                },
            )
            chunk_records.append(record)

        if chunk_records:
            db.rag_chunks.insert_many(chunk_records)

        # 7. Update document status
        db.rag_documents.update_one(
            {"id": doc_record["id"]},
            {
                "$set": {
                    "status": "indexed",
                    "chunk_count": len(chunks),
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
        doc_record["status"] = "indexed"
        doc_record["chunk_count"] = len(chunks)
        logger.info(
            "RAG ingestion complete: %s → %d chunks embedded",
            filename,
            len(chunks),
        )

    except Exception as e:
        logger.error("RAG ingestion failed for %s: %s", filename, str(e))
        db.rag_documents.update_one(
            {"id": doc_record["id"]},
            {"$set": {"status": "failed", "updated_at": datetime.now(timezone.utc)}},
        )
        doc_record["status"] = "failed"
        raise

    finally:
        # Cleanup temp file
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return doc_record


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# VECTOR RETRIEVAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def retrieve_context(
    query: str,
    teacher_id: str,
    db: Database,
    k: int | None = None,
) -> str:
    """Retrieve the most relevant document chunks for a query using vector similarity.

    Uses MongoDB Atlas Vector Search ($vectorSearch aggregation) to find
    the top-k most semantically similar chunks from the teacher's uploaded
    documents. Falls back to a basic text-match approach if vector search
    index is not yet configured.

    Args:
        query: The user's question or search query.
        teacher_id: Only search documents uploaded by this teacher.
        db: MongoDB Database instance.
        k: Number of chunks to retrieve (default from settings).

    Returns:
        A formatted string of relevant context, or empty string if no results.
    """
    settings = get_settings()
    if k is None:
        k = settings.rag_retrieval_k

    # Check if teacher has any indexed documents
    doc_count = db.rag_documents.count_documents({
        "teacher_id": teacher_id,
        "status": "indexed",
    })
    if doc_count == 0:
        return ""

    # Embed the query
    embeddings = get_embeddings()
    query_vector = embeddings.embed_query(query)

    # Attempt MongoDB Atlas Vector Search via $vectorSearch aggregation
    try:
        pipeline = [
            {
                "$vectorSearch": {
                    "index": settings.rag_vector_index_name,
                    "path": "embedding",
                    "queryVector": query_vector,
                    "numCandidates": k * 10,
                    "limit": k,
                    "filter": {"teacher_id": teacher_id},
                }
            },
            {
                "$project": {
                    "content": 1,
                    "metadata": 1,
                    "score": {"$meta": "vectorSearchScore"},
                }
            },
        ]
        results = list(db.rag_chunks.aggregate(pipeline))
    except Exception as e:
        logger.warning(
            "Atlas Vector Search unavailable or failed (%s). Falling back to in-memory cosine similarity.",
            str(e),
        )
        # Fallback: exact in-memory cosine similarity search using numpy
        all_chunks = list(
            db.rag_chunks.find(
                {"teacher_id": teacher_id},
                {"content": 1, "metadata": 1, "embedding": 1},
            )
        )
        if not all_chunks:
            return ""

        import numpy as np
        query_vec = np.array(query_vector)
        query_norm = np.linalg.norm(query_vec)
        if query_norm == 0:
            query_norm = 1e-9

        scored_chunks = []
        for chunk in all_chunks:
            emb = chunk.get("embedding")
            if not emb:
                continue
            emb_vec = np.array(emb)
            emb_norm = np.linalg.norm(emb_vec)
            if emb_norm == 0:
                emb_norm = 1e-9

            similarity = np.dot(query_vec, emb_vec) / (query_norm * emb_norm)
            chunk["score"] = float(similarity)
            scored_chunks.append(chunk)

        # Sort by highest similarity
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        results = scored_chunks[:k]

    if not results:
        return ""

    # Format retrieved chunks into a context string
    context_parts = []
    for i, chunk in enumerate(results, 1):
        source = chunk.get("metadata", {}).get("source", "Unknown")
        page = chunk.get("metadata", {}).get("page")
        score = chunk.get("score", "")
        page_info = f" (Page {page + 1})" if page is not None else ""
        score_info = f" [relevance: {score:.2f}]" if isinstance(score, (int, float)) else ""
        context_parts.append(
            f"--- Chunk {i} from '{source}'{page_info}{score_info} ---\n"
            f"{chunk['content']}"
        )

    return "\n\n".join(context_parts)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# QUERY REWRITING (Conversational Context)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def rewrite_query_with_history(
    query: str,
    chat_history: list[dict],
    settings,
) -> str:
    """Rewrite a follow-up question into a standalone query using chat history.

    If the user asks "What about chapter 3?" after previously asking about
    a specific document, this function uses the LLM to produce:
    "Explain chapter 3 of [document name]"

    This standalone query is then used for vector retrieval.

    Args:
        query: The user's latest message.
        chat_history: List of prior messages [{"role": ..., "content": ...}].
        settings: Application settings (for API keys and models).

    Returns:
        A standalone, self-contained query string.
    """
    # If no chat history, the query is already standalone
    if not chat_history:
        return query

    # Build the rewriting prompt
    history_text = ""
    for msg in chat_history[-6:]:  # Use last 6 messages for context
        role = "User" if msg["role"] == "user" else "Assistant"
        history_text += f"{role}: {msg['content'][:200]}\n"

    rewrite_prompt = (
        "Given the following conversation history and a new user question, "
        "rewrite the question to be a standalone, self-contained question that "
        "can be understood without the conversation history. "
        "Do NOT answer the question — only reformulate it if needed. "
        "If the question is already standalone, return it as-is.\n\n"
        f"Conversation History:\n{history_text}\n"
        f"New Question: {query}\n\n"
        f"Standalone Question:"
    )

    # Try Groq first
    rewrite_messages = [{"role": "user", "content": rewrite_prompt}]
    try:
        api_key = (settings.groq_api_key_1 or "").strip()
        if api_key and "your_" not in api_key and len(api_key) >= 25:
            with httpx.Client(timeout=8.0) as client:
                response = client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    json={
                        "model": settings.groq_model or "llama-3.3-70b-versatile",
                        "messages": rewrite_messages,
                        "temperature": 0.1,
                        "max_tokens": 200,
                    },
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                )
                if response.status_code == 200:
                    rewritten = response.json()["choices"][0]["message"]["content"].strip()
                    if rewritten:
                        return rewritten
    except Exception:
        pass

    # Fallback: return original query
    return query


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DOCUMENT MANAGEMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def delete_rag_document(document_id: str, teacher_id: str, db: Database) -> bool:
    """Delete a RAG document and all its associated chunks.

    Args:
        document_id: The document ID to delete.
        teacher_id: The teacher's ID (for authorization).
        db: MongoDB Database instance.

    Returns:
        True if the document was found and deleted, False otherwise.
    """
    doc = db.rag_documents.find_one({"id": document_id, "teacher_id": teacher_id})
    if not doc:
        return False

    # Delete all chunks belonging to this document
    deleted_chunks = db.rag_chunks.delete_many({"document_id": document_id})
    logger.info("Deleted %d chunks for document %s", deleted_chunks.deleted_count, document_id)

    # Delete the document record
    db.rag_documents.delete_one({"id": document_id})
    return True


def list_rag_documents(teacher_id: str, db: Database) -> list[dict]:
    """List all RAG documents uploaded by a teacher.

    Args:
        teacher_id: The teacher's ID.
        db: MongoDB Database instance.

    Returns:
        List of document metadata dicts (without embeddings).
    """
    docs = list(
        db.rag_documents.find(
            {"teacher_id": teacher_id},
            {"_id": 0},
        )
        .sort("created_at", -1)
        .limit(50)
    )
    return docs
