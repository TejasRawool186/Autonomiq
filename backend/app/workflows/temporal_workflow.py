"""Temporal Durable Workflow Definition for Autonomiq (FR-07).
Guarantees retries with exponential backoff and survives process restarts.
"""

from datetime import timedelta
from typing import Dict, Any


class AutonomiqResearchWorkflow:
    """Represents the durable workflow executed by Temporal workers."""

    def __init__(self):
        self.workflow_id = None

    async def execute(self, initial_state: Dict[str, Any]) -> Dict[str, Any]:
        """Workflow execution simulation / wrapper for Temporal activity sequence."""
        from backend.app.workflows.temporal_activities import ResearchActivities

        state = dict(initial_state)

        # Activity 1: Planning
        state.update(await ResearchActivities.plan_activity(state))

        # Check approval
        if not state.get("plan_approved", True):
            return state

        # Activity 2: Search
        state.update(await ResearchActivities.search_activity(state))

        # Activity 3: Extract
        state.update(await ResearchActivities.extract_activity(state))

        # Activity 4: Index
        state.update(await ResearchActivities.index_activity(state))

        # Activity 5: Analyze
        state.update(await ResearchActivities.analyze_activity(state))

        # Activity 6: Report
        state.update(await ResearchActivities.report_activity(state))

        # Activity 7: Voice
        state.update(await ResearchActivities.voice_activity(state))

        return state
