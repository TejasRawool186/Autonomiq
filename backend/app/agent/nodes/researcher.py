"""Researcher Agent Node for Autonomiq.
Executes web queries using SerpApi tool and collects raw source candidates.
"""

from typing import Dict, Any
from backend.app.agent.state import AgentState
from backend.app.tools.search import SerpApiClient


async def researcher_node(state: AgentState) -> Dict[str, Any]:
    """Runs web search grounding across generated queries."""
    client = SerpApiClient()
    all_sources = list(state.get("raw_sources", []))
    queries = state.get("queries", [state["objective"]])

    for q in queries[:2]:
        results = await client.search(q, num_results=3)
        for r in results:
            # Avoid duplicate URLs
            if not any(s.get("url") == r.get("url") for s in all_sources):
                all_sources.append({
                    "title": r.get("title"),
                    "url": r.get("url"),
                    "snippet": r.get("snippet"),
                    "content": r.get("snippet", ""),
                    "source_type": "web",
                })

    return {
        "raw_sources": all_sources,
        "current_step": "research_completed",
    }
