import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile

from app.api.dependencies import verify_api_key
from app.config import settings
from app.models.schemas import JobResponse, JobStatusResponse, TranscriptionResponse
from app.services.audio_processor import AudioProcessor
from app.services.rate_limiter import transcription_limiter
from app.services.transcription import transcription_service
from app.utils.helpers import safe_unlink
from app.utils.metrics import transcription_duration, transcription_failures, transcription_requests
from app.workers.celery_worker import celery_app, transcribe_task

router = APIRouter(prefix="/transcribe", tags=["transcription"], dependencies=[Depends(verify_api_key)])


def _save_upload(file: UploadFile) -> str:
    suffix = Path(file.filename or "audio.wav").suffix or ".wav"
    destination = settings.UPLOAD_DIR / f"{uuid.uuid4()}{suffix.lower()}"
    with open(destination, "wb") as output:
        shutil.copyfileobj(file.file, output)
    return str(destination)


@router.post("/file", response_model=TranscriptionResponse)
async def transcribe_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    language: str = "vi",
    enable_vad: bool = True,
    enable_noise_reduction: bool = False,
    return_timestamps: bool = True,
):
    transcription_requests.inc()
    saved_path = _save_upload(file)
    validation = AudioProcessor.validate_audio(saved_path)
    if not validation["valid"]:
        safe_unlink(saved_path)
        raise HTTPException(status_code=400, detail=validation["error"])

    background_tasks.add_task(safe_unlink, saved_path)
    try:
        async with transcription_limiter:
            with transcription_duration.time():
                return transcription_service.transcribe_file(
                    saved_path,
                    language=language,
                    enable_vad=enable_vad,
                    enable_noise_reduction=enable_noise_reduction,
                    return_timestamps=return_timestamps,
                )
    except ValueError as exc:
        transcription_failures.inc()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        transcription_failures.inc()
        raise HTTPException(status_code=500, detail="Transcription failed") from exc


@router.post("/async", response_model=JobResponse)
async def transcribe_async(file: UploadFile = File(...), language: str = "vi"):
    saved_path = _save_upload(file)
    validation = AudioProcessor.validate_audio(saved_path)
    if not validation["valid"]:
        safe_unlink(saved_path)
        raise HTTPException(status_code=400, detail=validation["error"])
    task = transcribe_task.delay(saved_path, {"language": language})
    return JobResponse(job_id=task.id, status="pending")


@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_transcription_status(job_id: str):
    result = celery_app.AsyncResult(job_id)
    payload = result.result if result.successful() and isinstance(result.result, dict) else None
    error = str(result.result) if result.failed() else None
    return JobStatusResponse(job_id=job_id, status=result.status.lower(), result=payload, error=error)

