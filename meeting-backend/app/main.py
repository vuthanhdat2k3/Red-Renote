from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.meetings import router as meetings_router
from app.config import settings

app = FastAPI(title=settings.APP_NAME, version=settings.API_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings_router)


@app.get("/")
async def root():
    return {"service": settings.APP_NAME, "version": settings.API_VERSION, "docs": "/docs", "health": "/health"}


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "llm_provider": settings.LLM_PROVIDER,
        "llm_configured": bool(settings.GEMINI_API_KEY),
    }
