from app.api import deps
from app.core import security
from app.repositories.user_repository import get_user_by_username
from app.schemas import Token, UserCreate, UserPublic
from app.services.auth_service import authenticate_user
from app.services.auth_service import register_user as register_user_service
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()


@router.post("/login", response_model=Token)
def login(
    db: deps.SessionDep,
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password",
        )

    access_token = security.create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=UserPublic)
def register_user(
    *,
    db: deps.SessionDep,
    user_in: UserCreate,
):
    existing_user = get_user_by_username(db, user_in.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this username already exists in the system.",
        )

    return register_user_service(db, user_in)
