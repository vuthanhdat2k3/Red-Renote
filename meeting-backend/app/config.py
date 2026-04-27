from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Red Renote Meeting Backend"
    API_VERSION: str = "0.1.0"
    DEBUG: bool = False

    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/2"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/3"

    STT_SERVICE_URL: str = "http://localhost:8000"
    STT_API_KEY: Optional[str] = None

    INTERNAL_API_KEY: Optional[str] = None
    CORS_ORIGINS: list[str] = ["*"]

    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_FAST_MODEL: str = "gemini-2.5-flash-lite"
    GEMINI_API_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta"
    LLM_TIMEOUT_SECONDS: float = 120.0
    LLM_MAX_INPUT_CHARS: int = 120_000
    LLM_RATE_LIMIT_PER_MINUTE: int = 12
    LLM_MAX_RETRIES: int = 3
    LLM_RETRY_BASE_SECONDS: float = 1.0
    LLM_RETRY_MAX_SECONDS: float = 12.0
    LLM_CACHE_TTL_SECONDS: int = 86_400


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
