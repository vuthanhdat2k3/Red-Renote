from celery import Celery

from app.config import settings
from app.services.transcription import transcription_service
from app.utils.helpers import safe_unlink

celery_app = Celery("stt_worker", broker=settings.CELERY_BROKER_URL, backend=settings.CELERY_RESULT_BACKEND)


@celery_app.task(bind=True, max_retries=3)
def transcribe_task(self, file_path: str, options: dict):
    try:
        return transcription_service.transcribe_file(
            file_path,
            language=options.get("language", "vi"),
            enable_vad=options.get("enable_vad", True),
            enable_noise_reduction=options.get("enable_noise_reduction", False),
            return_timestamps=options.get("return_timestamps", True),
        )
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
    finally:
        safe_unlink(file_path)

