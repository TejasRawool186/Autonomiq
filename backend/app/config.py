"""Autonomiq Configuration Settings.
Loads environment variables and sets up default paths for local-first execution.
"""

from pathlib import Path
from typing import List, Union
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Core Application
    APP_NAME: str = "Autonomiq"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://localhost:3000"]

    # Storage Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = Field(default_factory=lambda: Path("data"))
    SQLITE_PATH: Path = Field(default_factory=lambda: Path("data/sqlite/autonomiq.db"))
    QDRANT_PATH: Path = Field(default_factory=lambda: Path("data/qdrant"))
    UPLOAD_DIR: Path = Field(default_factory=lambda: Path("data/uploads"))
    ARTIFACT_DIR: Path = Field(default_factory=lambda: Path("data/artifacts"))

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/sqlite/autonomiq.db"

    # Local AI (Ollama)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma2:9b"
    OLLAMA_EMBEDDING_MODEL: str = "nomic-embed-text"

    # Integrations (Optional)
    SERPAPI_API_KEY: str = ""
    TEMPORAL_HOST: str = "localhost:7233"
    TEMPORAL_NAMESPACE: str = "default"
    TEMPORAL_TASK_QUEUE: str = "autonomiq-tasks"

    SENTRY_DSN: str = ""
    SENTRY_ENVIRONMENT: str = "development"

    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = "21m00Tcm4TlvDq8ikWAM"

    MONGODB_URI: str = ""

    def ensure_directories(self) -> None:
        """Create data directories if they do not exist."""
        for path in [self.DATA_DIR, self.SQLITE_PATH.parent, self.QDRANT_PATH, self.UPLOAD_DIR, self.ARTIFACT_DIR]:
            path.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_directories()
