from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel
from sqlalchemy.orm import relationship
from sqlmodel import Field, Relationship, SQLModel


class UserBase(SQLModel):
    username: str = Field(unique=True, index=True, min_length=3)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)


class User(UserBase, table=True):
    __tablename__ = "user"

    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str

    predictions: List["Prediction"] = Relationship(
        sa_relationship=relationship("Prediction", back_populates="owner")
    )


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserPublic(UserBase):
    id: int


class PredictionBase(SQLModel):
    text: str = Field(min_length=1)
    prediction: str = Field(max_length=16)
    confidence: float = Field(ge=0.0, le=1.0)


class Prediction(PredictionBase, table=True):
    __tablename__ = "prediction"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    user_id: int = Field(foreign_key="user.id", index=True)

    owner: Optional[User] = Relationship(
        sa_relationship=relationship("User", back_populates="predictions")
    )


class PredictRequest(SQLModel):
    text: str = Field(min_length=1)


class PredictionPublic(PredictionBase):
    id: int
    created_at: datetime
    user_id: int


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None
