from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vantage AI Suite"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-here"  
    ALGORITHM: str = "HS256"
    
  
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # SQLite Database URL
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./test.db"

    # Allow React frontend
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "localhost:3000"]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

# This is the instantiated object that main.py and security.py import
settings = Settings()