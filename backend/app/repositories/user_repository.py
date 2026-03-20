from app.core import security
from app.models import User
from app.schemas import UserCreate
from sqlmodel import Session, select


def get_user_by_username(db: Session, username: str) -> User | None:
    statement = select(User).where(User.username == username)
    return db.exec(statement).first()


def create_user(db: Session, user_in: UserCreate) -> User:
    db_obj = User(
        username=user_in.username,
        hashed_password=security.get_password_hash(user_in.password),
        is_superuser=False,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
