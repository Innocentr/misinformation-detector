from datetime import datetime

from sqlmodel import Field, SQLModel

from app.models.prediction import PredictionBase


class PredictRequest(SQLModel):
    text: str = Field(min_length=1)


class PredictionPublic(PredictionBase):
    id: int
    created_at: datetime
    user_id: int
