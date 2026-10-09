"""Tests for SerpApiClient and WebScraper.
"""

import sys
import asyncio
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.app.tools.search import SerpApiClient
from backend.app.tools.scraper import WebScraper


def test_html_scraping():
    html = """
    <html>
        <head><title>Gemma 2 Benchmark Report</title></head>
        <body>
            <nav><a href="/">Home</a></nav>
            <h1>Overview</h1>
            <p>Gemma 2 9B outperforms comparable models in MMLU and coding benchmarks.</p>
            <script>console.log("analytics");</script>
        </body>
    </html>
    """
    res = WebScraper.parse_html(html, url="https://deepmind.google/gemma")
    assert res["title"] == "Gemma 2 Benchmark Report"
    assert "Gemma 2 9B outperforms comparable models" in res["content"]
    assert "console.log" not in res["content"]


async def async_test_search():
    client = SerpApiClient(api_key=None)  # Tests mock fallback
    results = await client.search("open-source AI models 2026", num_results=2)
    assert len(results) == 2
    assert "open-source AI models 2026" in results[0]["title"]


def test_search():
    asyncio.run(async_test_search())


if __name__ == "__main__":
    test_html_scraping()
    test_search()
    print("All tool tests passed!")
