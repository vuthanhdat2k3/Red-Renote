import subprocess
import tempfile
from pathlib import Path
from typing import Any

from pydub import AudioSegment, effects

from app.config import settings


class AudioProcessor:
    ALLOWED_SUFFIXES = {".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg", ".webm", ".mp4"}

    @staticmethod
    def validate_audio(file_path: str) -> dict[str, Any]:
        path = Path(file_path)
        if not path.exists():
            return {"valid": False, "info": {}, "error": "File does not exist"}
        if path.suffix.lower() not in AudioProcessor.ALLOWED_SUFFIXES:
            return {"valid": False, "info": {}, "error": f"Unsupported audio format: {path.suffix}"}

        size_mb = path.stat().st_size / (1024 * 1024)
        if size_mb > settings.MAX_FILE_SIZE_MB:
            return {"valid": False, "info": {"size_mb": size_mb}, "error": "File exceeds max size"}

        try:
            audio = AudioSegment.from_file(path)
        except Exception as exc:
            return {"valid": False, "info": {"size_mb": size_mb}, "error": f"Invalid audio file: {exc}"}

        duration_seconds = len(audio) / 1000
        info = {
            "size_mb": size_mb,
            "duration": duration_seconds,
            "sample_rate": audio.frame_rate,
            "channels": audio.channels,
            "format": path.suffix.lower().lstrip("."),
        }
        if duration_seconds > settings.MAX_DURATION_SECONDS:
            return {"valid": False, "info": info, "error": "Audio duration exceeds max duration"}
        return {"valid": True, "info": info, "error": ""}

    @staticmethod
    def convert_to_wav(input_file: str, output_file: str) -> str:
        command = [
            "ffmpeg",
            "-y",
            "-i",
            input_file,
            "-ac",
            "1",
            "-ar",
            "16000",
            "-vn",
            "-f",
            "wav",
            output_file,
        ]
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return output_file

    @staticmethod
    def preprocess_audio(audio_path: str, reduce_noise: bool = False, normalize: bool = True) -> str:
        suffix = Path(audio_path).suffix.lower()
        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False, dir=settings.TEMP_DIR)
        tmp.close()

        if suffix == ".wav":
            audio = AudioSegment.from_file(audio_path)
            audio = audio.set_channels(1).set_frame_rate(16000)
            if normalize:
                audio = effects.normalize(audio)
            if reduce_noise:
                audio = audio.low_pass_filter(7800).high_pass_filter(80)
            audio.export(tmp.name, format="wav")
            return tmp.name

        AudioProcessor.convert_to_wav(audio_path, tmp.name)
        if normalize or reduce_noise:
            audio = AudioSegment.from_wav(tmp.name)
            if normalize:
                audio = effects.normalize(audio)
            if reduce_noise:
                audio = audio.low_pass_filter(7800).high_pass_filter(80)
            audio.export(tmp.name, format="wav")
        return tmp.name

    @staticmethod
    def chunk_audio_for_streaming(
        audio_data: bytes,
        chunk_size_ms: int = 5000,
        overlap_ms: int = 500,
        sample_rate: int = 16000,
        sample_width: int = 2,
    ) -> list[bytes]:
        bytes_per_ms = int(sample_rate * sample_width / 1000)
        chunk_bytes = max(1, chunk_size_ms * bytes_per_ms)
        overlap_bytes = max(0, overlap_ms * bytes_per_ms)
        step = max(1, chunk_bytes - overlap_bytes)
        return [audio_data[start : start + chunk_bytes] for start in range(0, len(audio_data), step)]

