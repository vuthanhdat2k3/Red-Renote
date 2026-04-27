from sqlalchemy import (
    ARRAY,
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    MetaData,
    String,
    Table,
    Text,
    create_engine,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import sessionmaker

from app.config import settings

metadata = MetaData(schema="public")

meetings = Table(
    "meetings",
    metadata,
    Column("id", Text, primary_key=True),
    Column("owner_user_id", UUID(as_uuid=False), nullable=False),
    Column("title", Text, nullable=False),
    Column("date", Text, nullable=False),
    Column("duration", Text, nullable=False),
    Column("participants", Integer, nullable=False),
    Column("project", Text, nullable=False),
    Column("audio_url", Text, nullable=False),
    Column("summary", Text, nullable=False),
    Column("key_takeaways", ARRAY(Text), nullable=False),
    Column("decisions", ARRAY(Text), nullable=False),
    Column("risks", ARRAY(Text), nullable=False),
    Column("follow_ups", ARRAY(Text), nullable=False),
    Column("status", Text, nullable=False),
    Column("tags", ARRAY(Text), nullable=False),
    Column("mindmap", JSON, nullable=False),
    Column("created_at", DateTime(timezone=True), nullable=False),
    Column("updated_at", DateTime(timezone=True), nullable=False),
)

tasks = Table(
    "tasks",
    metadata,
    Column("id", Text, primary_key=True),
    Column("meeting_id", Text, ForeignKey("public.meetings.id"), nullable=False),
    Column("title", Text, nullable=False),
    Column("owner", Text, nullable=False),
    Column("deadline", Text, nullable=False),
    Column("status", Text, nullable=False),
    Column("source_timestamp", Text, nullable=False),
    Column("created_at", DateTime(timezone=True), nullable=False),
)

transcript_items = Table(
    "transcript_items",
    metadata,
    Column("id", Text, primary_key=True),
    Column("meeting_id", Text, ForeignKey("public.meetings.id"), nullable=False),
    Column("position", Integer, nullable=False),
    Column("speaker", Text, nullable=False),
    Column("speaker_color", Text, nullable=False),
    Column("timestamp", Text, nullable=False),
    Column("text", Text, nullable=False),
    Column("is_highlighted", Boolean, nullable=False),
)

ai_messages = Table(
    "ai_messages",
    metadata,
    Column("id", Text, primary_key=True),
    Column("meeting_id", Text, ForeignKey("public.meetings.id"), nullable=False),
    Column("position", Integer, nullable=False),
    Column("role", Text, nullable=False),
    Column("content", Text, nullable=False),
    Column("timestamp_references", ARRAY(Text), nullable=False),
    Column("created_at", DateTime(timezone=True), nullable=False),
)

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

