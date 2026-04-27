from typing import Any, BinaryIO

import httpx

from app.config import settings


class STTClient:
    async def transcribe_upload(self, file_obj: BinaryIO, filename: str, content_type: str | None) -> dict[str, Any]:
        headers = {}
        if settings.STT_API_KEY:
            headers["Authorization"] = f"Bearer {settings.STT_API_KEY}"
        files = {"file": (filename, file_obj, content_type or "application/octet-stream")}
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(f"{settings.STT_SERVICE_URL}/transcribe/file", headers=headers, files=files)
            response.raise_for_status()
            return response.json()


stt_client = STTClient()

