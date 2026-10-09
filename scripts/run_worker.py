"""Launcher script for Autonomiq Temporal background worker.
"""

import sys
import asyncio
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.workflows.worker import run_temporal_worker

if __name__ == "__main__":
    print("Starting Autonomiq Temporal Background Worker...")
    asyncio.run(run_temporal_worker())
