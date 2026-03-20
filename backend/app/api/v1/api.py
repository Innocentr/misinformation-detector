from fastapi import APIRouter
from app.api.v1.endpoints import auth, predict, history

api_router = APIRouter()

# from app.api.v1.endpoints import predict
api_router.include_router(auth.router, prefix="/auth", tags=["Security"])
api_router.include_router( predict.router,prefix="/predict",tags=["Prediction"])

api_router.include_router(history.router, prefix="/history", tags=["History"])





#  makes URLs look like: /api/v1/auth/login
# api_router.include_router(auth.router, prefix="/auth", tags=["Security"])



# Future: api_router.include_router(career.router, prefix="/career", tags=["Vantage Career"])