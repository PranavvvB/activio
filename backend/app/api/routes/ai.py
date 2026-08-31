from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.models.user import User
from app.schemas.ai import ProfileParseRequest, ProfileParseResponse
from app.services.ai_service import AIProviderError, parse_profile_description

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/parse-profile", response_model=ProfileParseResponse)
def parse_profile(
    request: ProfileParseRequest,
    _: User = Depends(get_current_user),
) -> ProfileParseResponse:
    try:
        return parse_profile_description(request.description)
    except AIProviderError as exc:
        raise HTTPException(status_code=502, detail="Unable to parse profile description") from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
