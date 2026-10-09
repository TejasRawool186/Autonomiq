"""Autonomiq Full End-to-End Simulation Script (SRS Section 11 Demo).
Simulates research on ten open-weight AI models with local analysis, report generation, and audio digest.
"""

import sys
import asyncio
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.agent.graph import ResearchWorkflowGraph
from backend.app.agent.state import AgentState
from backend.app.tools.elevenlabs_voice import ElevenLabsVoiceEngine
from backend.app.tools.tracing import AgentTracer


async def main():
    task_id = "demo_hacktoberfest_2026"
    objective = (
        "Research ten useful open-weight AI models, compare capabilities and "
        "hardware requirements, and generate a report."
    )
    print("=" * 60)
    print(f"Starting Autonomiq Simulation: {objective}")
    print("=" * 60)

    initial_state: AgentState = {
        "task_id": task_id,
        "objective": objective,
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

    # Execute workflow graph
    print("\n[Stage 1-6] Executing LangGraph Workflow...")
    final_state = await ResearchWorkflowGraph.run(initial_state)

    print(f"[Done] Research complete. Sources collected: {len(final_state['raw_sources'])}")
    print(f"[Done] Report generated (length: {len(final_state['report_markdown'])} chars)")

    # Execute voice digest synthesis
    print("\n[Stage 7] Generating ElevenLabs Audio Digest (Away Mode)...")
    voice_engine = ElevenLabsVoiceEngine()
    audio_path, checksum, size = await voice_engine.generate_audio_digest(
        task_id=task_id,
        summary_text=final_state["analysis"][:1000],
    )
    print(f"[Done] Audio Digest saved: {audio_path} ({size} bytes, checksum: {checksum[:8]}...)")

    # Telemetry
    trace = AgentTracer.get_task_trace_summary(task_id)
    print(f"\n[Telemetry] Sentry Trace Summary: {trace}")
    print("\n" + "=" * 60)
    print("DEMO RUN FINISHED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
