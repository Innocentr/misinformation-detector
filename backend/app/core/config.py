from pathlib import Path
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT_DIR / "backend"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Vantage AI Suite"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"

    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./test.db"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=(ROOT_DIR / ".env", BACKEND_DIR / ".env"),
        extra="ignore",
    )

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, value: str) -> str:
        if value == "change-me":
            raise ValueError("SECRET_KEY must be set in the environment.")
        if len(value) < 16:
            raise ValueError("SECRET_KEY must be at least 16 characters long.")
        return value


settings = Settings()
