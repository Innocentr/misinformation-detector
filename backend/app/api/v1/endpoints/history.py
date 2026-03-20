from typing import List

from app.api import deps
from app.crud import get_user_prediction_history
from app.models import PredictionPublic, User
from fastapi import APIRouter, Depends

router = APIRouter()


@router.get("/", response_model=List[PredictionPublic])
def get_my_prediction_history(
    *,
    db: deps.SessionDep,
    current_user: User = Depends(deps.get_current_user),
):
    return get_user_prediction_history(db, user_id=current_user.id)
