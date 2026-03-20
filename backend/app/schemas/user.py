from sqlmodel import Field

from app.models.user import UserBase


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserPublic(UserBase):
    id: int
