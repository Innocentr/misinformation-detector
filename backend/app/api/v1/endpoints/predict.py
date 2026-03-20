from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select
from typing import List

# Local imports following the template structure
from app.api import deps
from app.models import Prediction, PredictionPublic, PredictRequest, User

router = APIRouter()

@router.post("/", response_model=PredictionPublic)
async def predict_content(
    *,
    db: Session = Depends(deps.get_db),
    request: Request,
    payload: PredictRequest,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Vantage Trust: Analyze text for misinformation.
    """
    #Access models from the global app state
    ml_models = getattr(request.app.state, "ml_models", {})
    
    if "model" not in ml_models or "vectorizer" not in ml_models:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Models are not initialized on the server."
        )

    # ML Inference 
    try:
        vec = ml_models["vectorizer"].transform([payload.text])
        prediction_idx = ml_models["model"].predict(vec)[0]
        prob = ml_models["model"].predict_proba(vec)[0].max()
        result = "REAL" if prediction_idx == 1 else "FAKE"
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failed: {str(e)}"
        )

    # Database Entry using SQLModel
    db_obj = Prediction(
        text=payload.text,
        prediction=result,
        confidence=float(prob),
        user_id=current_user.id
    )
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    return db_obj

