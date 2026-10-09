"""Web Scraper Tool for Autonomiq.
Extracts and sanitizes text from HTML pages using BeautifulSoup.
"""

from typing import Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup


class WebScraper:
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
    async def scrape_url(cls, url: str) -> Dict[str, Any]:
        """Fetch URL content over HTTP and sanitize HTML."""
        headers = {
            "User-Agent": "AutonomiqResearchBot/1.0 (+https://github.com/TejasRawool186/Autonomiq)"
        }
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.get(url, headers=headers)
                resp.raise_for_status()
                return cls.parse_html(resp.text, url=url)
        except Exception as e:
            return {
                "title": f"Failed extraction: {url}",
                "url": url,
                "content": f"[Extraction failed: {str(e)}]",
                "char_count": 0,
                "error": str(e),
            }
