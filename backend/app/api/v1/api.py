from app.api.v1.endpoints import auth, features, history, predict
from fastapi import APIRouter

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Security"])
api_router.include_router(features.router, prefix="/features", tags=["Features"])
api_router.include_router(predict.router, prefix="/predict", tags=["Prediction"])
api_router.include_router(history.router, prefix="/history", tags=["History"])
