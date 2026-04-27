from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Red Renote STT Backend"
    DEBUG: bool = False
    API_VERSION: str = "1.0.0"

    WHISPER_MODEL_SIZE: str = "tiny"
    DEVICE: str = "cuda"
    COMPUTE_TYPE: str = "int8"
    MODEL_DOWNLOAD_ROOT: Path = Path("models")

    MAX_FILE_SIZE_MB: int = 100
    MAX_DURATION_SECONDS: int = 7200
    CHUNK_SIZE_MS: int = 5000
    OVERLAP_MS: int = 500
    MAX_CONCURRENT_TRANSCRIPTIONS: int = 4

    UPLOAD_DIR: Path = Path("uploads")
    TEMP_DIR: Path = Path("/tmp/red-renote-stt")

    DATABASE_URL: Optional[str] = None
    REDIS_URL: Optional[str] = None
    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/1"

    API_KEY: Optional[str] = None
    CORS_ORIGINS: list[str] = Field(default_factory=lambda: ["*"])
    ANTHROPIC_API_KEY: Optional[str] = None


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    settings.TEMP_DIR.mkdir(parents=True, exist_ok=True)
    settings.MODEL_DOWNLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    return settings


settings = get_settings()

