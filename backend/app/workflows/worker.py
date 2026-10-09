"""Temporal Worker Daemon for Autonomiq.
Listens for tasks on the queue and executes durable activities.
"""

import asyncio
from backend.app.config import settings
from backend.app.workflows.temporal_activities import ResearchActivities


async def run_temporal_worker():
    """Initializes and runs the Temporal worker if temporalio is installed and host is reachable."""
    try:
        from temporalio.client import Client
        from temporalio.worker import Worker

        client = await Client.connect(settings.TEMPORAL_HOST, namespace=settings.TEMPORAL_NAMESPACE)
        print(f"Connected to Temporal server at {settings.TEMPORAL_HOST}")

        worker = Worker(
            client,
            task_queue=settings.TEMPORAL_TASK_QUEUE,
            activities=[
                ResearchActivities.plan_activity,
                ResearchActivities.search_activity,
                ResearchActivities.extract_activity,
                ResearchActivities.index_activity,
                ResearchActivities.analyze_activity,
                ResearchActivities.report_activity,
                ResearchActivities.voice_activity,
            ],
        )
        print(f"Starting Temporal worker on queue: {settings.TEMPORAL_TASK_QUEUE}")
        await worker.run()
    except Exception as e:
        print(f"Temporal worker cannot connect ({e}). Direct runner mode available.")


if __name__ == "__main__":
    asyncio.run(run_temporal_worker())
