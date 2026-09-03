from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.deps import get_db
from app.models.user import User
from app.schemas.profile import (
    ActivityRead,
    AvailabilityEntry,
    AvailabilityRead,
    UserActivityCreate,
    UserActivityRead,
    UserProfileRead,
    UserProfileUpdate,
)
from app.schemas.user import UserRead, UserUpdate
from app.models.activity import Activity
from app.models.availability import Availability
from app.models.user_activity import UserActivity
from app.services.profile_service import update_profile

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(current_user)


@router.put("/me", response_model=UserRead)
def update_current_user(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserRead:
    for field, value in user_in.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return UserRead.model_validate(current_user)


@router.get("/me/profile", response_model=UserProfileRead)
def read_current_profile(
    current_user: User = Depends(get_current_user),
) -> UserProfileRead:
    if current_user.profile is None:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
        )
    return UserProfileRead.model_validate(current_user.profile)


@router.put("/me/profile", response_model=UserProfileRead)
def update_current_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileRead:
    profile = update_profile(db, current_user, profile_in)
    return UserProfileRead.model_validate(profile)


@router.get("/activities", response_model=list[ActivityRead])
def list_activities(db: Session = Depends(get_db)) -> list[Activity]:
    return db.query(Activity).order_by(Activity.name).all()


@router.get("/me/activities", response_model=list[UserActivityRead])
def list_my_activities(
    current_user: User = Depends(get_current_user),
) -> list[UserActivity]:
    return current_user.activities


@router.post(
    "/me/activities",
    response_model=UserActivityRead,
    status_code=status.HTTP_201_CREATED,
)
def add_my_activity(
    activity_in: UserActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserActivity:
    activity = db.get(Activity, activity_in.activity_id)
    if activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")
    if any(item.activity_id == activity.id for item in current_user.activities):
        raise HTTPException(status_code=409, detail="Activity already added")
    association = UserActivity(user_id=current_user.id, **activity_in.model_dump())
    db.add(association)
    db.commit()
    db.refresh(association)
    return association


@router.delete("/me/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_my_activity(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    association = (
        db.query(UserActivity)
        .filter_by(user_id=current_user.id, activity_id=activity_id)
        .first()
    )
    if association is None:
        raise HTTPException(status_code=404, detail="Activity association not found")
    db.delete(association)
    db.commit()


@router.put("/me/activities/{activity_id}", response_model=UserActivityRead)
def update_my_activity(
    activity_id: int,
    activity_in: UserActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserActivity:
    if activity_in.activity_id != activity_id:
        raise HTTPException(
            status_code=422, detail="Path activity_id must match payload"
        )
    association = (
        db.query(UserActivity)
        .filter_by(user_id=current_user.id, activity_id=activity_id)
        .first()
    )
    if association is None:
        raise HTTPException(status_code=404, detail="Activity association not found")
    association.skill_level = activity_in.skill_level
    db.commit()
    db.refresh(association)
    return association


@router.get("/me/availability", response_model=list[AvailabilityRead])
def read_my_availability(
    current_user: User = Depends(get_current_user),
) -> list[Availability]:
    return current_user.availability


@router.put("/me/availability", response_model=list[AvailabilityRead])
def update_my_availability(
    entries: list[AvailabilityEntry],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Availability]:
    if any(entry.start_time >= entry.end_time for entry in entries):
        raise HTTPException(
            status_code=422, detail="Availability start_time must be before end_time"
        )
    current_user.availability.clear()
    current_user.availability.extend(
        Availability(user_id=current_user.id, **entry.model_dump()) for entry in entries
    )
    db.commit()
    db.refresh(current_user)
    return current_user.availability
