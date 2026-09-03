from app.core.security import create_access_token, get_password_hash
from app.models.user import User


def make_user(db, email: str, username: str) -> User:
    user = User(
        email=email, username=username, password_hash=get_password_hash("password123")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def headers(user: User) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user.email)}"}


def test_connection_request_acceptance_and_messaging(client, db_session):
    alice = make_user(db_session, "alice@example.com", "alice")
    bob = make_user(db_session, "bob@example.com", "bob")

    request = client.post(
        "/api/connections", headers=headers(alice), json={"recipient_id": bob.id}
    )
    assert request.status_code == 201
    connection = request.json()
    assert connection["status"] == "pending"

    blocked = client.post(
        f"/api/connections/{connection['id']}/messages",
        headers=headers(alice),
        json={"content": "Hello"},
    )
    assert blocked.status_code == 403

    accepted = client.post(
        f"/api/connections/{connection['id']}/accept", headers=headers(bob)
    )
    assert accepted.status_code == 200
    assert accepted.json()["status"] == "accepted"

    sent = client.post(
        f"/api/connections/{connection['id']}/messages",
        headers=headers(alice),
        json={"content": "Hello"},
    )
    assert sent.status_code == 201
    assert sent.json()["sender_id"] == alice.id
    listed = client.get(
        f"/api/connections/{connection['id']}/messages", headers=headers(bob)
    )
    assert listed.status_code == 200
    assert listed.json()[0]["content"] == "Hello"


def test_connection_rejection_and_authorization(client, db_session):
    alice = make_user(db_session, "alice2@example.com", "alice2")
    bob = make_user(db_session, "bob2@example.com", "bob2")
    carol = make_user(db_session, "carol@example.com", "carol")

    connection = client.post(
        "/api/connections", headers=headers(alice), json={"recipient_id": bob.id}
    ).json()
    unauthorized = client.post(
        f"/api/connections/{connection['id']}/reject", headers=headers(carol)
    )
    assert unauthorized.status_code == 404
    forbidden = client.post(
        f"/api/connections/{connection['id']}/reject", headers=headers(alice)
    )
    assert forbidden.status_code == 403
    rejected = client.post(
        f"/api/connections/{connection['id']}/reject", headers=headers(bob)
    )
    assert rejected.status_code == 200
    assert rejected.json()["status"] == "rejected"
    duplicate = client.post(
        "/api/connections", headers=headers(bob), json={"recipient_id": alice.id}
    )
    assert duplicate.status_code == 409


def test_connection_validation_and_listing(client, db_session):
    alice = make_user(db_session, "alice3@example.com", "alice3")
    assert (
        client.post(
            "/api/connections", headers=headers(alice), json={"recipient_id": alice.id}
        ).status_code
        == 400
    )
    assert (
        client.post(
            "/api/connections", headers=headers(alice), json={"recipient_id": 99999}
        ).status_code
        == 404
    )
    assert client.get("/api/connections", headers=headers(alice)).json() == []
