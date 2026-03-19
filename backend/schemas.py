from pydantic import BaseModel
from datetime import datetime

class PredictRequest(BaseModel):
    text: str

class PredictionResponse(BaseModel):
    id: int
    text: str
    prediction: str
    confidence: float
    created_at: datetime

    class Config:
        from_attributes = True

class UserAuth(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str