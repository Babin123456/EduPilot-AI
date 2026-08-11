"""EduPilot AI — Core Configuration."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Locate project root directory dynamically (EduPilot-AI/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=(
            str(PROJECT_ROOT / ".env"),
            ".env",
            "../.env",
            "../../.env",
        ),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---- Application ----
    app_name: str = "EduPilot AI"
    app_env: str = "development"
    debug: bool = True
    secret_key: str = "dev-secret-key-change-in-production"

    # ---- Backend ----
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:5173"
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # ---- Database (MongoDB Atlas) ----
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "edupilot"

    # ---- JWT / Auth ----
    jwt_secret_key: str = "dev-jwt-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # ---- LLM: Primary (Groq) ----
    groq_api_key_1: str = ""
    groq_api_key_2: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # ---- LLM: Fallback (Gemini) ----
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"

    # ---- Email (Gmail SMTP) ----
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_name: str = "EduPilot AI"
    smtp_from_email: str = ""

    # ---- File Storage ----
    storage_backend: str = "local"
    storage_local_path: str = "./storage"

    # ---- Embedding Model ----
    embedding_model: str = "all-MiniLM-L6-v2"

    # ---- RAG Settings ----
    rag_chunk_size: int = 1000
    rag_chunk_overlap: int = 250
    rag_max_file_size_mb: int = 10
    rag_retrieval_k: int = 15
    rag_vector_index_name: str = "vector_index"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def storage_path(self) -> Path:
        p = Path(self.storage_local_path)
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
