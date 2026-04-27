import base64
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.config import settings
from app.models.whisper_model import model_manager
from app.utils.metrics import active_websocket_connections

router = APIRouter(tags=["streaming"])


@router.websocket("/transcribe/stream")
async def transcribe_stream(websocket: WebSocket):
    await websocket.accept()
    active_websocket_connections.inc()
    context: dict[str, Any] = {"language": "vi", "sample_rate": 16000}
    buffer = bytearray()
    min_window_bytes = int(context["sample_rate"] * 2 * settings.CHUNK_SIZE_MS / 1000)

    try:
        while True:
            message = await websocket.receive_json()
            message_type = message.get("type")
            if message_type == "config":
                context.update({key: message[key] for key in ("language", "sample_rate") if key in message})
                min_window_bytes = int(int(context["sample_rate"]) * 2 * settings.CHUNK_SIZE_MS / 1000)
                await websocket.send_json({"type": "ready", "sample_rate": context["sample_rate"]})
            elif message_type == "audio":
                buffer.extend(base64.b64decode(message.get("data", "")))
                if len(buffer) >= min_window_bytes:
                    chunk = bytes(buffer)
                    overlap_bytes = int(int(context["sample_rate"]) * 2 * settings.OVERLAP_MS / 1000)
                    buffer[:] = buffer[-overlap_bytes:] if overlap_bytes else b""
                    result = model_manager.transcribe_stream(chunk, context)
                    if result["text"]:
                        await websocket.send_json(
                            {"type": "partial", "text": result["text"], "start": 0.0, "is_final": False}
                        )
            elif message_type == "end":
                if buffer:
                    result = model_manager.transcribe_stream(bytes(buffer), context)
                    await websocket.send_json(
                        {"type": "final", "text": result["text"], "start": 0.0, "end": 0.0, "is_final": True}
                    )
                await websocket.close()
                return
            else:
                await websocket.send_json({"type": "error", "error": "Unknown message type"})
    except WebSocketDisconnect:
        return
    finally:
        active_websocket_connections.dec()

