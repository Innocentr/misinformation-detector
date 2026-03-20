from app.core.config import settings
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel, create_engine

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


def init_db():
    SQLModel.metadata.create_all(engine)
