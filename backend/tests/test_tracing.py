"""Tests for AgentTracer.
"""

import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.app.tools.tracing import AgentTracer


def test_agent_tracing():
    task_id = "trace_test_task_1"
    AgentTracer.record_span(
        task_id=task_id,
        step_name="plan_generation",
        duration_ms=250.4,
        model="gemma2:9b",
        tokens_used=120,
    )
    AgentTracer.record_span(
        task_id=task_id,
        step_name="search_sources",
        duration_ms=450.1,
        tokens_used=0,
    )

    summary = AgentTracer.get_task_trace_summary(task_id)
    assert summary["task_id"] == task_id
    assert summary["total_spans"] == 2
    assert summary["total_tokens_estimated"] == 120
    assert summary["total_duration_ms"] > 600


if __name__ == "__main__":
    test_agent_tracing()
    print("Agent tracing test passed!")
