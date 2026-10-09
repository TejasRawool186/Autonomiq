"""Direct Background Workflow Runner.
Executes tasks asynchronously in the background, updating database records per step.
Allows Autonomiq to function seamlessly in both standalone and Temporal modes.
"""

import asyncio
from datetime import datetime
from typing import Dict, Any
from sqlalchemy import select
from backend.app.database import AsyncSessionLocal
from backend.app.models.task import Task
from backend.app.models.step import Step
from backend.app.models.source import Source
from backend.app.models.artifact import Artifact
from backend.app.workflows.temporal_activities import ResearchActivities


async def run_task_background(task_id: str, objective: str, model_name: str):
    """Executes research task stages, persisting step updates to the SQLite database."""
    state = {
        "task_id": task_id,
        "objective": objective,
        "model_name": model_name,
        "plan": None,
        "plan_approved": True,
        "queries": [],
        "raw_sources": [],
        "retrieved_chunks": [],
        "analysis": None,
        "report_markdown": None,
        "audio_path": None,
        "current_step": "running",
        "errors": [],
    }

    stages = [
        ("plan", ResearchActivities.plan_activity),
        ("search", ResearchActivities.search_activity),
        ("extract", ResearchActivities.extract_activity),
        ("index", ResearchActivities.index_activity),
        ("analyze", ResearchActivities.analyze_activity),
        ("report", ResearchActivities.report_activity),
        ("voice", ResearchActivities.voice_activity),
    ]

    async with AsyncSessionLocal() as session:
        # Mark task running
        task_query = await session.execute(select(Task).where(Task.id == task_id))
        task = task_query.scalar_one_or_none()
        if task:
            task.status = "running"
            await session.commit()

    for step_name, activity_fn in stages:
        step_id = f"{task_id}_{step_name}"
        async with AsyncSessionLocal() as session:
            # Create or update step
            step = Step(
                id=step_id,
                task_id=task_id,
                name=step_name,
                status="running",
                started_at=datetime.utcnow(),
            )
            session.add(step)
            await session.commit()

        try:
            output = await activity_fn(state)
            state.update(output)

            async with AsyncSessionLocal() as session:
                step_q = await session.execute(select(Step).where(Step.id == step_id))
                step_obj = step_q.scalar_one_or_none()
                if step_obj:
                    step_obj.status = "completed"
                    step_obj.completed_at = datetime.utcnow()
                await session.commit()

        except Exception as e:
            async with AsyncSessionLocal() as session:
                step_q = await session.execute(select(Step).where(Step.id == step_id))
                step_obj = step_q.scalar_one_or_none()
                if step_obj:
                    step_obj.status = "failed"
                    step_obj.error_info = str(e)
                task_q = await session.execute(select(Task).where(Task.id == task_id))
                t = task_q.scalar_one_or_none()
                if t:
                    t.status = "failed"
                    t.error_summary = f"Failed at {step_name}: {str(e)}"
                await session.commit()
            return

    # Task finished successfully
    async with AsyncSessionLocal() as session:
        task_q = await session.execute(select(Task).where(Task.id == task_id))
        task = task_q.scalar_one_or_none()
        if task:
            task.status = "completed"
            
            # Save sources
            for s in state.get("raw_sources", []):
                src = Source(
                    task_id=task_id,
                    url=s.get("url"),
                    title=s.get("title"),
                    source_type=s.get("source_type", "web"),
                    snippet=s.get("snippet"),
                )
                session.add(src)

            # Record artifacts
            report_art = Artifact(
                task_id=task_id,
                file_name="report.md",
                file_type="report_markdown",
                file_path=f"data/artifacts/{task_id}/report.md",
                size_bytes=len(state.get("report_markdown", "").encode("utf-8")),
            )
            session.add(report_art)

            if state.get("audio_path"):
                audio_art = Artifact(
                    task_id=task_id,
                    file_name="digest.mp3",
                    file_type="audio_mp3",
                    file_path=state.get("audio_path"),
                    size_bytes=state.get("audio_size", 0),
                    checksum=state.get("audio_checksum"),
                )
                session.add(audio_art)

            await session.commit()
