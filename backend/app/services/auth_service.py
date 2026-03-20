from sqlmodel import Session

from app.core import security
from app.models import User
from app.repositories.user_repository import create_user, get_user_by_username
from app.schemas import UserCreate


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not security.verify_password(password, user.hashed_password):
        return None
    return user


def register_user(db: Session, user_in: UserCreate) -> User:
    return create_user(db, user_in)
