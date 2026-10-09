"""Settings & Configuration API router.
"""

from fastapi import APIRouter
from backend.app.config import settings
from backend.app.schemas.common import SettingsResponse

router = APIRouter(tags=["Settings"])


import httpx

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


@router.get("/models")
async def list_available_models():
    """Returns list of all models detected in Ollama plus verified local models."""
    detected_models = []
    
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                for m in data.get("models", []):
                    name = m.get("name")
                    size_bytes = m.get("size", 0)
                    size_mb = round(size_bytes / (1024 * 1024), 1) if size_bytes else None
                    detected_models.append({
                        "id": name,
                        "name": name,
                        "size_mb": size_mb,
                        "is_default": (name == settings.OLLAMA_MODEL),
                        "family": "gemma" if "gemma" in name.lower() else "qwen" if "qwen" in name.lower() else "other",
                    })
    except Exception as e:
        print(f"[Ollama Tags Error] {e}")

    return {
        "default_model": settings.OLLAMA_MODEL,
        "models": detected_models,
    }


