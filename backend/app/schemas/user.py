from pydantic import BaseModel, ConfigDict, EmailStr

from app.schemas.profile import UserProfileRead


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserRead(BaseModel):
    id: int
    email: EmailStr
    username: str
    is_active: bool
    profile: UserProfileRead | None = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    username: str | None = None
