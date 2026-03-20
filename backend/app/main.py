import pickle
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.db import engine, init_db
from app.models import User, Prediction


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Database. Creates tables like user and prediction
    print("Vantage AI: Syncing Database Schema...")
    init_db()

    # load ML Models into app state
    print("Vantage AI: Loading ML Models...")
    app.state.ml_models = {}
    try:
       
        app.state.ml_models["model"] = pickle.load(open("app/ml/lr_model.pkl", "rb"))
        app.state.ml_models["vectorizer"] = pickle.load(open("app/ml/vectorizer.pkl", "rb"))
        print("Vantage AI: ML Models ready.")
    except Exception as e:
        print(f"Vantage AI: Model Load Error -> {e}")
    
    yield
    # Clean up on shutdown
    app.state.ml_models.clear()

# --- App Initialization ---
app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---
app.include_router(api_router, prefix=settings.API_V1_STR)