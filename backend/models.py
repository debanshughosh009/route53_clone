"""SQLAlchemy ORM models for the Route 53 clone."""

import uuid
import random
import string
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from database import Base


# ---------------------------------------------------------------------------
# Helper: generate Route 53-style IDs
# ---------------------------------------------------------------------------

def _zone_id() -> str:
    """Generate a Route 53-style Hosted Zone ID like Z0A1B2C3D4E5F6."""
    chars = string.ascii_uppercase + string.digits
    return "Z" + "".join(random.choices(chars, k=14))


def _record_id() -> str:
    return f"REC-{uuid.uuid4().hex[:12]}"


def _user_id() -> str:
    return f"usr-{uuid.uuid4().hex[:8]}"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_user_id)
    username = Column(String(64), unique=True, nullable=False)
    password = Column(String(128), nullable=False, default="password")
    account_id = Column(String(20), nullable=False, default="1234-5678-9012")
    role = Column(String(64), nullable=False, default="AdministratorAccess")
    token = Column(String(128), nullable=True)


class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id = Column(String, primary_key=True, default=_zone_id)
    name = Column(String(255), nullable=False)
    type = Column(String(10), nullable=False, default="Public")  # Public | Private
    comment = Column(Text, nullable=True, default="")
    vpc_id = Column(String(64), nullable=True)
    vpc_region = Column(String(32), nullable=True)
    record_count = Column(Integer, nullable=False, default=2)  # NS + SOA by default
    created_at = Column(DateTime, nullable=False, default=_utcnow)
    updated_at = Column(DateTime, nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationship
    records = relationship(
        "DNSRecord",
        back_populates="hosted_zone",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )


class DNSRecord(Base):
    __tablename__ = "dns_records"

    id = Column(String, primary_key=True, default=_record_id)
    hosted_zone_id = Column(
        String,
        ForeignKey("hosted_zones.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String(255), nullable=False)
    type = Column(String(10), nullable=False)  # A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA, SOA
    ttl = Column(Integer, nullable=False, default=300)
    values = Column(Text, nullable=False)  # JSON array string, e.g. '["1.2.3.4"]'
    routing_policy = Column(String(20), nullable=False, default="Simple")
    is_system = Column(Boolean, nullable=False, default=False)  # Protected NS/SOA
    created_at = Column(DateTime, nullable=False, default=_utcnow)
    updated_at = Column(DateTime, nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationship
    hosted_zone = relationship("HostedZone", back_populates="records")
