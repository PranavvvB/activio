from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.deps import get_db
from app.models.connection import Connection
from app.models.message import Message
from app.models.user import User
from app.schemas.connection import (
    ConnectionCreate,
    ConnectionRead,
    ConnectionStatusUpdate,
    MessageCreate,
    MessageRead,
)
from app.services.connection_service import (
    add_message,
    create_connection,
    update_connection,
)

router = APIRouter(prefix="/api/connections", tags=["connections"])


def _get_member_connection(db: Session, connection_id: int, user_id: int) -> Connection:
    connection = (
        db.query(Connection)
        .filter(
            Connection.id == connection_id,
            (Connection.requester_id == user_id) | (Connection.recipient_id == user_id),
        )
        .first()
    )
    if connection is None:
        raise HTTPException(status_code=404, detail="Connection not found")
    return connection


@router.post("", response_model=ConnectionRead, status_code=status.HTTP_201_CREATED)
def request_connection(
    payload: ConnectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Connection:
    if payload.recipient_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot connect with yourself")
    if (
        db.query(User)
        .filter(User.id == payload.recipient_id, User.is_active.is_(True))
        .first()
        is None
    ):
        raise HTTPException(status_code=404, detail="Recipient not found")
    existing = (
        db.query(Connection)
        .filter(
            (
                (Connection.requester_id == current_user.id)
                & (Connection.recipient_id == payload.recipient_id)
            )
            | (
                (Connection.requester_id == payload.recipient_id)
                & (Connection.recipient_id == current_user.id)
            )
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409, detail="A connection already exists between these users"
        )
    return create_connection(db, current_user.id, payload.recipient_id)


@router.get("", response_model=list[ConnectionRead])
def list_connections(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[Connection]:
    return (
        db.query(Connection)
        .filter(
            (Connection.requester_id == current_user.id)
            | (Connection.recipient_id == current_user.id)
        )
        .order_by(Connection.created_at.desc())
        .all()
    )


@router.patch("/{connection_id}", response_model=ConnectionRead)
def respond_to_connection(
    connection_id: int,
    payload: ConnectionStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Connection:
    connection = _get_member_connection(db, connection_id, current_user.id)
    if connection.recipient_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the recipient can respond to a connection request",
        )
    if connection.status != "pending":
        raise HTTPException(
            status_code=409, detail="Connection request has already been handled"
        )
    return update_connection(db, connection, payload.status)


@router.post("/{connection_id}/accept", response_model=ConnectionRead)
def accept_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Connection:
    return respond_to_connection(
        connection_id, ConnectionStatusUpdate(status="accepted"), current_user, db
    )


@router.post("/{connection_id}/reject", response_model=ConnectionRead)
def reject_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Connection:
    return respond_to_connection(
        connection_id, ConnectionStatusUpdate(status="rejected"), current_user, db
    )


@router.post(
    "/{connection_id}/messages",
    response_model=MessageRead,
    status_code=status.HTTP_201_CREATED,
)
def send_message(
    connection_id: int,
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageRead:
    connection = _get_member_connection(db, connection_id, current_user.id)
    if connection.status != "accepted":
        raise HTTPException(
            status_code=403, detail="Messaging requires an accepted connection"
        )
    return add_message(db, connection, current_user.id, payload.content)


@router.get("/{connection_id}/messages", response_model=list[MessageRead])
def list_messages(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[MessageRead]:
    connection = _get_member_connection(db, connection_id, current_user.id)
    if connection.status != "accepted":
        raise HTTPException(
            status_code=403, detail="Messaging requires an accepted connection"
        )
    return (
        db.query(Message)
        .filter(Message.connection_id == connection.id)
        .order_by(Message.created_at.asc())
        .all()
    )
