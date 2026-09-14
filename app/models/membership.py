from enum import Enum

from pydantic import BaseModel, ConfigDict
from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

from app.models.circles import Circle


class RequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class MembershipRequest(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    circle_id: int = Field(foreign_key="circle.id")
    status: RequestStatus = RequestStatus.PENDING


class Membership(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint("user_id", "circle_id"),
        UniqueConstraint("circle_id", "turn_position"),
    )

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    circle_id: int = Field(foreign_key="circle.id")
    turn_position: int

    circle: Circle | None = Relationship(back_populates="memberships")


class MembershipRequestOut(BaseModel):
    id: int
    user_id: int
    circle_id: int
    status: RequestStatus

    model_config = ConfigDict(from_attributes=True)
