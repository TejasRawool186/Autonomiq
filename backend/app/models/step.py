"""Execution Step entity model for Autonomiq.
Tracks granular execution stages within a task workflow.
"""

from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Step(Base):
    __tablename__ = "steps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)  # plan, search, extract, index, analyze, report, voice
    status = Column(String(50), default="pending", nullable=False)  # pending, running, completed, failed, skipped
    attempt_count = Column(Integer, default=1, nullable=False)
    
    output_data = Column(Text, nullable=True)
    error_info = Column(Text, nullable=True)
    
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    task = relationship("Task", back_populates="steps")
