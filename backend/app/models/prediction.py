from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import relationship
from sqlmodel import Field, Relationship, SQLModel


class PredictionBase(SQLModel):
    text: str = Field(min_length=1)
    prediction: str = Field(max_length=16)
    confidence: float = Field(ge=0.0, le=1.0)


class Prediction(PredictionBase, table=True):
    __tablename__ = "prediction"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user_id: int = Field(foreign_key="user.id", index=True)

    owner: Optional["User"] = Relationship(
        sa_relationship=relationship("User", back_populates="predictions")
    )


from app.models.user import User  # noqa: E402
