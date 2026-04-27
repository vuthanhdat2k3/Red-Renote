from celery import Celery

from app.config import settings
from app.services.llm import llm_service
from app.services.repository import meeting_repository

celery_app = Celery("meeting_worker", broker=settings.CELERY_BROKER_URL, backend=settings.CELERY_RESULT_BACKEND)


@celery_app.task(bind=True, max_retries=3)
def process_meeting_llm(self, meeting_id: str, language: str = "en"):
    try:
        meeting = meeting_repository.get(meeting_id)
        transcript = meeting_repository.get_transcript_text(meeting_id)
        result = llm_service.analyze_meeting(transcript, meeting["title"], language=language)
        return meeting_repository.update_llm_result(meeting_id, result)
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)

