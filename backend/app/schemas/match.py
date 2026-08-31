from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserRead


class MatchRead(BaseModel):
    id: int
    matched_user_id: int
    activity_id: int | None
    score: float = Field(ge=0, le=100)
    explanation: str | None = None
    matched_user: UserRead | None = None
    model_config = ConfigDict(from_attributes=True)
