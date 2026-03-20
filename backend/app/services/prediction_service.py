from __future__ import annotations

from sqlmodel import Session

from app.features.misinformation import run_misinformation_prediction
from app.models import Prediction
from app.repositories.prediction_repository import create_prediction


def run_prediction(ml_models: dict[str, object], text: str) -> tuple[str, float]:
    return run_misinformation_prediction(ml_models, text)


def create_user_prediction(
    db: Session,
    *,
    text: str,
    prediction: str,
    confidence: float,
    user_id: int,
) -> Prediction:
    return create_prediction(
        db,
        text=text,
        prediction=prediction,
        confidence=confidence,
        user_id=user_id,
    )
