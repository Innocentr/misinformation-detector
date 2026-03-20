from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy.pool import StaticPool

sqlite_url = "sqlite:///./test.db"

engine = create_engine(
    sqlite_url, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool 
)

def init_db():
    """
    Called on startup to create tables if they don't exist.
    """
    SQLModel.metadata.create_all(engine)