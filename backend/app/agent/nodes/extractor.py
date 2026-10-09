"""Extractor Agent Node for Autonomiq.
Scrapes candidate URLs, normalizes content, and strips web noise.
"""

from typing import Dict, Any
from backend.app.agent.state import AgentState
from backend.app.tools.scraper import WebScraper


async def extractor_node(state: AgentState) -> Dict[str, Any]:
    """Scrapes raw web pages and enriches them with sanitized text."""
    sources = list(state.get("raw_sources", []))
    enriched_sources = []

    for src in sources:
        url = src.get("url")
        if url and (url.startswith("http://") or url.startswith("https://")):
            extracted = await WebScraper.scrape_url(url)
            if extracted.get("content"):
                src["content"] = extracted["content"]
                if extracted.get("title") and extracted["title"] != "Untitled Source":
                    src["title"] = extracted["title"]
        enriched_sources.append(src)

    return {
        "raw_sources": enriched_sources,
        "current_step": "extraction_completed",
    }
