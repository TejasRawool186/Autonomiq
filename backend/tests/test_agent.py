"""Tests for Autonomiq Autonomous Agent Workflow.
"""

import sys
import asyncio
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.app.agent.graph import ResearchWorkflowGraph
from backend.app.agent.state import AgentState


async def async_test_workflow():
    initial_state: AgentState = {
        "task_id": "test_agent_workflow_1",
        "objective": "Compare Gemma 2 9B and Llama 3 8B efficiency",
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

    final_state = await ResearchWorkflowGraph.run(initial_state)

    assert final_state["plan"] is not None
    assert len(final_state["raw_sources"]) > 0
    assert len(final_state["retrieved_chunks"]) > 0
    assert final_state["analysis"] is not None
    assert final_state["report_markdown"] is not None
    assert "Executive Summary" in final_state["report_markdown"]
    assert final_state["current_step"] == "completed"


def test_agent_workflow():
    asyncio.run(async_test_workflow())


if __name__ == "__main__":
    test_agent_workflow()
    print("Agent workflow test passed!")
