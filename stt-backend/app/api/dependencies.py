from fastapi import Header, HTTPException, status

from app.config import settings


async def verify_api_key(authorization: str | None = Header(default=None)) -> None:
    if not settings.API_KEY:
        return
    expected = f"Bearer {settings.API_KEY}"
    if authorization != expected:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")

