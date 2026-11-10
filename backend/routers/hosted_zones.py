"""Hosted Zones CRUD router."""

import json
import random
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from database import get_db
from models import HostedZone, DNSRecord, _zone_id, _record_id, _utcnow
from schemas import (
    HostedZoneCreate,
    HostedZoneUpdate,
    HostedZoneOut,
    HostedZoneListResponse,
)

router = APIRouter(prefix="/api/hosted-zones", tags=["Hosted Zones"])

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# Fake Route 53 nameservers – four per zone, randomly chosen
_NS_POOL = [
    "ns-{n}.awsdns-{s}.com",
    "ns-{n}.awsdns-{s}.net",
    "ns-{n}.awsdns-{s}.org",
    "ns-{n}.awsdns-{s}.co.uk",
]


def _generate_nameservers() -> list[str]:
    """Return four pseudo-random AWS-style nameservers."""
    suffixes = random.sample(["01", "22", "35", "48", "09", "17", "63", "54"], 4)
    nums = random.sample(range(100, 2000), 4)
    return [
        tpl.format(n=n, s=s)
        for tpl, n, s in zip(_NS_POOL, nums, suffixes)
    ]


def _create_default_records(zone: HostedZone, db: Session) -> None:
    """Create the default NS and SOA records for a new hosted zone."""
    nameservers = _generate_nameservers()
    now = _utcnow()

    ns_record = DNSRecord(
        id=_record_id(),
        hosted_zone_id=zone.id,
        name=zone.name,
        type="NS",
        ttl=172800,
        values=json.dumps(nameservers),
        routing_policy="Simple",
        is_system=True,
        created_at=now,
        updated_at=now,
    )

    soa_value = (
        f"{nameservers[0]} awsdns-hostmaster.amazon.com. "
        f"1 7200 900 1209600 86400"
    )
    soa_record = DNSRecord(
        id=_record_id(),
        hosted_zone_id=zone.id,
        name=zone.name,
        type="SOA",
        ttl=900,
        values=json.dumps([soa_value]),
        routing_policy="Simple",
        is_system=True,
        created_at=now,
        updated_at=now,
    )

    db.add_all([ns_record, soa_record])


def _recount(zone_id: str, db: Session) -> None:
    """Recalculate and update the record_count for a hosted zone."""
    count = db.query(func.count(DNSRecord.id)).filter(
        DNSRecord.hosted_zone_id == zone_id
    ).scalar()
    db.query(HostedZone).filter(HostedZone.id == zone_id).update(
        {"record_count": count}
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=HostedZoneListResponse)
def list_hosted_zones(
    search: Optional[str] = None,
    sort_by: str = "name",
    sort_order: str = "asc",
    offset: int = 0,
    limit: int = 25,
    db: Session = Depends(get_db),
):
    """List hosted zones with optional search, sorting, and pagination."""
    query = db.query(HostedZone)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                HostedZone.name.ilike(pattern),
                HostedZone.comment.ilike(pattern),
                HostedZone.id.ilike(pattern),
            )
        )

    # Sorting
    sort_col = getattr(HostedZone, sort_by, HostedZone.name)
    if sort_order == "desc":
        sort_col = sort_col.desc()
    query = query.order_by(sort_col)

    total = query.count()
    items = query.offset(offset).limit(limit).all()

    return HostedZoneListResponse(
        items=[HostedZoneOut.model_validate(z) for z in items],
        total=total,
        offset=offset,
        limit=limit,
    )


@router.post("", response_model=HostedZoneOut, status_code=201)
def create_hosted_zone(
    body: HostedZoneCreate,
    db: Session = Depends(get_db),
):
    """Create a new hosted zone with auto-provisioned NS and SOA records."""
    # Check for duplicate
    existing = db.query(HostedZone).filter(HostedZone.name == body.name).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Hosted zone '{body.name}' already exists with ID {existing.id}",
        )

    now = _utcnow()
    zone = HostedZone(
        id=_zone_id(),
        name=body.name,
        type=body.type,
        comment=body.comment or "",
        vpc_id=body.vpc_id,
        vpc_region=body.vpc_region,
        record_count=2,  # NS + SOA
        created_at=now,
        updated_at=now,
    )
    db.add(zone)
    db.flush()  # get zone.id

    _create_default_records(zone, db)
    db.commit()
    db.refresh(zone)

    return HostedZoneOut.model_validate(zone)


@router.get("/{zone_id}", response_model=HostedZoneOut)
def get_hosted_zone(zone_id: str, db: Session = Depends(get_db)):
    """Get a single hosted zone by ID."""
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Hosted zone '{zone_id}' not found")
    return HostedZoneOut.model_validate(zone)


@router.patch("/{zone_id}", response_model=HostedZoneOut)
def update_hosted_zone(
    zone_id: str,
    body: HostedZoneUpdate,
    db: Session = Depends(get_db),
):
    """Update a hosted zone's comment / description."""
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Hosted zone '{zone_id}' not found")

    if body.comment is not None:
        zone.comment = body.comment
    zone.updated_at = _utcnow()
    db.commit()
    db.refresh(zone)

    return HostedZoneOut.model_validate(zone)


@router.delete("/{zone_id}", status_code=204)
def delete_hosted_zone(zone_id: str, db: Session = Depends(get_db)):
    """Delete a hosted zone and all its records (cascade)."""
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Hosted zone '{zone_id}' not found")
    db.delete(zone)
    db.commit()
