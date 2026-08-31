import httpx

from app.config import get_settings
from app.schemas.ai import ProfileParseResponse


def parse_profile_description(description: str) -> ProfileParseResponse:
    settings = get_settings()
    if not settings.llm_api_key:
        raise RuntimeError("AI profile parsing is not configured")
    prompt = (
        "Extract the user's sports preferences as JSON matching this schema: "
        '{"activities":[{"name":"string","skill_level":"string|null","intensity":"string|null"}],'
        '"availability":{"days":["string"],"start_time":"HH:MM|null","end_time":"HH:MM|null"},'
        '"intensity":"string|null","max_distance_km":number|null,"social_preferences":["string"]}. '
        f"User description: {description}"
    )
    response = httpx.post(
        settings.llm_api_url,
        headers={"Authorization": f"Bearer {settings.llm_api_key}"},
        json={
            "model": settings.llm_model,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
        },
        timeout=30,
    )
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    import json
    return ProfileParseResponse.model_validate(json.loads(content))
