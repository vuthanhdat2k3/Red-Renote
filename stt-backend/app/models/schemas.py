from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class Segment(BaseModel):
    start: float
    end: float
    text: str
    avg_logprob: Optional[float] = None
    no_speech_prob: Optional[float] = None


class TranscriptionMetadata(BaseModel):
    duration: float = 0.0
    language: str = "vi"
    processing_time: float
    model_size: str
    cached: bool = False


class TranscriptionResponse(BaseModel):
    status: Literal["success"]
    transcript: str
    segments: list[Segment]
    metadata: TranscriptionMetadata


class JobResponse(BaseModel):
    job_id: str
    status: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    result: Optional[dict[str, Any]] = None
    error: Optional[str] = None


class ErrorResponse(BaseModel):
    status: Literal["error"] = "error"
    error: str

