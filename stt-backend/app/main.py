from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app

from app.api.transcribe import router as transcribe_router
from app.api.websocket import router as websocket_router
from app.config import settings
from app.models.whisper_model import model_manager

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    description="Realtime speech-to-text backend for Vietnamese meeting audio.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcribe_router)
app.include_router(websocket_router)
app.mount("/metrics", make_asgi_app())


@app.on_event("startup")
async def startup() -> None:
    if not settings.DEBUG:
        model_manager.load_model()


@app.get("/")
async def root():
    return {"service": settings.APP_NAME, "version": settings.API_VERSION, "docs": "/docs", "health": "/health"}


@app.get("/health")
async def health_check():
    gpu_available = False
    cuda_device_count = 0
    try:
        import ctranslate2

        cuda_device_count = ctranslate2.get_cuda_device_count()
        gpu_available = cuda_device_count > 0
    except Exception:
        pass
    return {
        "status": "healthy",
        "model_loaded": model_manager.is_loaded,
        "model_size": settings.WHISPER_MODEL_SIZE,
        "model_device": model_manager.device,
        "compute_type": model_manager.compute_type,
        "gpu_available": gpu_available,
        "cuda_device_count": cuda_device_count,
    }
