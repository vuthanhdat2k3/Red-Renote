from prometheus_client import Counter, Gauge, Histogram

transcription_requests = Counter("transcription_requests_total", "Total transcription requests")
transcription_failures = Counter("transcription_failures_total", "Total failed transcription requests")
transcription_duration = Histogram("transcription_duration_seconds", "Transcription request duration")
active_websocket_connections = Gauge("websocket_connections", "Active STT websocket connections")
model_loaded = Gauge("whisper_model_loaded", "Whether the Whisper model is loaded")

