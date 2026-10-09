"""Planner Agent Node for Autonomiq.
Generates a structured execution plan from natural-language task objectives.
"""

import json
from typing import Dict, Any
from backend.app.agent.state import AgentState
from backend.app.agent.llm import OllamaClient


async def planner_node(state: AgentState) -> Dict[str, Any]:
    """Generates execution plan for the task."""
    client = OllamaClient(model=state.get("model_name"))
    prompt = f"""Generate a detailed execution plan for the research objective:
Objective: {state['objective']}

Return a valid JSON object with:
- objective: string
- steps: array of {{"step_number": int, "name": string, "description": string, "tool": string}}
- estimated_duration_seconds: int
- safety_constraints: array of strings
"""
    raw = await client.generate(prompt)
    try:
        # Extract JSON
        start = raw.find("{")
        end = raw.rfind("}") + 1
        plan = json.loads(raw[start:end])
    except Exception:
        plan = {
            "objective": state["objective"],
            "steps": [
                {"step_number": 1, "name": "Web Research", "description": "Search web sources", "tool": "serpapi"},
                {"step_number": 2, "name": "Extraction", "description": "Extract content", "tool": "scraper"},
                {"step_number": 3, "name": "RAG Indexing", "description": "Index vectors", "tool": "qdrant"},
                {"step_number": 4, "name": "Analysis", "description": "Reasoning with Gemma", "tool": "gemma"},
                {"step_number": 5, "name": "Report", "description": "Compile report", "tool": "reporter"},
            ],
            "estimated_duration_seconds": 45,
            "safety_constraints": ["Verify citations"],
        }

    # Generate 2-3 search query keywords from objective
    queries = [
        state["objective"],
        f"{state['objective']} overview comparison benchmarks",
    ]

    return {
        "plan": plan,
        "queries": queries,
        "current_step": "planned",
    }
