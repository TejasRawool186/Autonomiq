"""Task Pydantic Schemas.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.step import StepResponse
from backend.app.schemas.source import SourceResponse
from backend.app.schemas.artifact import ArtifactResponse


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255, description="Brief task title")
    description: str = Field(..., min_length=5, description="Full research query or objective")
    task_type: str = Field(default="research", description="Task type: research, analysis, rag")
    model_name: Optional[str] = Field(default="gemma2:9b")
    source_urls: Optional[List[str]] = Field(default_factory=list, description="Initial reference URLs")
    auto_approve_plan: bool = Field(default=False, description="Start execution immediately after planning")


class PlanStep(BaseModel):
    step_number: int
    name: str
    description: str
    tool: str


class TaskPlan(BaseModel):
    objective: str
    steps: List[PlanStep]
    estimated_duration_seconds: int
    safety_constraints: List[str] = Field(default_factory=list)


class PlanApprovalRequest(BaseModel):
    approved: bool = True
    feedback: Optional[str] = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    task_type: str
    status: str
    model_name: str
    plan_approved: bool
    created_at: datetime
    updated_at: datetime


class TaskDetailResponse(TaskResponse):
    plan_json: Optional[str] = None
    error_summary: Optional[str] = None
    steps: List[StepResponse] = Field(default_factory=list)
    sources: List[SourceResponse] = Field(default_factory=list)
    artifacts: List[ArtifactResponse] = Field(default_factory=list)
