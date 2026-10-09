"""ElevenLabs Audio Digest Generator for Autonomiq Away Mode.
Converts research executive summaries into spoken audio files.
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
        """Synthesizes text into an MP3 audio file and saves as task artifact."""
        if self.api_key:
            audio_bytes = await self._synthesize_elevenlabs(summary_text)
        else:
            audio_bytes = self._generate_fallback_audio(summary_text)

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
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            return resp.content

    def _generate_fallback_audio(self, text: str) -> bytes:
        """Generates a valid lightweight MP3 header/frame for offline test modes."""
        # Standard silent MP3 frame bytes
        mp3_silent_frame = b"\xff\xfb\x90\x64\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00" * 32
        return mp3_silent_frame
