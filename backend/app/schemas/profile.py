from pydantic import BaseModel, ConfigDict, Field
from datetime import time
from typing import Literal


class UserProfileUpdate(BaseModel):
    display_name: str | None = Field(default=None, max_length=120)
    bio: str | None = Field(default=None, max_length=1000)
    location_name: str | None = Field(default=None, max_length=255)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    preferred_distance_km: int | None = Field(default=None, ge=0)
    age_preference_min: int | None = Field(default=None, ge=0)
    age_preference_max: int | None = Field(default=None, ge=0)
    preferred_group_size: int | None = Field(default=None, ge=1)
    social_preferences: str | None = Field(default=None, max_length=255)


class UserProfileRead(UserProfileUpdate):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class ActivityRead(BaseModel):
    id: int
    name: str
    description: str | None = None
    model_config = ConfigDict(from_attributes=True)


class UserActivityCreate(BaseModel):
    activity_id: int
    skill_level: str = Field(min_length=1, max_length=50)


class UserActivityRead(UserActivityCreate):
    id: int
    user_id: int
    activity: ActivityRead
    model_config = ConfigDict(from_attributes=True)


class AvailabilityEntry(BaseModel):
    day_of_week: Literal[
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
    ]
    start_time: time
    end_time: time
    notes: str | None = Field(default=None, max_length=255)


class AvailabilityRead(AvailabilityEntry):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)
