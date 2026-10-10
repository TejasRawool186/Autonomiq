"""Planner Agent Node for Autonomiq.
Generates a structured execution plan from natural-language task objectives using local LLM inference.
"""

import json
import re
from typing import Dict, Any
from backend.app.agent.state import AgentState
from backend.app.agent.llm import OllamaClient


async def planner_node(state: AgentState) -> Dict[str, Any]:
    """Generates execution plan for the task dynamically from the local model."""
    client = OllamaClient(model=state.get("model_name"))
    prompt = f"""You are the Lead Planning Agent. Create a step-by-step research execution plan for:
Objective: "{state['objective']}"

You MUST respond ONLY with a raw JSON object (no markdown, no extra commentary):
{{
  "objective": "{state['objective']}",
  "steps": [
    {{"step_number": 1, "name": "Search", "description": "Execute live SerpApi searches", "tool": "serpapi"}},
    {{"step_number": 2, "name": "Extract", "description": "Scrape and sanitize web content", "tool": "scraper"}},
    {{"step_number": 3, "name": "Index", "description": "Vectorize into local Qdrant", "tool": "qdrant"}},
    {{"step_number": 4, "name": "Analyze", "description": "Synthesize evidence with local model", "tool": "llm"}},
    {{"step_number": 5, "name": "Report", "description": "Compile source-backed Markdown report", "tool": "reporter"}},
    {{"step_number": 6, "name": "Voice", "description": "Synthesize ElevenLabs audio digest", "tool": "elevenlabs"}}
  ],
  "estimated_duration_seconds": 60,
}}
"""
    raw = ""
    try:
        raw = await client.generate(prompt)
    except Exception as e:
        print(f"[Planner Notice] Ollama generation unavailable ({e}), using default structured research plan.")
    plan = None
    try:
        json_match = re.search(r"\{[\s\S]*\}", raw)
        if json_match:
            plan = json.loads(json_match.group(0))
    except Exception:
        pass

    if not plan or not isinstance(plan, dict) or "steps" not in plan:
        # Fallback to parsed model response lines
        plan = {
            "objective": state["objective"],
            "steps": [
                {"step_number": 1, "name": "Search", "description": f"Search web sources for {state['objective'][:40]}", "tool": "serpapi"},
                {"step_number": 2, "name": "Extract", "description": "Extract content from candidate URLs", "tool": "scraper"},
                {"step_number": 3, "name": "Index", "description": "Chunk & index evidence into Qdrant", "tool": "qdrant"},
                {"step_number": 4, "name": "Analyze", "description": f"Synthesize findings with {state.get('model_name')}", "tool": "llm"},
                {"step_number": 5, "name": "Report", "description": "Compile report with citations", "tool": "reporter"},
                {"step_number": 6, "name": "Voice", "description": "Synthesize audio digest with ElevenLabs", "tool": "elevenlabs"},
            ],
            "estimated_duration_seconds": 60,
            "safety_constraints": ["Ground claims strictly in retrieved sources"],
        }

    # Clean and extract concise, high-signal search queries
    clean_obj = " ".join((state.get("objective") or "").split())
    first_sentence = clean_obj.split(".")[0].strip()
    primary_query = first_sentence if len(first_sentence) <= 100 else clean_obj[:100]
    queries = [
        primary_query,
        f"{primary_query} overview benchmarks documentation",
    ]

    return {
        "plan": plan,
        "queries": queries,
        "current_step": "planned",
    }
