from __future__ import annotations

from typing import Any

from app.core import security
from app.models import Prediction, User, UserCreate
from sqlmodel import Session, select


def get_user_by_username(db: Session, username: str) -> User | None:
    statement = select(User).where(User.username == username)
    return db.exec(statement).first()


def create_user(db: Session, user_in: UserCreate) -> User:
    db_obj = User(
        username=user_in.username,
        hashed_password=security.get_password_hash(user_in.password),
        is_superuser=False,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not security.verify_password(password, user.hashed_password):
        return None
    return user


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


def predict_text(ml_models: dict[str, Any], text: str) -> tuple[str, float]:
    vectorizer = ml_models["vectorizer"]
    model = ml_models["model"]

    vec = vectorizer.transform([text])
    prediction_idx = model.predict(vec)[0]
    probabilities = model.predict_proba(vec)[0]
    probability = float(max(probabilities))
    result = "REAL" if prediction_idx == 1 else "FAKE"

    return result, probability
