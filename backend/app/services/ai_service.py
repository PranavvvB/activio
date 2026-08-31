import json

import httpx

from app.config import get_settings
from app.schemas.ai import ProfileParseResponse


class AIProviderError(RuntimeError):
    """The configured provider returned an unusable response."""


def _extract_gemini_text(payload: dict) -> str:
    try:
        return payload["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as exc:
        raise AIProviderError("Gemini returned an unexpected response") from exc


def parse_profile_description(description: str) -> ProfileParseResponse:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("AI profile parsing is not configured")

    prompt = (
        "Extract the user's sports preferences as JSON matching this schema. "
        "Return JSON only, with no markdown: "
        '{"activities":[{"name":"string","skill_level":"string|null",'
        '"intensity":"string|null"}],"availability":{"days":["string"],'
        '"start_time":"HH:MM|null","end_time":"HH:MM|null"},'
        '"intensity":"string|null","max_distance_km":number|null,'
        '"social_preferences":["string"]}. '
        f"User description: {description}"
    )
    url = settings.gemini_api_url.format(model=settings.gemini_model)
    try:
        response = httpx.post(
            url,
            headers={"x-goog-api-key": settings.gemini_api_key},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"},
            },
            timeout=30,
        )
        response.raise_for_status()
        content = _extract_gemini_text(response.json())
        return ProfileParseResponse.model_validate(json.loads(content))
    except (httpx.HTTPError, json.JSONDecodeError, TypeError, ValueError) as exc:
        raise AIProviderError("Gemini could not parse the profile description") from exc
