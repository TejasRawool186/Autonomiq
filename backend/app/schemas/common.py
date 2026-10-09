"""Common and System Pydantic Schemas.
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    app: str
    environment: str
    ollama_connected: bool
    qdrant_status: str
    temporal_status: str
    sentry_enabled: bool
    elevenlabs_enabled: bool


class SettingsResponse(BaseModel):
    app_name: str
    environment: str
    ollama_model: str
    ollama_base_url: str
    has_serpapi: bool
    has_elevenlabs: bool
    has_sentry: bool
    has_temporal: bool
    data_dir: str
