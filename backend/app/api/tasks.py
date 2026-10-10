"""Tasks API router for Autonomiq.
Full lifecycle management: creation, plan generation, approval, execution, and artifacts.
"""

import asyncio
import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.database import get_db
from backend.app.models.task import Task
from backend.app.models.step import Step
from backend.app.models.source import Source
from backend.app.models.artifact import Artifact
from backend.app.schemas.task import TaskCreate, TaskResponse, TaskDetailResponse, PlanApprovalRequest
from backend.app.schemas.step import StepResponse
from backend.app.schemas.source import SourceResponse
from backend.app.schemas.artifact import ArtifactResponse
from backend.app.agent.nodes.planner import planner_node
from backend.app.tools.tracing import AgentTracer
from backend.app.workflows.direct_runner import run_task_background

router = APIRouter(tags=["Tasks"])


@router.post("/tasks", response_model=TaskResponse)
async def create_task(payload: TaskCreate, db: AsyncSession = Depends(get_db)):
    """Create a research task and generate an execution plan."""
    task = Task(
        title=payload.title,
        description=payload.description,
        task_type=payload.task_type,
        model_name=payload.model_name or "gemma2:9b",
        status="planned",
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    # Generate plan
    state_mock = {
        "task_id": task.id,
        "objective": task.description,
        "model_name": task.model_name,
    }
    plan_out = await planner_node(state_mock)
    task.plan_json = json.dumps(plan_out.get("plan", {}))
    await db.commit()
    await db.refresh(task)

    # If auto_approve_plan is requested, start in background immediately
    if payload.auto_approve_plan:
        task.plan_approved = True
        task.status = "running"
        await db.commit()
        asyncio.create_task(run_task_background(task.id, task.description, task.model_name))

    return task


@router.get("/tasks", response_model=List[TaskResponse])
async def list_tasks(db: AsyncSession = Depends(get_db)):
    """List all research tasks sorted by creation date."""
    result = await db.execute(select(Task).order_by(desc(Task.created_at)))
    return result.scalars().all()


@router.get("/tasks/{task_id}", response_model=TaskDetailResponse)
async def get_task(task_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve full task details with steps, sources, and artifacts."""
    query = (
        select(Task)
        .where(Task.id == task_id)
        .options(
            selectinload(Task.steps),
            selectinload(Task.sources),
            selectinload(Task.artifacts),
        )
    )
    result = await db.execute(query)
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/tasks/{task_id}/start")
async def start_task(
    task_id: str,
    approval: PlanApprovalRequest = PlanApprovalRequest(approved=True),
    db: AsyncSession = Depends(get_db),
):
    """Approve execution plan and start background worker execution (Away Mode)."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if not approval.approved:
        task.status = "cancelled"
        await db.commit()
        return {"status": "cancelled", "message": "Plan rejected by user."}

    task.plan_approved = True
    task.status = "running"
    await db.commit()

    # Launch durable background task runner
    asyncio.create_task(run_task_background(task.id, task.description, task.model_name))

    return {
        "status": "running",
        "message": "Task started in background. You may safely activate Away Mode or close your browser.",
    }


@router.post("/tasks/{task_id}/cancel")
async def cancel_task(task_id: str, db: AsyncSession = Depends(get_db)):
    """Cancel a running or pending task."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = "cancelled"
    await db.commit()
    return {"status": "cancelled", "task_id": task_id}


@router.post("/tasks/{task_id}/retry")
async def retry_task(task_id: str, db: AsyncSession = Depends(get_db)):
    """Retry a failed or completed task with fresh background execution."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = "running"
    task.progress = 5
    await db.commit()
    asyncio.create_task(run_task_background(task.id, task.description, task.model_name))
    return {"status": "running", "message": f"Task {task_id} restarted in background.", "task_id": task_id}


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a task and its stored artifacts."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(task)
    await db.commit()
    return {"status": "deleted", "task_id": task_id}


@router.get("/tasks/{task_id}/trace")
async def get_task_trace(task_id: str):
    """Retrieve Sentry trace telemetry summary for the task."""
    return AgentTracer.get_task_trace_summary(task_id)


@router.get("/tasks/{task_id}/audio")
async def get_task_audio(task_id: str, db: AsyncSession = Depends(get_db)):
    """Stream or download generated ElevenLabs audio digest."""
    query = select(Artifact).where(Artifact.task_id == task_id, Artifact.file_type == "audio_mp3")
    res = await db.execute(query)
    artifact = res.scalar_one_or_none()
    if not artifact or not Path(artifact.file_path).exists():
        raise HTTPException(status_code=404, detail="Audio digest not found for this task")
    return FileResponse(artifact.file_path, media_type="audio/mpeg", filename=artifact.file_name)


@router.get("/tasks/{task_id}/report")
async def get_task_report(task_id: str, db: AsyncSession = Depends(get_db)):
    """Download the generated markdown research report."""
    query = select(Artifact).where(Artifact.task_id == task_id, Artifact.file_type == "report_markdown")
    res = await db.execute(query)
    artifact = res.scalar_one_or_none()
    if not artifact or not Path(artifact.file_path).exists():
        raise HTTPException(status_code=404, detail="Report artifact not found for this task")
    return FileResponse(artifact.file_path, media_type="text/markdown", filename="report.md")


@router.get("/tasks/{task_id}/artifacts/{artifact_id}/download")
async def download_task_artifact(task_id: str, artifact_id: str, db: AsyncSession = Depends(get_db)):
    """Download any stored artifact by ID."""
    query = select(Artifact).where(Artifact.task_id == task_id, Artifact.id == artifact_id)
    res = await db.execute(query)
    artifact = res.scalar_one_or_none()
    if not artifact or not Path(artifact.file_path).exists():
        raise HTTPException(status_code=404, detail="Artifact not found")
    media_type = "audio/mpeg" if artifact.file_type == "audio_mp3" else "text/markdown" if artifact.file_type == "report_markdown" else "application/octet-stream"
    return FileResponse(artifact.file_path, media_type=media_type, filename=artifact.file_name)

