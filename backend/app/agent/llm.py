"""Ollama Local LLM Client for Gemma and Qwen models.
Directly communicates with local Ollama inference API.
"""

from typing import Dict, Any, Optional
import httpx
from backend.app.config import settings


class OllamaClient:
    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL

    async def generate(self, prompt: str, system: Optional[str] = None) -> str:
        """Call Ollama /api/generate endpoint directly."""
        url = f"{self.base_url}/api/generate"
        model_family = (
            "Gemma"
            if "gemma" in self.model.lower()
            else "Qwen"
            if "qwen" in self.model.lower()
            else "Local AI"
        )
        default_system = (
            f"You are Autonomiq, an autonomous research assistant powered by {model_family} ({self.model}). "
            "You provide accurate, well-structured, evidence-based research."
        )

        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system or default_system,
            "stream": False,
            "options": {
                "temperature": 0.2,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                res = await client.post(url, json=payload)
                res.raise_for_status()
                response_text = res.json().get("response", "").strip()
                if not response_text:
                    raise RuntimeError("Ollama returned an empty response.")
                return response_text
        except Exception as e:
            raise RuntimeError(
                f"Failed to communicate with Ollama at {self.base_url} using model '{self.model}': {str(e)}"
            )
