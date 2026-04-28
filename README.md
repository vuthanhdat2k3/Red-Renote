# Red Renote

Red Renote is an iOS-first AI meeting assistant built with Expo. It records meetings, turns transcripts into structured summaries, extracts follow-up tasks, and keeps meeting memory searchable across a mobile app, Supabase database, and local FastAPI services.

## Overview

The project combines a React Native app with two backend services:

- **Mobile app**: Expo Router shell for onboarding, authentication, recording, meeting summaries, transcripts, tasks, mind maps, and AI chat.
- **Meeting API**: FastAPI service that creates meeting records, persists data to Supabase, and runs LLM analysis with Celery.
- **STT API**: FastAPI service for Vietnamese speech-to-text using `faster-whisper`, with file, async, and WebSocket transcription endpoints.

The app can run with mock/local data for UI development, connect directly to Supabase for persisted meeting data, or call the Meeting API for transcript/audio processing.

## Features

- Mobile-first Expo app with tab navigation and meeting detail routes.
- Supabase authentication and persisted meeting data.
- Local mock data fallback when Supabase is not configured.
- Meeting creation from transcript or audio through the Meeting API.
- AI summaries, decisions, risks, follow-ups, tasks, mind maps, and chat messages.
- Vietnamese/English i18n resources.
- STT service with upload, async job, and streaming WebSocket interfaces.
- Hybrid Docker Compose setup for STT, meeting orchestration, Celery workers, and Redis.

## Tech Stack

| Area | Technology |
| --- | --- |
| App | Expo SDK 54, React Native 0.81, React 19, TypeScript |
| Routing | Expo Router |
| UI | NativeWind, React Native SVG, Lucide React Native |
| State/data | Zustand, AsyncStorage, Supabase JS |
| Forms | React Hook Form |
| Backend | FastAPI, Celery, Redis |
| Speech-to-text | `faster-whisper` |
| Database | Supabase Postgres |
| LLM | Gemini, with deterministic fallback summaries |

## Project Structure

```text
app/                    Expo Router screens and route groups
src/components/         App UI, meeting surfaces, shell, auth, launch, and primitives
src/constants/          Design tokens and route metadata
src/data/               Mock meeting data for local development
src/hooks/              Data-loading hooks
src/i18n/               English and Vietnamese translations
src/lib/                Supabase, meeting API, permissions, and repository helpers
src/store/              Zustand stores
src/types/              Meeting domain types
supabase/migrations/    Database schema and seed data
meeting-backend/        FastAPI service for meetings, persistence, LLM, and chat
stt-backend/            FastAPI service for speech-to-text
docker-compose.hybrid.yml
```

## Getting Started

Install app dependencies:

```bash
npm install
```

Create local app environment:

```bash
cp .env.example .env.local
```

Start Expo:

```bash
npm run start
```

> [!IMPORTANT]
> Expo SDK 54 should be run with a supported Node.js LTS version. If Expo Go or `--tunnel` fails with a low-level ngrok/CLI error, check `node -v` before debugging the iPhone.

## Configuration

Root app variables live in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL used by the mobile app |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key used by the mobile app |
| `EXPO_PUBLIC_MEETING_API_URL` | Meeting API base URL, usually `http://localhost:8001` |
| `EXPO_PUBLIC_MEETING_API_KEY` | Optional bearer token for protected Meeting API calls |

Backend-specific variables are documented in `meeting-backend/.env.example` and `stt-backend/.env.example`.

> [!NOTE]
> Keep real `.env.local`, `meeting-backend/.env`, and `stt-backend/.env` values private. Use the example files as the source of truth for required keys.

## Supabase

Create a Supabase project, then fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

Apply the schema and seed data from:

```text
supabase/migrations/202604250001_initial_schema.sql
```

The migration creates `meetings`, `tasks`, `transcript_items`, and `ai_messages` tables with sample Red Renote meeting data.

## Development

| Command | Description |
| --- | --- |
| `npm run start` | Start Expo Metro |
| `npm run ios` | Start Expo for iOS |
| `npm run android` | Start Expo for Android |
| `npm run web` | Start Expo web |
| `npm run lint` | Run Expo lint |
| `npm run typecheck` | Run TypeScript checking |

Run the Meeting API locally:

```bash
cd meeting-backend
uv venv --python 3.12 .venv
uv pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8001
```

Run the Meeting API worker in another shell:

```bash
cd meeting-backend
celery -A app.workers.celery_worker worker --loglevel=info
```

Run the STT API locally:

```bash
cd stt-backend
python3.10 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

For a combined local service stack:

```bash
docker compose -f docker-compose.hybrid.yml up --build
```

## API Notes

The Meeting API exposes meeting creation and chat workflows, including:

- `POST /meetings/from-transcript`
- `POST /meetings/from-audio`
- `GET /meetings/{meeting_id}/detail`
- `POST /meetings/{meeting_id}/chat`

The STT API exposes transcription workflows, including:

- `POST /transcribe/file`
- `POST /transcribe/async`
- `GET /transcribe/status/{job_id}`
- WebSocket `/transcribe/stream`

See `meeting-backend/README.md` and `stt-backend/README.md` for request examples and service-level details.

## Troubleshooting

### Expo Go times out on iPhone

Make sure the phone and development machine are on the same Wi-Fi, VPN/proxy is disabled, and the network does not block local device discovery. If LAN mode is unreliable, try tunnel mode after confirming the local Node.js version is compatible with Expo SDK 54.

### Meeting data does not load

If Supabase variables are missing, the app falls back to local mock data. If Supabase is configured but data is empty, confirm the migration has been applied and the app is authenticated where required.

### Audio processing does not create a meeting

Confirm `EXPO_PUBLIC_MEETING_API_URL` points to the Meeting API, the Meeting API can reach `STT_SERVICE_URL`, and Redis/Celery are running if async LLM processing is enabled.
