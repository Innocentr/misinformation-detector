from app import crud
from app.models import Prediction, UserCreate
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine


def build_session() -> Session:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return Session(engine)


class FakeVectorizer:
    def transform(self, values: list[str]) -> list[str]:
        return values


class FakeModel:
    def predict(self, values: list[str]) -> list[int]:
        return [1 if "trusted" in values[0].lower() else 0]

    def predict_proba(self, values: list[str]) -> list[list[float]]:
        if "trusted" in values[0].lower():
            return [[0.03, 0.97]]
        return [[0.91, 0.09]]


def test_create_and_authenticate_user():
    with build_session() as session:
        user = crud.create_user(
            session,
            UserCreate(username="analyst", password="verysecurepass"),
        )

        assert user.id is not None
        assert user.hashed_password != "verysecurepass"
        assert crud.authenticate_user(session, "analyst", "verysecurepass") is not None
        assert crud.authenticate_user(session, "analyst", "wrongpass") is None


def test_prediction_history_returns_newest_first():
    with build_session() as session:
        user = crud.create_user(
            session,
            UserCreate(username="historyuser", password="verysecurepass"),
        )

        older = crud.create_prediction(
            session,
            text="older",
            prediction="FAKE",
            confidence=0.51,
            user_id=user.id,
        )
        newer = crud.create_prediction(
            session,
            text="newer",
            prediction="REAL",
            confidence=0.99,
            user_id=user.id,
        )

        history = crud.get_user_prediction_history(session, user_id=user.id)

        assert history[0].id == newer.id
        assert history[1].id == older.id


def test_predict_text_maps_model_output():
    result, confidence = crud.predict_text(
        {"model": FakeModel(), "vectorizer": FakeVectorizer()},
        "Trusted newsroom bulletin",
    )

    assert result == "REAL"
    assert confidence == 0.97


def test_prediction_limit_is_applied():
    with build_session() as session:
        user = crud.create_user(
            session,
            UserCreate(username="limituser", password="verysecurepass"),
        )

        for index in range(3):
            crud.create_prediction(
                session,
                text=f"entry-{index}",
                prediction="FAKE",
                confidence=0.5,
                user_id=user.id,
            )

        history = crud.get_user_prediction_history(session, user_id=user.id, limit=2)

        assert len(history) == 2
        assert all(isinstance(item, Prediction) for item in history)
