"""Integration tests for FastAPI REST Endpoints.
"""

import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from fastapi.testclient import TestClient
from backend.app.main import app


def test_api():
    with TestClient(app) as client:
        # Health
        res = client.get("/api/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

        # Settings
        res = client.get("/api/settings")
        assert res.status_code == 200
        assert res.json()["app_name"] == "Autonomiq"

        # Create Task
        payload = {
            "title": "Evaluate Qdrant Vector Search",
            "description": "Benchmark Qdrant local embedded vector store for multi-document RAG.",
            "task_type": "research",
            "auto_approve_plan": False,
        }
        create_res = client.post("/api/tasks", json=payload)
        assert create_res.status_code == 200
        created = create_res.json()
        assert created["title"] == payload["title"]
        task_id = created["id"]

        # List Tasks
        list_res = client.get("/api/tasks")
        assert list_res.status_code == 200
        items = list_res.json()
        assert any(t["id"] == task_id for t in items)

        # Get Task Details
        detail_res = client.get(f"/api/tasks/{task_id}")
        assert detail_res.status_code == 200
        detail = detail_res.json()
        assert detail["id"] == task_id
        # System resources
        res = client.get("/api/system")
        assert res.status_code == 200
        assert "storage" in res.json()
        assert "cpu_count" in res.json()

        # Models
        res = client.get("/api/models")
        assert res.status_code == 200
        assert "models" in res.json()

        # Retry Task
        retry_res = client.post(f"/api/tasks/{task_id}/retry")
        assert retry_res.status_code == 200
        assert retry_res.json()["status"] == "running"

        # Delete Task
        del_res = client.delete(f"/api/tasks/{task_id}")
        assert del_res.status_code == 200
        assert del_res.json()["status"] == "deleted"

        # Verify 404 after deletion
        get_deleted = client.get(f"/api/tasks/{task_id}")
        assert get_deleted.status_code == 404


if __name__ == "__main__":
    test_api()
    print("All API endpoint tests (including retry, delete, system) passed!")

