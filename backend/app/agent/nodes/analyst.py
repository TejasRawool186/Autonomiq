"""Analyst Agent Node for Autonomiq.
Applies Gemma local inference to reason over retrieved RAG evidence.
"""

from typing import Dict, Any
from backend.app.agent.state import AgentState
from backend.app.agent.llm import OllamaClient


async def analyst_node(state: AgentState) -> Dict[str, Any]:
    """Synthesizes evidence using Gemma local LLM with prompt token budgeting."""
    client = OllamaClient(model=state.get("model_name"))
    chunks = state.get("retrieved_chunks", [])

    context_str = "\n\n".join([
        f"[Source: {c.get('source_title')} | URL: {c.get('source_url')}]\n{c.get('text')}"
        for c in chunks
    ])

    prompt = f"""You are analyzing research evidence for the objective:
"{state['objective']}"

EVIDENCE RETRIEVED:
{context_str}

Perform a rigorous, objective synthesis:
1. Core Findings and Insights
2. Comparative Analysis
3. Technical Feasibility & Hardware Constraints
4. Limitations
Provide clear, grounded analysis without making up unsupported claims.
"""
    # Estimate prompt token count (approx 4 chars per token)
    est_prompt_tokens = max(1, len(prompt) // 4)

    analysis = await client.generate(prompt)
    est_completion_tokens = max(1, len(analysis) // 4)

    return {
        "analysis": analysis,
        "current_step": "analysis_completed",
        "tokens_used": {
            "prompt_tokens_est": est_prompt_tokens,
            "completion_tokens_est": est_completion_tokens,
            "total_tokens_est": est_prompt_tokens + est_completion_tokens,
        },
    }

