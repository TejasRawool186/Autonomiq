"""LangGraph Autonomous Agent Workflow Orchestrator.
Chains Planner -> Researcher -> Extractor -> Indexer -> Analyst -> Reporter.
"""

from typing import Dict, Any, Optional
from backend.app.agent.state import AgentState
from backend.app.agent.nodes.planner import planner_node
from backend.app.agent.nodes.researcher import researcher_node
from backend.app.agent.nodes.extractor import extractor_node
from backend.app.agent.nodes.indexer import indexer_node
from backend.app.agent.nodes.analyst import analyst_node
from backend.app.agent.nodes.reporter import reporter_node


class ResearchWorkflowGraph:
    """Orchestrates stateful execution across all research agent nodes."""

    @classmethod
    async def run(cls, initial_state: AgentState) -> AgentState:
        """Executes the full pipeline sequentially through all agent stages."""
        state = dict(initial_state)

        # 1. Planning
        if not state.get("plan"):
            plan_out = await planner_node(state)
            state.update(plan_out)

        # If user approval is required and not yet given, pause here
        if not state.get("plan_approved", True):
            return state

        # 2. Web Research
        res_out = await researcher_node(state)
        state.update(res_out)

        # 3. Extraction
        ext_out = await extractor_node(state)
        state.update(ext_out)

        # 4. RAG Indexing
        idx_out = await indexer_node(state)
        state.update(idx_out)

        # 5. Analysis
        ana_out = await analyst_node(state)
        state.update(ana_out)

        # 6. Report Generation
        rep_out = await reporter_node(state)
        state.update(rep_out)

        return state
