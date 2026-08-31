from sqlalchemy.orm import Session

from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.profile import UserProfileUpdate


def get_or_create_profile(db: Session, user: User) -> UserProfile:
    if user.profile is None:
        user.profile = UserProfile()
        db.add(user.profile)
        db.flush()
    return user.profile


def update_profile(db: Session, user: User, profile_in: UserProfileUpdate) -> UserProfile:
    profile = get_or_create_profile(db, user)
    for field, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
