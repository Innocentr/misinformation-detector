import logging

from app.api import deps
from app.models import User
from app.schemas import PredictionPublic, PredictRequest
from app.services.prediction_service import create_user_prediction, run_prediction
from fastapi import APIRouter, Depends, HTTPException, Request, status

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=PredictionPublic)
def predict_content(
    *,
    db: deps.SessionDep,
    request: Request,
    payload: PredictRequest,
    current_user: User = Depends(deps.get_current_user),
):
    ml_models = getattr(request.app.state, "ml_models", {})

    if "model" not in ml_models or "vectorizer" not in ml_models:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML models are not initialized on the server.",
        )

    try:
        result, probability = run_prediction(ml_models, payload.text)
    except Exception:
        logger.exception("Prediction inference failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Inference failed. Please try again later.",
        ) from None

    return create_user_prediction(
        db,
        text=payload.text,
        prediction=result,
        confidence=probability,
        user_id=current_user.id,
    )

