import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.db import init_db
from app.ml.loader import load_ml_models

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Syncing database schema")
    init_db()

    app.state.ml_models = {}
    try:
        logger.info("Loading ML models")
        app.state.ml_models = load_ml_models()
        logger.info("ML models ready")
    except Exception:
        logger.exception("Failed to load ML models")

    yield
    app.state.ml_models.clear()


app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
