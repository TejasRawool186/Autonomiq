"""Artifact Pydantic Schemas.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ArtifactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_id: str
    file_name: str
    file_type: str
    file_path: str
    size_bytes: int
    checksum: Optional[str] = None
    created_at: datetime
