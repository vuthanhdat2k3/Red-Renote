from fastapi import Header, HTTPException, status

from app.config import settings


async def verify_internal_api_key(authorization: str | None = Header(default=None)) -> None:
    if not settings.INTERNAL_API_KEY:
        return
    if authorization != f"Bearer {settings.INTERNAL_API_KEY}":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")

