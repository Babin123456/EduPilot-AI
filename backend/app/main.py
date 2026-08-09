"""EduPilot AI — FastAPI Application Entry Point."""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.core.database import create_tables
from app.seed.seeder import run_seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown."""
    settings = get_settings()
    # Create tables and seed on startup
    create_tables()
    run_seed()
    # Ensure storage directory exists
    settings.storage_path
    yield


def create_app() -> FastAPI:
    """Application factory."""
    settings = get_settings()

    app = FastAPI(
        title="EduPilot AI",
        description="AI Academic Operating System for Adamas University",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ──
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── API Routes ──
    from app.api.v1.router import api_router
    app.include_router(api_router, prefix="/api/v1")
    storage_path = Path(settings.storage_local_path).resolve()
    storage_path.mkdir(parents=True, exist_ok=True)
    app.mount("/media", StaticFiles(directory=storage_path), name="media")

    # ── Health Check ──
    @app.get("/api/health")
    async def health():
        return {"status": "healthy", "app": "EduPilot AI", "version": "1.0.0"}

    return app


app = create_app()
