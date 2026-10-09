"""SerpApi Live Search Tool for Autonomiq.
Executes real web searches using the SerpApi REST API.
"""

import asyncio
from typing import List, Dict, Any, Optional
import httpx
from backend.app.config import settings


class SerpApiClient:
    def __init__(self, api_key: Optional[str] = None, timeout: float = 25.0):
        self.api_key = api_key or settings.SERPAPI_API_KEY
        self.base_url = "https://serpapi.com/search.json"
        self.timeout = timeout

    async def search(self, query: str, num_results: int = 5, max_retries: int = 2) -> List[Dict[str, Any]]:
        """Search Google live via SerpApi with exponential backoff retry."""
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

        last_error = None
        for attempt in range(max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    res = await client.get(self.base_url, params=params)
                    res.raise_for_status()
                    data = res.json()
                    break
            except (httpx.RequestError, httpx.HTTPStatusError) as exc:
                last_error = exc
                if attempt < max_retries:
                    await asyncio.sleep(1.0 * (attempt + 1))
                else:
                    raise RuntimeError(f"SerpApi query failed after {max_retries + 1} attempts: {last_error}")

        results = []
        for item in data.get("organic_results", [])[:num_results]:
            results.append({
                "title": item.get("title", ""),
                "url": item.get("link", ""),
                "snippet": item.get("snippet", ""),
                "source": "serpapi",
            })
        return results

