"""Step Pydantic Schemas.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class StepResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_id: str
    name: str
    status: str
    attempt_count: int
    output_data: Optional[str] = None
    error_info: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


class StepEvent(BaseModel):
    task_id: str
    step_name: str
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None
    timestamp: datetime = datetime.utcnow()
