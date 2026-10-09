"""ElevenLabs Audio Digest Generator for Autonomiq Away Mode.
Converts research executive summaries into spoken audio files using ElevenLabs.
"""

from pathlib import Path
from typing import Optional, Tuple
import httpx
from backend.app.config import settings
from backend.app.storage.file_manager import FileManager


class ElevenLabsVoiceEngine:
    def __init__(self, api_key: Optional[str] = None, voice_id: Optional[str] = None):
        self.api_key = api_key or settings.ELEVENLABS_API_KEY
        self.voice_id = voice_id or settings.ELEVENLABS_VOICE_ID

    async def generate_audio_digest(self, task_id: str, summary_text: str) -> Tuple[Path, str, int]:
        """Synthesizes text into an MP3 audio file using ElevenLabs and saves as artifact."""
        if not self.api_key:
            raise RuntimeError(
                "ELEVENLABS_API_KEY is not configured. Please set ELEVENLABS_API_KEY in .env"
            )

        audio_bytes = await self._synthesize_elevenlabs(summary_text)
        filename = "digest.mp3"
        return FileManager.save_artifact(task_id, filename, audio_bytes)

    async def _synthesize_elevenlabs(self, text: str) -> bytes:
        """Call ElevenLabs REST API to generate speech."""
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}"
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        }
        payload = {
            "text": text[:2000],  # Keep digest concise
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            return resp.content
