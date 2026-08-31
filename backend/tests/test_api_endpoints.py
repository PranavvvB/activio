from app.models import Activity


def auth(client) -> dict[str, str]:
    client.post("/api/auth/register", json={
        "email": "api@example.com", "username": "apiuser", "password": "secret123"
    })
    token = client.post("/api/auth/login", json={
        "email": "api@example.com", "password": "secret123"
    }).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_activity_association_and_availability(client, db_session):
    headers = auth(client)
    activity = Activity(name="Tennis", description="Racket sport")
    db_session.add(activity)
    db_session.commit()
    db_session.refresh(activity)

    assert client.get("/api/activities").json()[0]["name"] == "Tennis"
    response = client.post("/api/users/me/activities", headers=headers, json={
        "activity_id": activity.id, "skill_level": "intermediate"
    })
    assert response.status_code == 201
    assert client.get("/api/users/me/activities", headers=headers).json()[0]["skill_level"] == "intermediate"

    response = client.put("/api/users/me/availability", headers=headers, json=[{
        "day_of_week": "wednesday", "start_time": "18:00:00", "end_time": "20:00:00"
    }])
    assert response.status_code == 200
    assert client.get("/api/users/me/availability", headers=headers).json()[0]["day_of_week"] == "wednesday"


def test_ai_parse_requires_configuration(client):
    headers = auth(client)
    response = client.post("/api/ai/parse-profile", headers=headers, json={"description": "I play tennis"})
    assert response.status_code == 503
