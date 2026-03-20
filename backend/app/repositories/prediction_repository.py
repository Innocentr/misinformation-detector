from sqlmodel import Session, select

from app.models import Prediction


def create_prediction(
    db: Session,
    *,
    text: str,
    prediction: str,
    confidence: float,
    user_id: int,
) -> Prediction:
    db_obj = Prediction(
        text=text,
        prediction=prediction,
        confidence=confidence,
        user_id=user_id,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_user_prediction_history(
    db: Session,
    *,
    user_id: int,
    limit: int = 50,
) -> list[Prediction]:
    statement = (
        select(Prediction)
        .where(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.desc())
        .limit(limit)
    )
    return list(db.exec(statement).all())
