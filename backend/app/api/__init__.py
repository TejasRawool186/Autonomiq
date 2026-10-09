"""API routers package.
"""

from backend.app.api.tasks import router as tasks_router
from backend.app.api.documents import router as documents_router
from backend.app.api.health import router as health_router
from backend.app.api.settings import router as settings_router

__all__ = ["tasks_router", "documents_router", "health_router", "settings_router"]
