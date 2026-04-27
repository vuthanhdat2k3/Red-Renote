from typing import Any, Optional

from pydantic import BaseModel, Field


class SegmentInput(BaseModel):
    start: float = 0.0
    end: float = 0.0
    text: str
    speaker: str = "Speaker"


class CreateMeetingFromTranscriptRequest(BaseModel):
    title: str
    owner_user_id: str
    transcript: str
    project: str = "Red Renote"
    participants: int = 1
    tags: list[str] = Field(default_factory=list)
    segments: list[SegmentInput] = Field(default_factory=list)
    audio_url: str = ""
    run_analysis: bool = True


class MeetingResponse(BaseModel):
    id: str
    title: str
    status: str
    summary: str = ""
    key_takeaways: list[str] = Field(default_factory=list)
    decisions: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    follow_ups: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    mindmap: dict[str, Any] = Field(default_factory=dict)


class TaskResponse(BaseModel):
    id: str
    title: str
    owner: str
    deadline: str
    status: str
    source_timestamp: str
    meeting_id: str


class TranscriptItemResponse(BaseModel):
    id: str
    speaker: str
    speaker_color: str
    timestamp: str
    text: str
    is_highlighted: bool


class AIMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp_references: list[str] = Field(default_factory=list)


class MeetingDetailResponse(MeetingResponse):
    date: str
    duration: str
    participants: int
    project: str
    audio_url: str
    tasks: list[TaskResponse] = Field(default_factory=list)
    transcript: list[TranscriptItemResponse] = Field(default_factory=list)
    ai_messages: list[AIMessageResponse] = Field(default_factory=list)


class CreateMeetingResponse(BaseModel):
    meeting: MeetingResponse
    llm_job_id: Optional[str] = None


class RegenerateResponse(BaseModel):
    meeting_id: str
    llm_job_id: str
    status: str


class ChatRequest(BaseModel):
    question: str
    owner_user_id: str


class ChatResponse(BaseModel):
    meeting_id: str
    response: str
    timestamp_references: list[str] = Field(default_factory=list)
