"""Settings & Configuration API router.
"""

from fastapi import APIRouter
from backend.app.config import settings
from backend.app.schemas.common import SettingsResponse

router = APIRouter(tags=["Settings"])


@router.get("/settings", response_model=SettingsResponse)
async def get_settings():
    """Returns non-sensitive integration configurations and active feature toggles."""
    return SettingsResponse(
        app_name=settings.APP_NAME,
        environment=settings.APP_ENV,
        ollama_model=settings.OLLAMA_MODEL,
        ollama_base_url=settings.OLLAMA_BASE_URL,
        has_serpapi=bool(settings.SERPAPI_API_KEY),
        has_elevenlabs=bool(settings.ELEVENLABS_API_KEY),
        has_sentry=bool(settings.SENTRY_DSN),
        has_temporal=bool(settings.TEMPORAL_HOST),
        data_dir=str(settings.DATA_DIR),
    )
