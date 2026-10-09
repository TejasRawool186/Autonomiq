"""Source entity model for Autonomiq.
Stores discovered URLs, crawled web pages, and uploaded documents linked to research.
"""

from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Source(Base):
    __tablename__ = "sources"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False, index=True)
    url = Column(String(2048), nullable=True)
    title = Column(String(512), nullable=True)
    source_type = Column(String(50), default="web", nullable=False)  # web, pdf, text, markdown
    content_hash = Column(String(64), nullable=True)
    extraction_status = Column(String(50), default="extracted", nullable=False)  # pending, extracted, failed
    snippet = Column(Text, nullable=True)
    full_content = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    task = relationship("Task", back_populates="sources")
