"""Source Pydantic Schemas.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class SourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_id: str
    url: Optional[str] = None
    title: Optional[str] = None
    source_type: str
    extraction_status: str
    snippet: Optional[str] = None
    created_at: datetime
