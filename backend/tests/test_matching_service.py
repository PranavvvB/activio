import pytest

from app.services.matching_service import calculate_profile_match


def make_profile(
    *,
    activities=None,
    availability=None,
    latitude=51.5074,
    longitude=-0.1278,
    intensity="competitive",
    social_preferences=("friendly", "competitive"),
):
    if activities is None:
        activities = [{
            "name": "tennis",
            "skill_level": "intermediate",
            "intensity": "competitive",
            "social_preferences": ["friendly", "competitive"],
        }]
    if availability is None:
        availability = [{"day_of_week": "monday", "start_time": "18:00", "end_time": "20:00"}]

    return {
        "activities": activities,
        "availability": availability,
        "location": {"latitude": latitude, "longitude": longitude},
        "intensity": intensity,
        "social_preferences": list(social_preferences),
    }


def test_perfect_match() -> None:
    profile_a = make_profile()
    profile_b = make_profile()

    result = calculate_profile_match(profile_a, profile_b)

    assert result.shared_activities == ["tennis"]
    assert result.overall_score == pytest.approx(100.0, abs=0.01)
    assert result.component_scores["activity"] == pytest.approx(100.0, abs=0.01)
    assert result.component_scores["skill"] == pytest.approx(100.0, abs=0.01)
    assert result.component_scores["availability"] == pytest.approx(100.0, abs=0.01)
    assert result.component_scores["location"] == pytest.approx(100.0, abs=0.01)
    assert result.component_scores["intensity_social"] == pytest.approx(100.0, abs=0.01)
    assert any("Shared activities" in reason for reason in result.reasons)


def test_completely_incompatible_users() -> None:
    profile_a = make_profile(
        activities=[{"name": "tennis", "skill_level": "beginner", "intensity": "casual"}],
        availability=[{"day_of_week": "monday", "start_time": "18:00", "end_time": "20:00"}],
        latitude=51.5074,
        longitude=-0.1278,
        intensity="casual",
        social_preferences=("friendly",),
    )
    profile_b = make_profile(
        activities=[{"name": "golf", "skill_level": "expert", "intensity": "serious"}],
        availability=[{"day_of_week": "tuesday", "start_time": "18:00", "end_time": "20:00"}],
        latitude=40.7128,
        longitude=-74.0060,
        intensity="competitive",
        social_preferences=("competitive",),
    )

    result = calculate_profile_match(profile_a, profile_b)

    assert result.shared_activities == []
    assert result.overall_score < 10.0
    assert result.component_scores["activity"] == pytest.approx(0.0, abs=0.01)
    assert result.component_scores["availability"] == pytest.approx(0.0, abs=0.01)
    assert result.component_scores["location"] == pytest.approx(0.0, abs=0.01)
    assert "No shared activities" in result.reasons[0]


def test_different_skill_levels() -> None:
    profile_a = make_profile(activities=[{"name": "tennis", "skill_level": "advanced", "intensity": "competitive"}])
    profile_b = make_profile(activities=[{"name": "tennis", "skill_level": "beginner", "intensity": "competitive"}])

    result = calculate_profile_match(profile_a, profile_b)

    assert result.shared_activities == ["tennis"]
    assert result.component_scores["skill"] < 100.0
    assert result.component_scores["skill"] < 80.0
    assert result.overall_score < 100.0


def test_no_availability_overlap() -> None:
    profile_a = make_profile(
        activities=[{"name": "tennis", "skill_level": "intermediate", "intensity": "competitive"}],
        availability=[{"day_of_week": "monday", "start_time": "18:00", "end_time": "20:00"}],
    )
    profile_b = make_profile(
        activities=[{"name": "tennis", "skill_level": "intermediate", "intensity": "competitive"}],
        availability=[{"day_of_week": "wednesday", "start_time": "18:00", "end_time": "20:00"}],
    )

    result = calculate_profile_match(profile_a, profile_b)

    assert result.component_scores["availability"] == pytest.approx(0.0, abs=0.01)
    assert result.overall_score < 100.0


def test_different_locations() -> None:
    profile_a = make_profile(latitude=51.5074, longitude=-0.1278)
    profile_b = make_profile(latitude=34.0522, longitude=-118.2437)

    result = calculate_profile_match(profile_a, profile_b)

    assert result.component_scores["location"] < 25.0
    assert result.overall_score < 90.0


def test_multiple_shared_activities() -> None:
    profile_a = make_profile(
        activities=[
            {"name": "tennis", "skill_level": "intermediate", "intensity": "competitive"},
            {"name": "running", "skill_level": "advanced", "intensity": "balanced"},
        ]
    )
    profile_b = make_profile(
        activities=[
            {"name": "tennis", "skill_level": "intermediate", "intensity": "competitive"},
            {"name": "running", "skill_level": "advanced", "intensity": "balanced"},
            {"name": "swimming", "skill_level": "beginner", "intensity": "casual"},
        ]
    )

    result = calculate_profile_match(profile_a, profile_b)

    assert result.shared_activities == ["running", "tennis"]
    assert result.component_scores["activity"] > 50.0
    assert result.overall_score > 75.0


def test_missing_optional_preferences() -> None:
    profile_a = {
        "activities": [{"name": "tennis", "skill_level": "intermediate"}],
        "availability": [{"day_of_week": "monday", "start_time": "18:00", "end_time": "20:00"}],
        "location": {"latitude": 51.5074, "longitude": -0.1278},
    }
    profile_b = {
        "activities": [{"name": "tennis", "skill_level": "intermediate"}],
        "availability": [{"day_of_week": "monday", "start_time": "18:00", "end_time": "20:00"}],
        "location": {"latitude": 51.5074, "longitude": -0.1278},
    }

    result = calculate_profile_match(profile_a, profile_b)

    assert result.overall_score > 0.0
    assert result.component_scores["intensity_social"] >= 50.0
    assert len(result.reasons) >= 4
