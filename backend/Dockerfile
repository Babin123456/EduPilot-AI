# ============================================================
# Backend Dockerfile — EduPilot AI (UV + Python 3.13)
# ============================================================
# Multi-stage build:
#   Stage 1 (builder): Install deps with uv into .venv
#   Stage 2 (runtime): Slim image with only the venv + app code
# ============================================================

# ---- Stage 1: Build dependencies with UV ----
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS builder

WORKDIR /app

# Copy dependency files first (cache layer)
COPY pyproject.toml uv.lock ./

# Install dependencies into .venv (frozen from lockfile)
RUN uv sync --frozen --no-dev --no-install-project

# Copy application source
COPY app/ ./app/

# Install the project itself
RUN uv sync --frozen --no-dev


# ---- Stage 2: Production runtime ----
FROM python:3.13-slim-bookworm AS runtime

WORKDIR /app

# Install only the minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Copy the entire virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY --from=builder /app/app /app/app

# Ensure .venv/bin is on PATH so uvicorn is found
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH="/app"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create storage directory
RUN mkdir -p /app/storage

# Expose the API port
EXPOSE 8000

# Run uvicorn in production mode
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
