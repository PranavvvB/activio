from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.deps import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import authenticate_user, register_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user_route(user_in: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    user = register_user(db, user_in)
    return UserRead.model_validate(user)


@router.post("/login", response_model=TokenResponse)
def login_user_route(user_in: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = authenticate_user(db, user_in.email, user_in.password)
    token = create_access_token(user.email)
    return TokenResponse(access_token=token, token_type="bearer")
