"""Artifact entity model for Autonomiq.
Tracks generated reports, audio MP3s, and exported datasets.
"""

from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # report_markdown, audio_mp3, json_export
    file_path = Column(String(1024), nullable=False)
    size_bytes = Column(Integer, default=0, nullable=False)
    checksum = Column(String(64), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    task = relationship("Task", back_populates="artifacts")
