"""Autonomiq FastAPI Application Entrypoint.
Exposes REST APIs for autonomous research tasks, documents, and monitoring.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import init_db
from backend.app.tools.tracing import AgentTracer
from backend.app.api.tasks import router as tasks_router
from backend.app.api.documents import router as documents_router
from backend.app.api.health import router as health_router
from backend.app.api.settings import router as settings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup and shutdown hooks."""
    settings.ensure_directories()
    await init_db()
    AgentTracer.init_sentry()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="3.0.0",
    description="Local-First Autonomous AI Workspace for Background Research Tasks.",
    lifespan=lifespan,
)

# CORS configuration
origins = settings.CORS_ORIGINS
if isinstance(origins, str):
    import json
    try:
        origins = json.loads(origins)
    except Exception:
        origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": "3.0.0",
        "status": "online",
        "docs_url": "/docs",
        "motto": "Your AI works. You live.",
    }
