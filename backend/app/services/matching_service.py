from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, time
import math
from typing import Any, Mapping, Sequence


SKILL_LEVELS = {
    "beginner": 1,
    "novice": 1,
    "intermediate": 2,
    "advanced": 3,
    "expert": 4,
    "professional": 5,
}

INTENSITY_LEVELS = {
    "casual": 1,
    "recreational": 1,
    "social": 1,
    "balanced": 2,
    "moderate": 2,
    "competitive": 3,
    "serious": 3,
    "intense": 3,
}

DAY_NAMES = {
    "mon": "monday",
    "monday": "monday",
    "tue": "tuesday",
    "tues": "tuesday",
    "tuesday": "tuesday",
    "wed": "wednesday",
    "weds": "wednesday",
    "wednesday": "wednesday",
    "thu": "thursday",
    "thur": "thursday",
    "thurs": "thursday",
    "thursday": "thursday",
    "fri": "friday",
    "friday": "friday",
    "sat": "saturday",
    "saturday": "saturday",
    "sun": "sunday",
    "sunday": "sunday",
}


@dataclass(frozen=True)
class MatchingWeights:
    activity: float = 0.30
    skill: float = 0.20
    availability: float = 0.20
    location: float = 0.15
    intensity_social: float = 0.15

    @classmethod
    def from_mapping(cls, values: Mapping[str, float] | None) -> "MatchingWeights":
        defaults = {
            "activity": cls.activity,
            "skill": cls.skill,
            "availability": cls.availability,
            "location": cls.location,
            "intensity_social": cls.intensity_social,
        }
        if values is not None:
            defaults.update(
                {key: value for key, value in values.items() if value is not None}
            )
        return cls(**defaults)

    def as_map(self) -> dict[str, float]:
        return {
            "activity": self.activity,
            "skill": self.skill,
            "availability": self.availability,
            "location": self.location,
            "intensity_social": self.intensity_social,
        }


@dataclass
class CompatibilityResult:
    overall_score: float
    component_scores: dict[str, float]
    reasons: list[str]
    shared_activities: list[str]
    weights: MatchingWeights


DEFAULT_MATCH_WEIGHTS = MatchingWeights()


def calculate_profile_match(
    profile_a: Any,
    profile_b: Any,
    weights: Mapping[str, float] | MatchingWeights | None = None,
) -> CompatibilityResult:
    weight_config = (
        weights
        if isinstance(weights, MatchingWeights)
        else MatchingWeights.from_mapping(weights)
    )
    profile_a_data = _to_mapping(profile_a)
    profile_b_data = _to_mapping(profile_b)

    shared_activities = sorted(_shared_activity_names(profile_a_data, profile_b_data))
    activity_score, activity_reason = _score_activity_compatibility(
        profile_a_data, profile_b_data, shared_activities
    )
    skill_score, skill_reason = _score_skill_compatibility(
        profile_a_data, profile_b_data, shared_activities
    )
    availability_score, availability_reason = _score_availability_overlap(
        profile_a_data, profile_b_data
    )
    distance_score, location_reason = _score_location_proximity(
        profile_a_data, profile_b_data
    )
    intensity_score, intensity_reason = _score_intensity_and_social(
        profile_a_data, profile_b_data, shared_activities
    )

    component_scores = {
        "activity": activity_score,
        "skill": skill_score,
        "availability": availability_score,
        "location": distance_score,
        "intensity_social": intensity_score,
    }

    total_weight = sum(weight_config.as_map().values())
    if total_weight <= 0:
        total_weight = 1.0

    weighted_total = 0.0
    for key, value in component_scores.items():
        weight = getattr(weight_config, key.replace("_social", ""), 0.0)
        if key == "intensity_social":
            weight = weight_config.intensity_social
        weighted_total += value * weight

    overall_score = max(0.0, min(100.0, (weighted_total / total_weight)))

    reasons = [
        activity_reason,
        skill_reason,
        availability_reason,
        location_reason,
        intensity_reason,
    ]
    reasons = [reason for reason in reasons if reason]

    return CompatibilityResult(
        overall_score=round(overall_score, 2),
        component_scores={
            key: round(value, 2) for key, value in component_scores.items()
        },
        reasons=reasons,
        shared_activities=shared_activities,
        weights=weight_config,
    )


def _to_mapping(profile: Any) -> dict[str, Any]:
    if isinstance(profile, Mapping):
        return dict(profile)
    if hasattr(profile, "model_dump"):
        dump = profile.model_dump()
        if isinstance(dump, Mapping):
            return dict(dump)
    if hasattr(profile, "__dict__"):
        return dict(profile.__dict__)
    return {}


def _as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, (list, tuple, set)):
        return list(value)
    return [value]


def _normalize_name(value: Any) -> str:
    return str(value or "").strip().lower()


def _shared_activity_names(
    profile_a: Mapping[str, Any], profile_b: Mapping[str, Any]
) -> set[str]:
    activities_a = _collect_activity_names(profile_a)
    activities_b = _collect_activity_names(profile_b)
    return activities_a.intersection(activities_b)


def _collect_activity_names(profile: Mapping[str, Any]) -> set[str]:
    names: set[str] = set()
    for entry in _as_list(profile.get("activities")):
        name = _extract_activity_name(entry)
        if name:
            names.add(name)
    return names


def _extract_activity_name(activity: Any) -> str:
    if isinstance(activity, str):
        return _normalize_name(activity)
    if isinstance(activity, Mapping):
        if "name" in activity and activity["name"]:
            return _normalize_name(activity["name"])
        if "activity" in activity and activity["activity"]:
            return _normalize_name(activity["activity"])
    return ""


def _extract_activity_meta(
    profile: Mapping[str, Any], activity_name: str
) -> dict[str, Any]:
    for entry in _as_list(profile.get("activities")):
        if isinstance(entry, Mapping):
            candidate = _normalize_name(entry.get("name") or entry.get("activity"))
            if candidate == activity_name:
                return entry
        elif isinstance(entry, str) and _normalize_name(entry) == activity_name:
            return {"name": entry}
    return {}


def _score_activity_compatibility(
    profile_a: Mapping[str, Any],
    profile_b: Mapping[str, Any],
    shared_activities: Sequence[str],
) -> tuple[float, str]:
    if not shared_activities:
        return 0.0, "No shared activities, so there is no activity overlap to score."

    union_count = len(
        _collect_activity_names(profile_a).union(_collect_activity_names(profile_b))
    )
    if union_count == 0:
        return 0.0, "No activities were provided for either user."

    activity_score = (len(shared_activities) / union_count) * 100.0
    activity_label = ", ".join(shared_activities)
    return (
        round(activity_score, 2),
        f"Shared activities: {activity_label}; activity overlap is {round(activity_score, 1)}%.",
    )


def _score_skill_compatibility(
    profile_a: Mapping[str, Any],
    profile_b: Mapping[str, Any],
    shared_activities: Sequence[str],
) -> tuple[float, str]:
    if not shared_activities:
        return (
            0.0,
            "Skill compatibility could not be assessed because there are no shared activities.",
        )

    scores: list[float] = []
    descriptions: list[str] = []
    for activity_name in shared_activities:
        meta_a = _extract_activity_meta(profile_a, activity_name)
        meta_b = _extract_activity_meta(profile_b, activity_name)
        level_a = _coerce_skill(
            meta_a.get("skill_level") or meta_a.get("skill") or meta_a.get("level")
        )
        level_b = _coerce_skill(
            meta_b.get("skill_level") or meta_b.get("skill") or meta_b.get("level")
        )

        if level_a is None or level_b is None:
            scores.append(50.0)
            descriptions.append(
                f"{activity_name} skill level information is incomplete."
            )
            continue

        difference = abs(level_a - level_b)
        closeness = max(0.0, 1.0 - (difference / 4.0))
        scores.append(closeness * 100.0)
        descriptions.append(f"{activity_name}: {level_a} vs {level_b} skill level.")

    average_score = sum(scores) / len(scores) if scores else 0.0
    return round(average_score, 2), "Skill compatibility: " + "; ".join(
        descriptions
    ) + f" (average {round(average_score, 1)}%)."


def _score_availability_overlap(
    profile_a: Mapping[str, Any], profile_b: Mapping[str, Any]
) -> tuple[float, str]:
    slots_a = _extract_availability_slots(profile_a)
    slots_b = _extract_availability_slots(profile_b)
    if not slots_a or not slots_b:
        return (
            100.0,
            "Availability details are missing, so this component is treated as neutral.",
        )

    overlap_minutes = 0
    for day, start_a, end_a in slots_a:
        for day_b, start_b, end_b in slots_b:
            if day != day_b:
                continue
            overlap = max(0, min(end_a, end_b) - max(start_a, start_b))
            overlap_minutes += overlap

    total_minutes_a = sum(end - start for _, start, end in slots_a)
    total_minutes_b = sum(end - start for _, start, end in slots_b)
    window = max(total_minutes_a, total_minutes_b, 1)
    score = min(100.0, (overlap_minutes / window) * 100.0) if window else 0.0

    if score <= 0:
        return 0.0, "There is no overlapping availability window between the two users."
    return round(
        score, 2
    ), f"Availability overlap yields {round(score, 1)}% compatibility."


def _score_location_proximity(
    profile_a: Mapping[str, Any], profile_b: Mapping[str, Any]
) -> tuple[float, str]:
    lat_a = _coerce_float(
        _get_nested(profile_a, "location.latitude") or profile_a.get("latitude")
    )
    lon_a = _coerce_float(
        _get_nested(profile_a, "location.longitude") or profile_a.get("longitude")
    )
    lat_b = _coerce_float(
        _get_nested(profile_b, "location.latitude") or profile_b.get("latitude")
    )
    lon_b = _coerce_float(
        _get_nested(profile_b, "location.longitude") or profile_b.get("longitude")
    )

    if lat_a is None or lat_b is None or lon_a is None or lon_b is None:
        return (
            100.0,
            "Location data is missing, so the proximity component is treated as neutral.",
        )

    distance_km = _haversine_km(lat_a, lon_a, lat_b, lon_b)
    if distance_km <= 2:
        score = 100.0
    elif distance_km <= 5:
        score = 85.0
    elif distance_km <= 10:
        score = 70.0
    elif distance_km <= 20:
        score = 50.0
    elif distance_km <= 50:
        score = 25.0
    else:
        score = 0.0

    if score <= 0:
        return (
            0.0,
            f"Users are about {round(distance_km, 1)} km apart, which is outside the preferred area.",
        )
    return (
        round(score, 2),
        f"Users are about {round(distance_km, 1)} km apart, giving a location score of {round(score, 1)}%.",
    )


def _score_intensity_and_social(
    profile_a: Mapping[str, Any],
    profile_b: Mapping[str, Any],
    shared_activities: Sequence[str],
) -> tuple[float, str]:
    intensity_a = _normalize_name(
        _first_non_empty(
            profile_a.get("intensity"), profile_a.get("preferred_intensity")
        )
    )
    intensity_b = _normalize_name(
        _first_non_empty(
            profile_b.get("intensity"), profile_b.get("preferred_intensity")
        )
    )

    social_a = _normalize_preferences(profile_a.get("social_preferences"))
    social_b = _normalize_preferences(profile_b.get("social_preferences"))

    if (
        not shared_activities
        and not intensity_a
        and not intensity_b
        and not social_a
        and not social_b
    ):
        return (
            100.0,
            "No intensity or social preference data was provided, so this component is neutral.",
        )

    intensity_score = _compare_scalar_preferences(
        intensity_a, intensity_b, INTENSITY_LEVELS
    )
    social_score = _compare_social_preferences(social_a, social_b)

    if not shared_activities:
        score = (intensity_score + social_score) / 2.0
        if score <= 0:
            return 0.0, "Intensity and social preferences are strongly mismatched."
        return round(score, 2), f"Intensity/social compatibility is {round(score, 1)}%."

    activity_scores: list[float] = []
    for activity in shared_activities:
        meta_a = _extract_activity_meta(profile_a, activity)
        meta_b = _extract_activity_meta(profile_b, activity)
        a_pref = _normalize_name(
            meta_a.get("intensity") or meta_a.get("preferred_intensity")
        )
        b_pref = _normalize_name(
            meta_b.get("intensity") or meta_b.get("preferred_intensity")
        )
        activity_score = _compare_scalar_preferences(a_pref, b_pref, INTENSITY_LEVELS)
        activity_social_a = _normalize_preferences(
            meta_a.get("social_preferences") or meta_a.get("social")
        )
        activity_social_b = _normalize_preferences(
            meta_b.get("social_preferences") or meta_b.get("social")
        )
        social_match = _compare_social_preferences(activity_social_a, activity_social_b)
        activity_scores.append((activity_score + social_match) / 2.0)

    combined_score = (intensity_score + social_score + sum(activity_scores)) / (
        2 + len(activity_scores)
    )
    if combined_score <= 0:
        return (
            0.0,
            "The shared activities and preference profile are strongly misaligned.",
        )
    return round(
        combined_score, 2
    ), f"Intensity and social preferences score {round(combined_score, 1)}%."


def _get_nested(profile: Mapping[str, Any], dotted_path: str) -> Any:
    current: Any = profile
    for part in dotted_path.split("."):
        if not isinstance(current, Mapping):
            return None
        current = current.get(part)
    return current


def _first_non_empty(*values: Any) -> Any:
    for value in values:
        if value not in (None, ""):
            return value
    return None


def _coerce_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _coerce_skill(value: Any) -> int | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in SKILL_LEVELS:
            return SKILL_LEVELS[normalized]
    return None


def _normalize_preferences(value: Any) -> set[str]:
    if value is None:
        return set()
    if isinstance(value, str):
        return {part.strip().lower() for part in value.split(",") if part.strip()}
    if isinstance(value, (list, tuple, set)):
        normalized = set()
        for item in value:
            normalized.update(_normalize_preferences(item))
        return normalized
    return {str(value).strip().lower()}


def _compare_scalar_preferences(
    a_value: str, b_value: str, lookup: Mapping[str, int]
) -> float:
    if not a_value and not b_value:
        return 100.0
    if not a_value or not b_value:
        return 50.0

    a_score = lookup.get(a_value, 2)
    b_score = lookup.get(b_value, 2)
    gap = abs(a_score - b_score)
    similarity = max(0.0, 1.0 - (gap / max(len(lookup), 1)))
    return similarity * 100.0


def _compare_social_preferences(
    a_preferences: set[str], b_preferences: set[str]
) -> float:
    if not a_preferences and not b_preferences:
        return 100.0
    if not a_preferences or not b_preferences:
        return 50.0
    overlap = len(a_preferences.intersection(b_preferences))
    total = max(len(a_preferences.union(b_preferences)), 1)
    return (overlap / total) * 100.0


def _extract_availability_slots(
    profile: Mapping[str, Any],
) -> list[tuple[str, int, int]]:
    slots: list[tuple[str, int, int]] = []
    for entry in _as_list(profile.get("availability")):
        if isinstance(entry, Mapping):
            day = DAY_NAMES.get(
                _normalize_name(
                    entry.get("day_of_week") or entry.get("day") or entry.get("weekday")
                ),
                "",
            )
            start = _parse_time(entry.get("start_time") or entry.get("start"))
            end = _parse_time(entry.get("end_time") or entry.get("end"))
            if day and start is not None and end is not None:
                slots.append((day, start, end))
        elif isinstance(entry, (list, tuple)) and len(entry) >= 3:
            day = DAY_NAMES.get(_normalize_name(entry[0]), "")
            start = _parse_time(entry[1])
            end = _parse_time(entry[2])
            if day and start is not None and end is not None:
                slots.append((day, start, end))
    return slots


def _parse_time(value: Any) -> int | None:
    if value is None:
        return None
    if isinstance(value, time):
        return value.hour * 60 + value.minute
    if isinstance(value, str):
        raw = value.strip()
        if raw.lower() in {"", "none"}:
            return None
        try:
            parsed = datetime.strptime(raw, "%H:%M").time()
            return parsed.hour * 60 + parsed.minute
        except ValueError:
            return None
    return None


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_km = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_km * c
