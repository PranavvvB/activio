from fastapi import status

from app.core.security import create_access_token, get_password_hash
from app.models.user import User


def test_register_user_success(client) -> None:
    payload = {
        "email": "newuser@example.com",
        "username": "newuser",
        "password": "strong-password",
    }

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"
    assert data["is_active"] is True
    assert "id" in data


def test_login_user_success(client, db_session) -> None:
    user = User(
        email="login@example.com",
        username="loginuser",
        password_hash=get_password_hash("password123"),
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "password123"},
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)
    assert len(data["access_token"]) > 0


def test_authentication_failure_requires_token(client) -> None:
    response = client.get("/api/users/me")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Not authenticated"


def test_login_with_invalid_credentials_fails(client) -> None:
    response = client.post(
        "/api/auth/login",
        json={"email": "missing@example.com", "password": "wrong-password"},
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Incorrect email or password"


def test_invalid_token_is_rejected(client) -> None:
    invalid_token = create_access_token("someone@example.com")[:-1] + "X"
    response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {invalid_token}"},
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
