"""Task entity model for Autonomiq.
Represents a user-submitted autonomous research objective.
"""

from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    task_type = Column(String(50), default="research", nullable=False)
    status = Column(String(50), default="created", nullable=False)  # created, planned, running, completed, failed, cancelled
    model_name = Column(String(100), default="gemma3:1b", nullable=False)
    
    plan_json = Column(Text, nullable=True)
    plan_approved = Column(Boolean, default=False, nullable=False)
    error_summary = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    steps = relationship("Step", back_populates="task", cascade="all, delete-orphan", order_by="Step.created_at")
    sources = relationship("Source", back_populates="task", cascade="all, delete-orphan")
    artifacts = relationship("Artifact", back_populates="task", cascade="all, delete-orphan")
