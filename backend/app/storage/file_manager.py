"""Local File & Storage Manager for Autonomiq.
Handles uploads, local filesystem artifacts, hashes, and cleanup.
"""

import hashlib
import os
import shutil
from pathlib import Path
from typing import Tuple
from backend.app.config import settings


class FileManager:
    @staticmethod
    def calculate_checksum(file_path: Path) -> str:
        """Calculate SHA256 checksum of a file."""
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(8192):
                sha256.update(chunk)
        return sha256.hexdigest()

    @staticmethod
    def save_upload(file_bytes: bytes, filename: str) -> Tuple[Path, str, int]:
        """Save an uploaded file into data/uploads and return (path, checksum, size)."""
        settings.ensure_directories()
        clean_name = Path(filename).name
        target_path = settings.UPLOAD_DIR / clean_name
        
        # Ensure unique name if exists
        counter = 1
        stem = target_path.stem
        suffix = target_path.suffix
        while target_path.exists():
            target_path = settings.UPLOAD_DIR / f"{stem}_{counter}{suffix}"
            counter += 1

        with open(target_path, "wb") as f:
            f.write(file_bytes)

        checksum = hashlib.sha256(file_bytes).hexdigest()
        size = len(file_bytes)
        return target_path, checksum, size

    @staticmethod
    def save_artifact(task_id: str, filename: str, content: bytes) -> Tuple[Path, str, int]:
        """Save a generated task artifact (e.g., report or mp3)."""
        settings.ensure_directories()
        task_dir = settings.ARTIFACT_DIR / task_id
        task_dir.mkdir(parents=True, exist_ok=True)
        
        target_path = task_dir / filename
        with open(target_path, "wb") as f:
            f.write(content)

        checksum = hashlib.sha256(content).hexdigest()
        size = len(content)
        return target_path, checksum, size
