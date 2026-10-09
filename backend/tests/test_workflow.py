"""Tests for Temporal Durable Workflow and Activities.
"""

import sys
import asyncio
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.app.workflows.temporal_workflow import AutonomiqResearchWorkflow


async def async_test_durable_workflow():
    workflow = AutonomiqResearchWorkflow()
    initial_state = {
        "task_id": "test_durable_workflow_task",
        "objective": "Survey small open-weight language models for local deployment",
        "model_name": "gemma2:9b",
        "plan": None,
        "plan_approved": True,
        "queries": [],
        "raw_sources": [],
        "retrieved_chunks": [],
        "analysis": None,
        "report_markdown": None,
        "audio_path": None,
        "current_step": "created",
        "errors": [],
    }

    result = await workflow.execute(initial_state)

    assert result["plan"] is not None
    assert len(result["raw_sources"]) > 0
    assert result["analysis"] is not None
    assert result["report_markdown"] is not None
    assert result["audio_path"] is not None

    # Cleanup test audio artifact
    audio_file = Path(result["audio_path"])
    if audio_file.exists():
        audio_file.unlink()
        if audio_file.parent.exists():
            for f in audio_file.parent.glob("*"):
                f.unlink()
            audio_file.parent.rmdir()


def test_durable_workflow():
    asyncio.run(async_test_durable_workflow())


if __name__ == "__main__":
    test_durable_workflow()
    print("Durable workflow tests passed!")
