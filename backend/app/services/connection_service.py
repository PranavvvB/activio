from sqlalchemy.orm import Session

from app.models.connection import Connection
from app.models.message import Message


def create_connection(db: Session, requester_id: int, recipient_id: int) -> Connection:
    existing = db.query(Connection).filter(
        ((Connection.requester_id == requester_id) & (Connection.recipient_id == recipient_id))
        | ((Connection.requester_id == recipient_id) & (Connection.recipient_id == requester_id))
    ).first()
    if existing:
        return existing
    connection = Connection(requester_id=requester_id, recipient_id=recipient_id, status="pending")
    db.add(connection)
    db.commit()
    db.refresh(connection)
    return connection


def update_connection(db: Session, connection: Connection, status: str) -> Connection:
    connection.status = status
    db.commit()
    db.refresh(connection)
    return connection


def add_message(db: Session, connection: Connection, sender_id: int, content: str) -> Message:
    message = Message(connection_id=connection.id, sender_id=sender_id, content=content)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
