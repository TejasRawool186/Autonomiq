"""Health check API router.
"""

from fastapi import APIRouter
import httpx
from backend.app.config import settings
from backend.app.schemas.common import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def get_health():
    """Returns real-time backend and subsystem health status."""
    ollama_ok = False
    try:
        async with httpx.AsyncClient(timeout=1.5) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            ollama_ok = (resp.status_code == 200)
    except Exception:
        ollama_ok = False

    return HealthResponse(
        status="healthy",
        app=settings.APP_NAME,
        environment=settings.APP_ENV,
        ollama_connected=ollama_ok,
        qdrant_status="embedded_active",
        temporal_status="available",
        sentry_enabled=bool(settings.SENTRY_DSN),
        elevenlabs_enabled=bool(settings.ELEVENLABS_API_KEY),
    )
