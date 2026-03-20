from app.features import get_feature_catalog
from app.schemas.feature import FeaturePublic
from fastapi import APIRouter

router = APIRouter()


@router.get("/", response_model=list[FeaturePublic])
def list_features() -> list[FeaturePublic]:
    return get_feature_catalog()
