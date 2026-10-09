"""SerpApi Live Search Tool for Autonomiq.
Executes real web searches using the SerpApi REST API.
"""

from typing import List, Dict, Any, Optional
import httpx
from backend.app.config import settings


class SerpApiClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.SERPAPI_API_KEY
        self.base_url = "https://serpapi.com/search.json"

    async def search(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """Search Google live via SerpApi."""
        if not self.api_key:
            raise RuntimeError(
                "SERPAPI_API_KEY is not set. Please provide a valid SerpApi API key in .env"
            )

        params = {
            "q": query,
            "api_key": self.api_key,
            "engine": "google",
            "num": num_results,
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.get(self.base_url, params=params)
            res.raise_for_status()
            data = res.json()

        results = []
        for item in data.get("organic_results", [])[:num_results]:
            results.append({
                "title": item.get("title", ""),
                "url": item.get("link", ""),
                "snippet": item.get("snippet", ""),
                "source": "serpapi",
            })
        return results
