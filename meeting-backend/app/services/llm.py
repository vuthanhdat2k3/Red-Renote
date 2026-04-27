import hashlib
import json
import random
import re
import time
from typing import Any

import httpx
import redis

from app.config import settings


DEFAULT_MINDMAP = {"id": "node-root", "label": "Meeting", "type": "root", "children": []}


class LLMService:
    def __init__(self) -> None:
        self._api_key = settings.GEMINI_API_KEY
        self._redis: redis.Redis | None = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key)

    def _safe_load_json(self, text: str) -> dict[str, Any]:
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", text, flags=re.DOTALL)
            if not match:
                raise
            return json.loads(match.group(0))

    def _cache_key(self, kind: str, payload: str, model: str) -> str:
        digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
        return f"llm:{settings.LLM_PROVIDER}:{model}:{kind}:{digest}"

    def _get_cached_json(self, key: str) -> dict[str, Any] | None:
        if self._redis is None:
            return None
        try:
            value = self._redis.get(key)
            return json.loads(value) if value else None
        except redis.RedisError:
            self._redis = None
            return None

    def _set_cached_json(self, key: str, value: dict[str, Any]) -> None:
        if self._redis is None:
            return
        try:
            self._redis.setex(key, settings.LLM_CACHE_TTL_SECONDS, json.dumps(value, ensure_ascii=False))
        except redis.RedisError:
            self._redis = None

    def _get_cached_text(self, key: str) -> str | None:
        if self._redis is None:
            return None
        try:
            return self._redis.get(key)
        except redis.RedisError:
            self._redis = None
            return None

    def _set_cached_text(self, key: str, value: str) -> None:
        if self._redis is None:
            return
        try:
            self._redis.setex(key, settings.LLM_CACHE_TTL_SECONDS, value)
        except redis.RedisError:
            self._redis = None

    def _acquire_rate_limit(self, model: str) -> None:
        if settings.LLM_RATE_LIMIT_PER_MINUTE <= 0 or self._redis is None:
            return
        bucket = int(time.time() // 60)
        key = f"rate:{settings.LLM_PROVIDER}:{model}:{bucket}"
        try:
            count = self._redis.incr(key)
            if count == 1:
                self._redis.expire(key, 70)
            if count > settings.LLM_RATE_LIMIT_PER_MINUTE:
                raise RuntimeError("LLM rate limit exceeded. Retry later.")
        except redis.RedisError:
            self._redis = None

    def _fallback_analysis(self, transcript: str, title: str) -> dict[str, Any]:
        clean = re.sub(r"\s+", " ", transcript).strip()
        first_sentence = re.split(r"(?<=[.!?])\s+", clean)[0] if clean else ""
        summary = first_sentence[:500] or "Meeting transcript is available. LLM analysis has not been configured."
        return {
            "summary": summary,
            "key_takeaways": [],
            "decisions": [],
            "risks": [],
            "follow_ups": [],
            "tasks": [],
            "tags": [],
            "mindmap": {"id": "node-root", "label": title, "type": "root", "children": []},
        }

    def analyze_meeting(self, transcript: str, title: str, language: str = "en") -> dict[str, Any]:
        transcript = transcript[: settings.LLM_MAX_INPUT_CHARS]
        if not self.is_configured:
            return self._fallback_analysis(transcript, title)
        cache_key = self._cache_key("analysis", f"{language}:{title}\n{transcript}", settings.GEMINI_MODEL)
        cached = self._get_cached_json(cache_key)
        if cached is not None:
            return cached

        lang_instruction = (
            "Respond entirely in Vietnamese (vi). All text values in the JSON must be in Vietnamese."
            if language == "vi"
            else "Respond entirely in English (en). All text values in the JSON must be in English."
        )

        prompt = f"""
Analyze this meeting transcript for a meeting assistant.
{lang_instruction}
Return strict JSON only with this schema:
{{
  "summary": "short executive summary",
  "key_takeaways": ["..."],
  "decisions": ["..."],
  "risks": ["..."],
  "follow_ups": ["..."],
  "tasks": [
    {{"title": "...", "owner": "", "deadline": "", "source_timestamp": "00:00"}}
  ],
  "tags": ["..."],
  "mindmap": {{"id":"node-root","label":"{title}","type":"root","children":[]}}
}}

Meeting title: {title}
Transcript:
{transcript}
"""
        content = self._generate_text(
            model=settings.GEMINI_MODEL,
            prompt=prompt,
            max_output_tokens=3000,
        )
        result = self._safe_load_json(content)
        fallback = self._fallback_analysis(transcript, title)
        for key, value in fallback.items():
            result.setdefault(key, value)
        self._set_cached_json(cache_key, result)
        return result

    def answer_question(self, question: str, transcript: str, history: list[dict[str, str]]) -> str:
        transcript = transcript[: settings.LLM_MAX_INPUT_CHARS]
        if not self.is_configured:
            return "LLM is not configured. Set GEMINI_API_KEY to enable meeting Q&A."

        history_text = "\n".join(f"{item['role']}: {item['content']}" for item in history[-8:])
        prompt = (
            "You answer questions only from the meeting transcript. "
            "If the answer is not present, say that the transcript does not contain it.\n\n"
            f"Transcript:\n{transcript}\n\n"
            f"Recent chat history:\n{history_text}\n\n"
            f"Question: {question}"
        )
        cache_key = self._cache_key("qa", prompt, settings.GEMINI_FAST_MODEL)
        cached = self._get_cached_text(cache_key)
        if cached is not None:
            return cached
        answer = self._generate_text(model=settings.GEMINI_FAST_MODEL, prompt=prompt, max_output_tokens=1000)
        self._set_cached_text(cache_key, answer)
        return answer

    def _generate_text(self, *, model: str, prompt: str, max_output_tokens: int) -> str:
        if not self._api_key:
            raise RuntimeError("Gemini API key is missing")

        url = f"{settings.GEMINI_API_BASE_URL}/models/{model}:generateContent"
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0,
                "maxOutputTokens": max_output_tokens,
                "responseMimeType": "text/plain",
            },
        }
        response = self._post_with_retry(url=url, model=model, payload=payload)
        data = response.json()
        candidates = data.get("candidates") or []
        if not candidates:
            raise RuntimeError("Gemini returned no candidates")
        parts = candidates[0].get("content", {}).get("parts", [])
        text = "".join(part.get("text", "") for part in parts).strip()
        if not text:
            raise RuntimeError("Gemini returned an empty response")
        return text

    def _post_with_retry(self, *, url: str, model: str, payload: dict[str, Any]) -> httpx.Response:
        last_error: Exception | None = None
        retry_statuses = {408, 429, 500, 502, 503, 504}
        for attempt in range(settings.LLM_MAX_RETRIES + 1):
            try:
                self._acquire_rate_limit(model)
                response = httpx.post(
                    url,
                    params={"key": self._api_key},
                    json=payload,
                    timeout=settings.LLM_TIMEOUT_SECONDS,
                )
                if response.status_code not in retry_statuses:
                    response.raise_for_status()
                    return response

                last_error = httpx.HTTPStatusError(
                    f"Retryable Gemini status {response.status_code}",
                    request=response.request,
                    response=response,
                )
                retry_after = response.headers.get("retry-after")
                delay = float(retry_after) if retry_after and retry_after.isdigit() else None
            except (httpx.TimeoutException, httpx.TransportError, httpx.HTTPStatusError) as exc:
                last_error = exc
                delay = None

            if attempt >= settings.LLM_MAX_RETRIES:
                break

            if delay is None:
                delay = min(
                    settings.LLM_RETRY_MAX_SECONDS,
                    settings.LLM_RETRY_BASE_SECONDS * (2**attempt),
                )
                delay += random.uniform(0, 0.4)
            time.sleep(delay)

        raise RuntimeError("Gemini request failed after retries") from last_error


llm_service = LLMService()
