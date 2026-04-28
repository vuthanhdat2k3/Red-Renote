import io
import threading
from typing import Any

import numpy as np

from app.config import settings
from app.utils.logger import get_logger
from app.utils.metrics import model_loaded

logger = get_logger(__name__)


class WhisperModelManager:
    _instance: "WhisperModelManager | None" = None
    _instance_lock = threading.Lock()

    def __new__(cls) -> "WhisperModelManager":
        with cls._instance_lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._model = None
                cls._instance._model_lock = threading.RLock()
                cls._instance.model_size = None
                cls._instance.device = None
                cls._instance.compute_type = None
        return cls._instance

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def _resolve_device(self, requested_device: str) -> str:
        if requested_device != "cuda":
            return requested_device
        return "cuda"

    def load_model(
        self,
        model_size: str | None = None,
        device: str | None = None,
        compute_type: str | None = None,
    ) -> None:
        model_size = model_size or settings.WHISPER_MODEL_SIZE
        requested_device = device or settings.DEVICE
        resolved_device = self._resolve_device(requested_device)
        compute_type = compute_type or settings.COMPUTE_TYPE or ("float16" if resolved_device == "cuda" else "int8")

        with self._model_lock:
            if (
                self._model is not None
                and self.model_size == model_size
                and self.device == resolved_device
                and self.compute_type == compute_type
            ):
                return

            from faster_whisper import WhisperModel

            last_error: Exception | None = None
            attempts = [(resolved_device, compute_type)]
            if resolved_device == "cuda":
                attempts.append(("cpu", "int8"))

            for attempt_device, attempt_compute_type in attempts:
                try:
                    logger.info(
                        "Loading faster-whisper model",
                        extra={"model_size": model_size, "device": attempt_device},
                    )
                    self._model = WhisperModel(
                        model_size,
                        device=attempt_device,
                        compute_type=attempt_compute_type,
                        download_root=str(settings.MODEL_DOWNLOAD_ROOT),
                    )
                    self.model_size = model_size
                    self.device = attempt_device
                    self.compute_type = attempt_compute_type
                    self._warmup()
                    model_loaded.set(1)
                    return
                except Exception as exc:
                    last_error = exc
                    logger.exception("Failed to load faster-whisper model")

            model_loaded.set(0)
            raise RuntimeError("Unable to load faster-whisper model") from last_error

    def _warmup(self) -> None:
        if self._model is None:
            return
        try:
            dummy_audio = np.zeros(16000, dtype=np.float32)
            segments, _ = self._model.transcribe(dummy_audio, language="vi", beam_size=1)
            list(segments)
        except Exception:
            logger.exception("Whisper warmup failed")

    def transcribe(
        self,
        audio_path: str,
        language: str = "vi",
        task: str = "transcribe",
        vad_filter: bool = True,
        **kwargs: Any,
    ) -> tuple[list[dict[str, Any]], dict[str, Any]]:
        self.load_model()
        assert self._model is not None

        with self._model_lock:
            segments_iter, info = self._model.transcribe(
                audio_path,
                language=language,
                task=task,
                vad_filter=vad_filter,
                beam_size=kwargs.pop("beam_size", 5),
                best_of=kwargs.pop("best_of", 5),
                temperature=kwargs.pop("temperature", [0.0, 0.2, 0.4, 0.6]),
                condition_on_previous_text=kwargs.pop("condition_on_previous_text", True),
                **kwargs,
            )
            segments = [
                {
                    "start": float(segment.start),
                    "end": float(segment.end),
                    "text": segment.text.strip(),
                    "avg_logprob": getattr(segment, "avg_logprob", None),
                    "no_speech_prob": getattr(segment, "no_speech_prob", None),
                }
                for segment in segments_iter
            ]
        metadata = {
            "duration": float(getattr(info, "duration", 0.0) or 0.0),
            "language": getattr(info, "language", language) or language,
            "language_probability": float(getattr(info, "language_probability", 0.0) or 0.0),
            "model_size": self.model_size or settings.WHISPER_MODEL_SIZE,
            "device": self.device,
            "compute_type": self.compute_type,
        }
        return segments, metadata

    def transcribe_stream(self, audio_chunk: bytes, context: dict[str, Any]) -> dict[str, Any]:
        self.load_model()
        sample_rate = int(context.get("sample_rate", 16000))
        language = str(context.get("language", "vi"))
        audio = np.frombuffer(audio_chunk, dtype=np.int16).astype(np.float32) / 32768.0
        if sample_rate != 16000 and audio.size:
            try:
                import librosa

                audio = librosa.resample(audio, orig_sr=sample_rate, target_sr=16000)
            except Exception:
                logger.exception("Streaming resample failed")

        with self._model_lock:
            assert self._model is not None
            segments_iter, _ = self._model.transcribe(
                audio,
                language=language,
                vad_filter=True,
                beam_size=1,
                condition_on_previous_text=True,
                initial_prompt=context.get("prompt"),
            )
            segments = [
                {"start": float(segment.start), "end": float(segment.end), "text": segment.text.strip()}
                for segment in segments_iter
            ]
        text = " ".join(segment["text"] for segment in segments).strip()
        if text:
            context["prompt"] = (str(context.get("prompt", "")) + " " + text).strip()[-500:]
        return {"text": text, "segments": segments}


model_manager = WhisperModelManager()
