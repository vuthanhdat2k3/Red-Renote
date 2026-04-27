from datetime import datetime, timezone

from sqlalchemy import JSON, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Transcription(Base):
    __tablename__ = "transcriptions"

    id = Column(Integer, primary_key=True)
    job_id = Column(String(36), unique=True, index=True, nullable=False)
    filename = Column(String(255), nullable=False)
    language = Column(String(10), nullable=False, default="vi")
    status = Column(String(20), nullable=False, default="pending")
    transcript = Column(Text)
    segments = Column(JSON)
    extra_metadata = Column("metadata", JSON)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime)
    processing_time = Column(Float)

