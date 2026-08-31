from fastapi import status


def register_and_login(client) -> str:
    client.post(
        "/api/auth/register",
        json={
            "email": "profile@example.com",
            "username": "profileuser",
            "password": "secret123",
        },
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "profile@example.com", "password": "secret123"},
    )
    return response.json()["access_token"]


def test_profile_can_be_created_and_read(client) -> None:
    token = register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "display_name": "Profile User",
        "bio": "Looking for weekend tennis partners.",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "preferred_distance_km": 10,
        "preferred_group_size": 2,
        "social_preferences": "friendly,competitive",
    }

    update_response = client.put("/api/users/me/profile", json=payload, headers=headers)
    read_response = client.get("/api/users/me/profile", headers=headers)

    assert update_response.status_code == status.HTTP_200_OK
    assert read_response.status_code == status.HTTP_200_OK
    assert read_response.json()["display_name"] == "Profile User"
    assert read_response.json()["preferred_distance_km"] == 10


def test_profile_fields_are_validated(client) -> None:
    token = register_and_login(client)
    response = client.put(
        "/api/users/me/profile",
        json={"latitude": 120, "preferred_group_size": 0},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_profile_endpoints_require_authentication(client) -> None:
    response = client.put("/api/users/me/profile", json={"display_name": "Unauthenticated"})

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
