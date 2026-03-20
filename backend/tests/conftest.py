import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("SECRET_KEY", "test-secret-key-12345")


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


@pytest.fixture
def session() -> Session:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as db_session:
        yield db_session


@pytest.fixture
def client(session: Session, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    from app.api import deps
    from app.main import app

    def override_get_db():
        yield session

    monkeypatch.setattr("app.main.init_db", lambda: None)
    monkeypatch.setattr(
        "app.main.load_ml_models",
        lambda: {"model": FakeModel(), "vectorizer": FakeVectorizer()},
    )

    app.dependency_overrides[deps.get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
