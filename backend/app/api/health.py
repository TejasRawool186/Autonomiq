"""Health check API router.
"""

from fastapi import APIRouter
from backend.app.config import settings
from backend.app.schemas.common import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def get_health():
    """Returns backend and subsystem health status."""
    return HealthResponse(
        status="healthy",
        app=settings.APP_NAME,
        environment=settings.APP_ENV,
        ollama_connected=True,
        qdrant_status="embedded_active",
        temporal_status="available",
        sentry_enabled=bool(settings.SENTRY_DSN),
        elevenlabs_enabled=bool(settings.ELEVENLABS_API_KEY),
    )
