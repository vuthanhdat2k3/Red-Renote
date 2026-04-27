import time
from pathlib import Path
from typing import Any

from app.config import settings
from app.models.whisper_model import model_manager
from app.services.audio_processor import AudioProcessor
from app.services.cache import transcription_cache
from app.services.postprocessing import TextPostProcessor
from app.utils.helpers import safe_unlink


class TranscriptionService:
    def __init__(self) -> None:
        self.postprocessor = TextPostProcessor()

    def transcribe_file(
        self,
        file_path: str,
        language: str = "vi",
        enable_vad: bool = True,
        enable_noise_reduction: bool = False,
        return_timestamps: bool = True,
    ) -> dict[str, Any]:
        started = time.perf_counter()
        validation = AudioProcessor.validate_audio(file_path)
        if not validation["valid"]:
            raise ValueError(validation["error"])

        cache_key = transcription_cache.get_cache_key(file_path)
        cached = transcription_cache.get(cache_key)
        if cached:
            cached["metadata"]["cached"] = True
            return cached

        processed_path: str | None = None
        try:
            processed_path = AudioProcessor.preprocess_audio(file_path, reduce_noise=enable_noise_reduction)
            segments, metadata = model_manager.transcribe(processed_path, language=language, vad_filter=enable_vad)
            full_text = " ".join(segment["text"] for segment in segments).strip()
            processed = self.postprocessor.process(full_text, segments)
            result = {
                "status": "success",
                "transcript": processed["text"],
                "segments": processed["segments"] if return_timestamps else [],
                "metadata": {
                    "duration": metadata.get("duration") or validation["info"].get("duration", 0.0),
                    "language": metadata.get("language", language),
                    "processing_time": round(time.perf_counter() - started, 3),
                    "model_size": metadata.get("model_size", settings.WHISPER_MODEL_SIZE),
                    "cached": False,
                    "filename": Path(file_path).name,
                },
            }
            transcription_cache.set(cache_key, result)
            return result
        finally:
            safe_unlink(processed_path)


transcription_service = TranscriptionService()

