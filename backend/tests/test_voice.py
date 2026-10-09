"""Tests for ElevenLabsVoiceEngine.
"""

import sys
import asyncio
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.app.tools.elevenlabs_voice import ElevenLabsVoiceEngine


async def async_test_voice():
    engine = ElevenLabsVoiceEngine(api_key=None)  # Tests fallback generation
    path, checksum, size = await engine.generate_audio_digest(
        task_id="test_voice_task",
        summary_text="Welcome back. Your research on open-source AI models is ready.",
    )

    assert path.exists()
    assert size > 0
    assert len(checksum) == 64
    assert path.name == "digest.mp3"

    # Cleanup
    path.unlink()
    path.parent.rmdir()


def test_voice():
    asyncio.run(async_test_voice())


if __name__ == "__main__":
    test_voice()
    print("Voice test passed!")
