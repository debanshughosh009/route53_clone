"""Pydantic schemas for request/response validation."""

from __future__ import annotations

import json
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1, max_length=128)


class UserOut(BaseModel):
    id: str
    username: str
    account_id: str
    role: str

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    user: UserOut
    token: str


# ---------------------------------------------------------------------------
# Hosted Zones
# ---------------------------------------------------------------------------

class HostedZoneCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, examples=["example.com"])
    type: str = Field(default="Public", pattern=r"^(Public|Private)$")
    comment: Optional[str] = Field(default="", max_length=512)
    vpc_id: Optional[str] = None
    vpc_region: Optional[str] = None

    @field_validator("name")
    @classmethod
    def normalize_domain(cls, v: str) -> str:
        v = v.strip().lower()
        if not v.endswith("."):
            v += "."
        return v


class HostedZoneUpdate(BaseModel):
    comment: Optional[str] = Field(default=None, max_length=512)


class HostedZoneOut(BaseModel):
    id: str
    name: str
    type: str
    comment: Optional[str]
    vpc_id: Optional[str]
    vpc_region: Optional[str]
    record_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HostedZoneListResponse(BaseModel):
    items: list[HostedZoneOut]
    total: int
    offset: int
    limit: int


# ---------------------------------------------------------------------------
# DNS Records
# ---------------------------------------------------------------------------

VALID_RECORD_TYPES = {"A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA", "SOA"}


class DNSRecordCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., examples=["A"])
    ttl: int = Field(default=300, ge=0, le=2147483647)
    values: list[str] = Field(..., min_length=1)
    routing_policy: str = Field(default="Simple")

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v = v.upper()
        if v not in VALID_RECORD_TYPES:
            raise ValueError(f"Invalid record type '{v}'. Must be one of: {', '.join(sorted(VALID_RECORD_TYPES))}")
        return v

    @field_validator("name")
    @classmethod
    def normalize_record_name(cls, v: str) -> str:
        return v.strip()


class DNSRecordUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=255)
    type: Optional[str] = None
    ttl: Optional[int] = Field(default=None, ge=0, le=2147483647)
    values: Optional[list[str]] = None
    routing_policy: Optional[str] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.upper()
        if v not in VALID_RECORD_TYPES:
            raise ValueError(f"Invalid record type '{v}'. Must be one of: {', '.join(sorted(VALID_RECORD_TYPES))}")
        return v


class DNSRecordOut(BaseModel):
    id: str
    hosted_zone_id: str
    name: str
    type: str
    ttl: int
    values: list[str]
    routing_policy: str
    is_system: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @field_validator("values", mode="before")
    @classmethod
    def parse_values(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v


class DNSRecordListResponse(BaseModel):
    items: list[DNSRecordOut]
    total: int
    offset: int
    limit: int


class BulkDeleteRequest(BaseModel):
    record_ids: list[str] = Field(..., min_length=1)


class BulkDeleteResponse(BaseModel):
    deleted: int
    protected: list[str]


# ---------------------------------------------------------------------------
# Import / Export
# ---------------------------------------------------------------------------

class ImportResult(BaseModel):
    imported: int
    skipped: int
    errors: list[str]
