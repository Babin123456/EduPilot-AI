"""EduPilot AI — FastAPI Application Entry Point."""

from __future__ import annotations

import asyncio
import os
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

import httpx
import structlog
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import get_settings
from app.core.database import ensure_indexes
from app.seed.seeder import run_seed

# ── Structlog configuration ───────────────────────────────────────────────────
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
)

log = structlog.get_logger()

# ── Server start timestamp (for uptime tracking) ─────────────────────────────
_server_start_time: datetime | None = None

# ── Rate Limiter (shared instance) ────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


# ── Security Headers Middleware ───────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Inject security headers on every response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response


# ── Request ID & Structured Logging Middleware ────────────────────────────────
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Attach a unique Request-ID to every request and emit structured logs."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id, path=str(request.url.path))

        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        log.info(
            "request_handled",
            method=request.method,
            status=response.status_code,
            duration_ms=duration_ms,
        )
        response.headers["X-Request-ID"] = request_id
        return response


# ── Keep-Alive Self-Ping (prevents Render free tier cold starts) ─────────────
KEEP_ALIVE_INTERVAL_SECONDS = 13 * 60  # 13 minutes (Render sleeps after 15)


async def _keep_alive_ping(backend_url: str) -> None:
    """Background task that pings /api/health every 13 minutes to keep
    Render free tier services awake and eliminate cold-start delays."""
    health_url = f"{backend_url.rstrip('/')}/api/health"
    log.info("keep_alive_started", url=health_url, interval_s=KEEP_ALIVE_INTERVAL_SECONDS)

    async with httpx.AsyncClient(timeout=10.0) as client:
        while True:
            await asyncio.sleep(KEEP_ALIVE_INTERVAL_SECONDS)
            try:
                resp = await client.get(health_url)
                log.info("keep_alive_ping", status=resp.status_code)
            except Exception as exc:
                log.warning("keep_alive_ping_failed", error=str(exc))


# ── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown."""
    global _server_start_time
    _server_start_time = datetime.now(timezone.utc)

    settings = get_settings()
    try:
        ensure_indexes()
        run_seed()
    except Exception as e:
        print(f"[Warning] Database connection deferred during startup: {e}")

    # Ensure storage directory exists
    settings.storage_path

    # Start keep-alive self-ping in production to prevent Render free tier cold starts
    keep_alive_task = None
    if settings.is_production and settings.backend_url != "http://localhost:8000":
        keep_alive_task = asyncio.create_task(_keep_alive_ping(settings.backend_url))

    yield

    # Cancel background task on shutdown
    if keep_alive_task is not None:
        keep_alive_task.cancel()
        try:
            await keep_alive_task
        except asyncio.CancelledError:
            pass


# ── App Factory ───────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    """Application factory."""
    settings = get_settings()

    app = FastAPI(
        title="EduPilot AI",
        description="AI Academic Operating System for Universities",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    # ── Rate limiter state & error handler ──
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── Middleware (order matters: outermost added last) ──
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestLoggingMiddleware)

    # ── CORS ──
    # Explicit origins for local dev + any Vercel deployment (preview & production)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── API Routes ──
    from app.api.v1.router import api_router
    app.include_router(api_router, prefix="/api/v1")
    try:
        storage_path = Path("/tmp/storage" if os.environ.get("VERCEL") else settings.storage_local_path).resolve()
        storage_path.mkdir(parents=True, exist_ok=True)
        app.mount("/media", StaticFiles(directory=storage_path), name="media")
    except Exception as e:
        print(f"[Storage Warning] Could not mount media directory: {e}")

    # ── Health Check ──
    @app.get("/api/health")
    async def health():
        uptime_seconds = None
        if _server_start_time:
            uptime_seconds = int((datetime.now(timezone.utc) - _server_start_time).total_seconds())
        return {
            "status": "healthy",
            "app": "EduPilot AI",
            "version": "1.0.0",
            "uptime_seconds": uptime_seconds,
            "started_at": _server_start_time.isoformat() if _server_start_time else None,
        }

    return app


app = create_app()

