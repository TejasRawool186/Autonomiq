"""State definitions for the Autonomiq LangGraph Autonomous Agent.
"""

from typing import TypedDict, List, Dict, Any, Optional


class AgentState(TypedDict):
    task_id: str
    objective: str
    model_name: str
    plan: Optional[Dict[str, Any]]
    plan_approved: bool
    queries: List[str]
    raw_sources: List[Dict[str, Any]]
    retrieved_chunks: List[Dict[str, Any]]
    analysis: Optional[str]
    report_markdown: Optional[str]
    audio_path: Optional[str]
    current_step: str
    errors: List[str]
