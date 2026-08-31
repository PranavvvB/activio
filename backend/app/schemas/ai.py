from pydantic import BaseModel, Field


class ParsedAvailability(BaseModel):
    days: list[str] = Field(default_factory=list)
    start_time: str | None = None
    end_time: str | None = None


class ParsedActivity(BaseModel):
    name: str
    skill_level: str | None = None
    intensity: str | None = None


class ProfileParseRequest(BaseModel):
    description: str = Field(min_length=1, max_length=5000)


class ProfileParseResponse(BaseModel):
    activities: list[ParsedActivity] = Field(default_factory=list)
    availability: ParsedAvailability | None = None
    intensity: str | None = None
    max_distance_km: float | None = Field(default=None, ge=0)
    social_preferences: list[str] = Field(default_factory=list)
