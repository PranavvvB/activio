from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.deps import get_db
from app.models.match import Match
from app.models.user import User
from app.schemas.match import MatchRead
from app.services.matching_service import calculate_profile_match

router = APIRouter(prefix="/api/matches", tags=["matches"])


def _profile_data(user: User) -> dict:
    profile = user.profile
    return {
        "activities": [
            {"name": item.activity.name, "skill_level": item.skill_level}
            for item in user.activities
        ],
        "availability": [
            {
                "day": item.day_of_week,
                "start_time": item.start_time,
                "end_time": item.end_time,
            }
            for item in user.availability
        ],
        "latitude": profile.latitude if profile else None,
        "longitude": profile.longitude if profile else None,
        "social_preferences": profile.social_preferences if profile else None,
    }


@router.get("", response_model=list[MatchRead])
def list_matches(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[Match]:
    matches = db.query(Match).filter(Match.user_id == current_user.id).all()
    if not matches:
        for candidate in (
            db.query(User)
            .filter(User.id != current_user.id, User.is_active.is_(True))
            .all()
        ):
            result = calculate_profile_match(
                _profile_data(current_user), _profile_data(candidate)
            )
            if result.overall_score > 0:
                activity = next(
                    (
                        a.activity
                        for a in current_user.activities
                        if a.activity.name.lower() in result.shared_activities
                    ),
                    None,
                )
                matches.append(
                    Match(
                        user_id=current_user.id,
                        matched_user_id=candidate.id,
                        activity_id=activity.id if activity else None,
                        score=result.overall_score,
                        explanation=" ".join(result.reasons),
                    )
                )
        db.add_all(matches)
        db.commit()
    return sorted(matches, key=lambda item: item.score, reverse=True)


@router.get("/{match_id}", response_model=MatchRead)
def get_match(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Match:
    match = (
        db.query(Match)
        .filter(Match.id == match_id, Match.user_id == current_user.id)
        .first()
    )
    if match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return match
