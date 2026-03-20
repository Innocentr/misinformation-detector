from __future__ import annotations

from typing import Optional

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

    predictions: list["Prediction"] = Relationship(
        sa_relationship=relationship("Prediction", back_populates="owner")
    )


from app.models.prediction import Prediction  # noqa: E402
