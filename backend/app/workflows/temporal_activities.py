"""Temporal Workflow Activities for Autonomiq.
Decomposes the research pipeline into isolated, retryable activities.
"""

from typing import Dict, Any
from backend.app.agent.nodes.planner import planner_node
from backend.app.agent.nodes.researcher import researcher_node
from backend.app.agent.nodes.extractor import extractor_node
from backend.app.agent.nodes.indexer import indexer_node
from backend.app.agent.nodes.analyst import analyst_node
from backend.app.agent.nodes.reporter import reporter_node
from backend.app.tools.elevenlabs_voice import ElevenLabsVoiceEngine


class ResearchActivities:
    @staticmethod
    async def plan_activity(state: Dict[str, Any]) -> Dict[str, Any]:
        """Activity: Generate structured plan."""
        return await planner_node(state)

    @staticmethod
    async def search_activity(state: Dict[str, Any]) -> Dict[str, Any]:
        """Activity: Query SerpApi for web sources."""
        return await researcher_node(state)

    @staticmethod
    async def extract_activity(state: Dict[str, Any]) -> Dict[str, Any]:
        """Activity: Scrape and sanitize web content."""
        return await extractor_node(state)

    @staticmethod
    async def index_activity(state: Dict[str, Any]) -> Dict[str, Any]:
        """Activity: Chunk and index in Qdrant."""
        return await indexer_node(state)

    @staticmethod
    async def analyze_activity(state: Dict[str, Any]) -> Dict[str, Any]:
        """Activity: Gemma local reasoning."""
        return await analyst_node(state)

    @staticmethod
    async def report_activity(state: Dict[str, Any]) -> Dict[str, Any]:
        """Activity: Markdown report compilation."""
        return await reporter_node(state)

    @staticmethod
    async def voice_activity(state: Dict[str, Any]) -> Dict[str, Any]:
        """Activity: Synthesize ElevenLabs audio digest."""
        engine = ElevenLabsVoiceEngine()
        summary = state.get("analysis", "Research complete.")[:1500]
        path, checksum, size = await engine.generate_audio_digest(state["task_id"], summary)
        return {"audio_path": str(path), "audio_checksum": checksum, "audio_size": size}
