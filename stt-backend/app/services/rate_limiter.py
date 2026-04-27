import asyncio

from app.config import settings


class RateLimiter:
    def __init__(self, max_concurrent: int = settings.MAX_CONCURRENT_TRANSCRIPTIONS):
        self.semaphore = asyncio.Semaphore(max_concurrent)

    async def __aenter__(self) -> "RateLimiter":
        await self.semaphore.acquire()
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        self.semaphore.release()


transcription_limiter = RateLimiter()

