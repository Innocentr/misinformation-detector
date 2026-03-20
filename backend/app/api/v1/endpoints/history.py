from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

# Internal imports following the template structure
from app.api import deps
from app.models import Prediction, PredictionPublic, User

router = APIRouter()

@router.get("/", response_model=List[PredictionPublic])
async def get_my_prediction_history(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Vantage Trust: Retrieve all past predictions for the authenticated user.
    """
    # SQLModel uses a 'select' statement approach
    statement = select(Prediction).where(Prediction.user_id == current_user.id)
    results = db.exec(statement).all()
    
    return results