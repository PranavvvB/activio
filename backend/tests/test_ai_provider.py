import json
from types import SimpleNamespace

import httpx

from app.services import ai_service


def auth(client) -> dict[str, str]:
    client.post(
        "/api/auth/register",
        json={
            "email": "gemini@example.com",
            "username": "geminiuser",
            "password": "secret123",
        },
    )
    token = client.post(
        "/api/auth/login",
        json={"email": "gemini@example.com", "password": "secret123"},
    ).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def configured_settings() -> SimpleNamespace:
    return SimpleNamespace(
        gemini_api_key="test-key",
        gemini_model="gemini-test",
        gemini_api_url="https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
    )


def test_gemini_parse_success(client, monkeypatch):
    requests = []

    def post(url, **kwargs):
        requests.append((url, kwargs))
        return httpx.Response(
            200,
            request=httpx.Request("POST", url),
            json={
                "candidates": [
                    {
                        "content": {
                            "parts": [
                                {
                                    "text": json.dumps(
                                        {
                                            "activities": [
                                                {
                                                    "name": "tennis",
                                                    "skill_level": "intermediate",
                                                }
                                            ],
                                            "availability": {
                                                "days": ["wednesday"],
                                                "start_time": "18:00",
                                            },
                                            "intensity": "competitive",
                                            "max_distance_km": 10,
                                            "social_preferences": [],
                                        }
                                    )
                                }
                            ]
                        }
                    }
                ]
            },
        )

    monkeypatch.setattr(ai_service, "get_settings", configured_settings)
    monkeypatch.setattr(ai_service.httpx, "post", post)
    response = client.post(
        "/api/ai/parse-profile",
        headers=auth(client),
        json={"description": "I play intermediate tennis on Wednesday evenings"},
    )

    assert response.status_code == 200
    assert response.json()["activities"][0]["name"] == "tennis"
    assert requests[0][0].endswith("/models/gemini-test:generateContent")
    assert requests[0][1]["headers"] == {"x-goog-api-key": "test-key"}
    assert "model" not in requests[0][1]["json"]


def test_gemini_parse_malformed_response(client, monkeypatch):
    monkeypatch.setattr(ai_service, "get_settings", configured_settings)
    monkeypatch.setattr(
        ai_service.httpx,
        "post",
        lambda *args, **kwargs: httpx.Response(
            200, request=httpx.Request("POST", args[0]), json={"candidates": []}
        ),
    )

    response = client.post(
        "/api/ai/parse-profile",
        headers=auth(client),
        json={"description": "I play tennis"},
    )
    assert response.status_code == 502


def test_gemini_provider_error(client, monkeypatch):
    monkeypatch.setattr(ai_service, "get_settings", configured_settings)
    monkeypatch.setattr(
        ai_service.httpx,
        "post",
        lambda *args, **kwargs: httpx.Response(
            429,
            request=httpx.Request("POST", args[0]),
            json={"error": {"message": "quota"}},
        ),
    )

    response = client.post(
        "/api/ai/parse-profile",
        headers=auth(client),
        json={"description": "I play tennis"},
    )
    assert response.status_code == 502


def test_gemini_missing_configuration(client, monkeypatch):
    monkeypatch.setattr(
        ai_service,
        "get_settings",
        lambda: SimpleNamespace(gemini_api_key=None),
    )
    response = client.post(
        "/api/ai/parse-profile",
        headers=auth(client),
        json={"description": "I play tennis"},
    )
    assert response.status_code == 503
