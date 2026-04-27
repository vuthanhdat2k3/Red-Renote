# Red Renote Meeting Backend

Hybrid MVP backend that orchestrates meetings, STT and LLM analysis without creating a full microservice mesh.

## Responsibilities

- Create a meeting from an existing transcript: `POST /meetings/from-transcript`
- Create a meeting from audio by calling `stt-backend`: `POST /meetings/from-audio`
- Persist data into the existing Supabase tables: `meetings`, `transcript_items`, `tasks`, `ai_messages`
- Enqueue LLM analysis with Celery
- Answer meeting Q&A through `POST /meetings/{meeting_id}/chat`

## Local Setup

```bash
cd meeting-backend
uv venv --python 3.12 .venv
uv pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8001
```

Run the LLM worker in another shell:

```bash
cd meeting-backend
celery -A app.workers.celery_worker worker --loglevel=info
```

## Required Infrastructure

- Supabase Postgres database with the existing Red Renote migrations applied.
- Redis for Celery broker/result backend.
- `stt-backend` running on `STT_SERVICE_URL` if you use `/meetings/from-audio`.
- Gemini API key if you want real summaries and Q&A. Without it, the service writes deterministic fallback summaries.
- Redis for Celery plus LLM rate limiting/cache. If Redis is unavailable, LLM calls still work but cache/rate-limit protection is disabled.

## Important Environment Variables

- `DATABASE_URL`: backend Postgres URL. Use Supabase pooled/direct DB connection, not the public anon key.
- `STT_SERVICE_URL`: URL for the STT service, typically `http://localhost:8000`.
- `INTERNAL_API_KEY`: shared bearer token for protecting this backend.
- `GEMINI_API_KEY`: enables LLM analysis and Q&A.
- `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND`: Redis URLs for async processing.
- `LLM_RATE_LIMIT_PER_MINUTE`: per-model Gemini request cap enforced through Redis.
- `LLM_MAX_RETRIES`, `LLM_RETRY_BASE_SECONDS`, `LLM_RETRY_MAX_SECONDS`: exponential retry settings for 429/5xx/network failures.
- `LLM_CACHE_TTL_SECONDS`: caches repeated summary/Q&A results to avoid duplicate token spend.

## API Examples

Create from transcript:

```bash
curl -X POST http://localhost:8001/meetings/from-transcript \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Daily Standup",
    "owner_user_id": "00000000-0000-0000-0000-000000000000",
    "project": "Red Renote",
    "participants": 3,
    "transcript": "Hôm nay nhóm thống nhất hoàn thiện API và kiểm thử app.",
    "segments": [{"start": 0, "end": 6, "text": "Hôm nay nhóm thống nhất hoàn thiện API và kiểm thử app."}]
  }'
```

Create from audio:

```bash
curl -F "file=@meeting.wav" \
  -F "title=Customer Call" \
  -F "owner_user_id=00000000-0000-0000-0000-000000000000" \
  http://localhost:8001/meetings/from-audio
```
