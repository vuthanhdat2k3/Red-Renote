from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from sqlalchemy.exc import SQLAlchemyError

from app.api.dependencies import verify_internal_api_key
from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    CreateMeetingFromTranscriptRequest,
    CreateMeetingResponse,
    MeetingDetailResponse,
    MeetingResponse,
    RegenerateResponse,
    SegmentInput,
)
from app.services.llm import llm_service
from app.services.repository import meeting_repository
from app.services.stt_client import stt_client
from app.workers.celery_worker import process_meeting_llm

router = APIRouter(prefix="/meetings", tags=["meetings"], dependencies=[Depends(verify_internal_api_key)])


def _to_response(meeting: dict) -> MeetingResponse:
    return MeetingResponse(
        id=meeting["id"],
        title=meeting["title"],
        status=meeting["status"],
        summary=meeting.get("summary") or "",
        key_takeaways=meeting.get("key_takeaways") or [],
        decisions=meeting.get("decisions") or [],
        risks=meeting.get("risks") or [],
        follow_ups=meeting.get("follow_ups") or [],
        tags=meeting.get("tags") or [],
        mindmap=meeting.get("mindmap") or {},
    )


def _to_detail_response(meeting: dict) -> MeetingDetailResponse:
    return MeetingDetailResponse(
        **_to_response(meeting).model_dump(),
        date=meeting["date"],
        duration=meeting["duration"],
        participants=meeting["participants"],
        project=meeting["project"],
        audio_url=meeting["audio_url"],
        tasks=meeting.get("tasks") or [],
        transcript=meeting.get("transcript") or [],
        ai_messages=meeting.get("ai_messages") or [],
    )


@router.post("/from-transcript", response_model=CreateMeetingResponse)
async def create_meeting_from_transcript(payload: CreateMeetingFromTranscriptRequest):
    meeting = meeting_repository.create_from_transcript(
        title=payload.title,
        owner_user_id=payload.owner_user_id,
        transcript=payload.transcript,
        project=payload.project,
        participants=payload.participants,
        tags=payload.tags,
        segments=payload.segments,
        audio_url=payload.audio_url,
        status="processing" if payload.run_analysis else "completed",
    )
    job = process_meeting_llm.delay(meeting["id"]) if payload.run_analysis else None
    return CreateMeetingResponse(meeting=_to_response(meeting), llm_job_id=job.id if job else None)


@router.post("/from-audio", response_model=CreateMeetingResponse)
async def create_meeting_from_audio(
    file: UploadFile = File(...),
    title: str = Form(...),
    owner_user_id: str = Form(...),
    project: str = Form("Red Renote"),
    participants: int = Form(1),
    tags: str = Form(""),
    audio_url: str = Form(""),
    run_analysis: bool = Form(True),
):
    try:
        stt_result = await stt_client.transcribe_upload(file.file, file.filename or "audio.wav", file.content_type)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="STT service failed") from exc

    segments = [
        SegmentInput(
            start=segment.get("start", 0.0),
            end=segment.get("end", 0.0),
            text=segment.get("text", ""),
            speaker="Speaker",
        )
        for segment in stt_result.get("segments", [])
        if segment.get("text")
    ]
    metadata = stt_result.get("metadata", {})
    try:
        meeting = meeting_repository.create_from_transcript(
            title=title,
            owner_user_id=owner_user_id,
            transcript=stt_result.get("transcript", ""),
            project=project,
            participants=participants,
            tags=[tag.strip() for tag in tags.split(",") if tag.strip()],
            segments=segments,
            audio_url=audio_url,
            duration_seconds=float(metadata.get("duration", 0.0) or 0.0),
            status="processing" if run_analysis else "completed",
        )
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="Database is unavailable. Check Supabase/Postgres connectivity from Docker.") from exc
    job = process_meeting_llm.delay(meeting["id"]) if run_analysis else None
    return CreateMeetingResponse(meeting=_to_response(meeting), llm_job_id=job.id if job else None)


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(meeting_id: str):
    try:
        return _to_response(meeting_repository.get(meeting_id))
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Meeting not found") from exc


@router.get("/{meeting_id}/detail", response_model=MeetingDetailResponse)
async def get_meeting_detail(meeting_id: str):
    try:
        return _to_detail_response(meeting_repository.get_detail(meeting_id))
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Meeting not found") from exc


@router.post("/{meeting_id}/regenerate", response_model=RegenerateResponse)
async def regenerate_meeting(meeting_id: str, request: Request):
    try:
        meeting_repository.get(meeting_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Meeting not found") from exc
    try:
        body = await request.json()
        language = body.get("language", "en") if isinstance(body, dict) else "en"
    except Exception:
        language = "en"
    meeting_repository.update_status(meeting_id, "processing")
    job = process_meeting_llm.delay(meeting_id, language)
    return RegenerateResponse(meeting_id=meeting_id, llm_job_id=job.id, status="queued")


@router.post("/{meeting_id}/chat", response_model=ChatResponse)
async def chat_with_meeting(meeting_id: str, payload: ChatRequest):
    try:
        meeting = meeting_repository.get(meeting_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Meeting not found") from exc
    if str(meeting["owner_user_id"]) != payload.owner_user_id:
        raise HTTPException(status_code=403, detail="Meeting does not belong to this user")

    transcript = meeting_repository.get_transcript_text(meeting_id)
    history = meeting_repository.get_chat_history(meeting_id)
    meeting_repository.append_chat(meeting_id, "user", payload.question)
    answer = llm_service.answer_question(payload.question, transcript, history)
    meeting_repository.append_chat(meeting_id, "assistant", answer)
    return ChatResponse(meeting_id=meeting_id, response=answer, timestamp_references=[])
