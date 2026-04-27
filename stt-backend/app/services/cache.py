import json
from typing import Any, Optional

from app.config import settings
from app.utils.helpers import file_sha256


class TranscriptionCache:
    def __init__(self) -> None:
        self._client = None
        if settings.REDIS_URL:
            try:
                from redis import Redis

                self._client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
            except Exception:
                self._client = None

    def get_cache_key(self, audio_path: str) -> str:
        return f"stt:{file_sha256(audio_path)}"

    def get(self, cache_key: str) -> Optional[dict[str, Any]]:
        if self._client is None:
            return None
        value = self._client.get(cache_key)
        return json.loads(value) if value else None

    def set(self, cache_key: str, result: dict[str, Any], ttl: int = 86400) -> None:
        if self._client is None:
            return
        self._client.setex(cache_key, ttl, json.dumps(result, ensure_ascii=False))


transcription_cache = TranscriptionCache()

