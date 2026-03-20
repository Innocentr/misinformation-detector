from app.models.user import UserBase
from sqlmodel import Field


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserPublic(UserBase):
    id: int
