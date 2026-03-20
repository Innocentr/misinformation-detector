from typing import Literal

from pydantic import BaseModel


class FeaturePublic(BaseModel):
    slug: str
    name: str
    status: Literal["available", "planned"]
    category: str
    description: str
