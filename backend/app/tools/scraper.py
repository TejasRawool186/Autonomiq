"""Web Scraper Tool for Autonomiq.
Extracts and sanitizes text from HTML pages using BeautifulSoup.
"""

import asyncio
import time
from typing import Dict, Any, Optional
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup


class WebScraper:
    _last_domain_request: Dict[str, float] = {}
    _domain_lock = asyncio.Lock()

    @staticmethod
    def parse_html(html_content: str, url: Optional[str] = None) -> Dict[str, Any]:
        """Parse raw HTML and extract title, clean text, and links."""
        soup = BeautifulSoup(html_content, "html.parser")

        # Strip scripts, styles, forms, navigations
        for tag in soup(["script", "style", "noscript", "nav", "footer", "header", "aside"]):
            tag.decompose()

        title = soup.title.string.strip() if (soup.title and soup.title.string) else "Untitled Source"

        # Get text
        text = soup.get_text(separator="\n")
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        clean_text = "\n".join(lines)

        return {
            "title": title,
            "url": url or "",
            "content": clean_text,
            "char_count": len(clean_text),
        }

    @classmethod
    async def scrape_url(cls, url: str, polite_delay_seconds: float = 0.5) -> Dict[str, Any]:
        """Fetch URL content over HTTP with polite per-domain rate limiting and sanitize HTML."""
        headers = {
            "User-Agent": "AutonomiqResearchBot/1.0 (+https://github.com/TejasRawool186/Autonomiq)"
        }
        domain = urlparse(url).netloc

        # Domain throttling
        async with cls._domain_lock:
            last_time = cls._last_domain_request.get(domain, 0.0)
            now = time.time()
            elapsed = now - last_time
            if elapsed < polite_delay_seconds:
                await asyncio.sleep(polite_delay_seconds - elapsed)
            cls._last_domain_request[domain] = time.time()

        try:
            async with httpx.AsyncClient(timeout=12.0, follow_redirects=True, max_redirects=5) as client:
                resp = await client.get(url, headers=headers)
                resp.raise_for_status()
                # Safety check: avoid parsing > 5MB text blobs
                if len(resp.content) > 5 * 1024 * 1024:
                    return {
                        "title": f"Oversized: {url}",
                        "url": url,
                        "content": f"[Skipped: response payload exceeds 5MB limit]",
                        "char_count": 0,
                    }
                return cls.parse_html(resp.text, url=url)
        except Exception as e:
            return {
                "title": f"Failed extraction: {url}",
                "url": url,
                "content": f"[Extraction failed: {str(e)}]",
                "char_count": 0,
                "error": str(e),
            }

