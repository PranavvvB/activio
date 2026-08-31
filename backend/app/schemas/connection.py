from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ConnectionCreate(BaseModel):
    recipient_id: int = Field(gt=0)


class ConnectionStatusUpdate(BaseModel):
    status: Literal["accepted", "rejected"]


class ConnectionRead(BaseModel):
    id: int
    requester_id: int
    recipient_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=5000)


class MessageRead(BaseModel):
    id: int
    connection_id: int
    sender_id: int
    content: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
