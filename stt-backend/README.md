# Red Renote STT Backend

FastAPI backend for realtime Vietnamese speech-to-text using `faster-whisper`.

## Features

- File upload endpoint: `POST /transcribe/file`
- Background endpoint: `POST /transcribe/async` plus `GET /transcribe/status/{job_id}`
- WebSocket streaming: `/transcribe/stream`
- Default model size: `tiny`
- CUDA with CPU fallback
- Optional Redis result cache
- Celery worker for async jobs
- Prometheus metrics at `/metrics`
- Docker Compose with API, worker, Redis and PostgreSQL

## Local Run

```bash
cd stt-backend
python3.10 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Set `DEBUG=true` in `.env` if you want to avoid loading the Whisper model at process startup.

## Docker

```bash
cd stt-backend
cp .env.example .env
docker compose up --build
```

If the machine has no NVIDIA runtime, change `DEVICE=cpu` and `COMPUTE_TYPE=int8` in `.env`, then remove or ignore the GPU reservation in Compose.

## API Examples

```bash
curl -F "file=@sample.wav" "http://localhost:8000/transcribe/file?language=vi"
```

With API key enabled:

```bash
curl -H "Authorization: Bearer $API_KEY" -F "file=@sample.wav" http://localhost:8000/transcribe/file
```

## WebSocket Protocol

Client messages:

```json
{"type":"config","language":"vi","sample_rate":16000}
```

```json
{"type":"audio","data":"<base64 pcm16 mono chunk>"}
```

```json
{"type":"end"}
```

Server messages include `ready`, `partial`, `final` and `error`.

## Notes

- File uploads are normalized to 16 kHz mono WAV through `ffmpeg`/`pydub`.
- Streaming currently expects raw PCM16 mono chunks, not compressed audio containers.
- PostgreSQL model is included for persistence, but endpoint storage is intentionally not forced so local development works without a database.

