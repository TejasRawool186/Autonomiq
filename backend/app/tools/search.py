"""SerpApi Live Search Tool for Autonomiq.
Executes web searches, preserves source citations, and provides offline fallback.
"""

from typing import List, Dict, Any, Optional
import httpx
from backend.app.config import settings


class SerpApiClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.SERPAPI_API_KEY
        self.base_url = "https://serpapi.com/search.json"

    async def search(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """Search Google via SerpApi or return mock results if no API key is set."""
        if not self.api_key:
            return self._mock_search(query, num_results)

        params = {
            "q": query,
            "api_key": self.api_key,
            "engine": "google",
            "num": num_results,
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
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
        except Exception:
            return self._mock_search(query, num_results)

    def _mock_search(self, query: str, num_results: int) -> List[Dict[str, Any]]:
        """Fallback mock search results for offline development and testing."""
        return [
            {
                "title": f"Research Overview: {query}",
                "url": f"https://example.org/research?q={query.replace(' ', '+')}",
                "snippet": f"Comprehensive open-source benchmarks and analysis regarding {query}.",
                "source": "fallback_mock",
            },
            {
                "title": f"Technical Documentation on {query}",
                "url": f"https://example.org/docs?q={query.replace(' ', '+')}",
                "snippet": f"Detailed architectural specifications, model weights, and performance statistics.",
                "source": "fallback_mock",
            },
        ][:num_results]
