"""Vercel Serverless Entrypoint for EduPilot AI FastAPI Backend."""

import sys
from pathlib import Path

# Add backend directory to Python module search path
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# pyrefly: ignore [missing-import]
from app.main import app  # noqa: E402

# Expose app instance for Vercel Serverless Handler
handler = app
