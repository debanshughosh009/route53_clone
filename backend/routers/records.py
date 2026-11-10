"""DNS Records CRUD router with bulk operations, import, and export."""

import io
import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import PlainTextResponse, JSONResponse
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from database import get_db
from models import HostedZone, DNSRecord, _record_id, _utcnow
from schemas import (
    DNSRecordCreate,
    DNSRecordUpdate,
    DNSRecordOut,
    DNSRecordListResponse,
    BulkDeleteRequest,
    BulkDeleteResponse,
    ImportResult,
)

router = APIRouter(prefix="/api/hosted-zones/{zone_id}/records", tags=["DNS Records"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_zone_or_404(zone_id: str, db: Session) -> HostedZone:
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Hosted zone '{zone_id}' not found")
    return zone


def _recount(zone_id: str, db: Session) -> None:
    count = db.query(func.count(DNSRecord.id)).filter(
        DNSRecord.hosted_zone_id == zone_id
    ).scalar()
    db.query(HostedZone).filter(HostedZone.id == zone_id).update(
        {"record_count": count}
    )


# ---------------------------------------------------------------------------
# CRUD Endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=DNSRecordListResponse)
def list_records(
    zone_id: str,
    search: Optional[str] = None,
    type: Optional[str] = None,
    sort_by: str = "name",
    sort_order: str = "asc",
    offset: int = 0,
    limit: int = 25,
    db: Session = Depends(get_db),
):
    """List DNS records for a hosted zone with optional search, type filter, sorting, and pagination."""
    _get_zone_or_404(zone_id, db)

    query = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                DNSRecord.name.ilike(pattern),
                DNSRecord.values.ilike(pattern),
            )
        )

    if type:
        query = query.filter(DNSRecord.type == type.upper())

    sort_col = getattr(DNSRecord, sort_by, DNSRecord.name)
    if sort_order == "desc":
        sort_col = sort_col.desc()
    query = query.order_by(sort_col)

    total = query.count()
    items = query.offset(offset).limit(limit).all()

    return DNSRecordListResponse(
        items=[DNSRecordOut.model_validate(r) for r in items],
        total=total,
        offset=offset,
        limit=limit,
    )


@router.post("", response_model=DNSRecordOut, status_code=201)
def create_record(
    zone_id: str,
    body: DNSRecordCreate,
    db: Session = Depends(get_db),
):
    """Create a new DNS record within a hosted zone."""
    zone = _get_zone_or_404(zone_id, db)

    # Prevent duplicate name+type (Route 53 allows only one record set per name+type for most types)
    existing = db.query(DNSRecord).filter(
        DNSRecord.hosted_zone_id == zone_id,
        DNSRecord.name == body.name,
        DNSRecord.type == body.type,
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Record set '{body.name}' with type '{body.type}' already exists",
        )

    now = _utcnow()
    record = DNSRecord(
        id=_record_id(),
        hosted_zone_id=zone_id,
        name=body.name,
        type=body.type,
        ttl=body.ttl,
        values=json.dumps(body.values),
        routing_policy=body.routing_policy,
        is_system=False,
        created_at=now,
        updated_at=now,
    )
    db.add(record)
    _recount(zone_id, db)
    db.commit()
    db.refresh(record)

    # Update zone record count
    _recount(zone_id, db)
    db.commit()

    return DNSRecordOut.model_validate(record)


@router.get("/{record_id}", response_model=DNSRecordOut)
def get_record(zone_id: str, record_id: str, db: Session = Depends(get_db)):
    """Get a single DNS record."""
    _get_zone_or_404(zone_id, db)
    record = db.query(DNSRecord).filter(
        DNSRecord.id == record_id,
        DNSRecord.hosted_zone_id == zone_id,
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Record '{record_id}' not found")
    return DNSRecordOut.model_validate(record)


@router.put("/{record_id}", response_model=DNSRecordOut)
def update_record(
    zone_id: str,
    record_id: str,
    body: DNSRecordUpdate,
    db: Session = Depends(get_db),
):
    """Update an existing DNS record."""
    _get_zone_or_404(zone_id, db)
    record = db.query(DNSRecord).filter(
        DNSRecord.id == record_id,
        DNSRecord.hosted_zone_id == zone_id,
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Record '{record_id}' not found")

    if record.is_system:
        raise HTTPException(
            status_code=403,
            detail="Cannot modify system-managed NS or SOA records",
        )

    if body.name is not None:
        record.name = body.name
    if body.type is not None:
        record.type = body.type
    if body.ttl is not None:
        record.ttl = body.ttl
    if body.values is not None:
        record.values = json.dumps(body.values)
    if body.routing_policy is not None:
        record.routing_policy = body.routing_policy

    record.updated_at = _utcnow()
    db.commit()
    db.refresh(record)

    return DNSRecordOut.model_validate(record)


@router.delete("/{record_id}", status_code=204)
def delete_record(zone_id: str, record_id: str, db: Session = Depends(get_db)):
    """Delete a DNS record (system records are protected)."""
    _get_zone_or_404(zone_id, db)
    record = db.query(DNSRecord).filter(
        DNSRecord.id == record_id,
        DNSRecord.hosted_zone_id == zone_id,
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Record '{record_id}' not found")
    if record.is_system:
        raise HTTPException(
            status_code=403,
            detail="Cannot delete system-managed NS or SOA records",
        )

    db.delete(record)
    _recount(zone_id, db)
    db.commit()


# ---------------------------------------------------------------------------
# Bulk Delete (Bonus)
# ---------------------------------------------------------------------------

@router.post("/bulk-delete", response_model=BulkDeleteResponse)
def bulk_delete_records(
    zone_id: str,
    body: BulkDeleteRequest,
    db: Session = Depends(get_db),
):
    """Bulk delete multiple DNS records (system records are skipped)."""
    _get_zone_or_404(zone_id, db)

    deleted = 0
    protected: list[str] = []

    for rid in body.record_ids:
        record = db.query(DNSRecord).filter(
            DNSRecord.id == rid,
            DNSRecord.hosted_zone_id == zone_id,
        ).first()
        if not record:
            continue
        if record.is_system:
            protected.append(rid)
            continue
        db.delete(record)
        deleted += 1

    _recount(zone_id, db)
    db.commit()

    return BulkDeleteResponse(deleted=deleted, protected=protected)


# ---------------------------------------------------------------------------
# Export (Bonus)
# ---------------------------------------------------------------------------

@router.get("/export")
def export_records(
    zone_id: str,
    format: str = "json",
    db: Session = Depends(get_db),
):
    """Export all records of a hosted zone as JSON or BIND zone file format."""
    zone = _get_zone_or_404(zone_id, db)
    records = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id).all()

    if format == "json":
        data = {
            "hosted_zone": {
                "id": zone.id,
                "name": zone.name,
                "type": zone.type,
                "comment": zone.comment,
            },
            "records": [
                {
                    "name": r.name,
                    "type": r.type,
                    "ttl": r.ttl,
                    "values": json.loads(r.values),
                }
                for r in records
            ],
        }
        return JSONResponse(content=data)

    # BIND zone file format
    lines: list[str] = []
    lines.append(f"; BIND zone file for {zone.name}")
    lines.append(f"; Exported from Route 53 Clone")
    lines.append(f"; Zone ID: {zone.id}")
    lines.append(f"$ORIGIN {zone.name}")
    lines.append(f"$TTL 300")
    lines.append("")

    for r in records:
        vals = json.loads(r.values)
        for val in vals:
            # Format: name  TTL  IN  TYPE  value
            name_field = r.name if r.name != zone.name else "@"
            lines.append(f"{name_field}\t{r.ttl}\tIN\t{r.type}\t{val}")

    content = "\n".join(lines) + "\n"
    return PlainTextResponse(
        content=content,
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="{zone.name}zone"'},
    )


# ---------------------------------------------------------------------------
# Import (Bonus)
# ---------------------------------------------------------------------------

# Separate router for import since it lives at /api/hosted-zones/{zone_id}/import
import_router = APIRouter(prefix="/api/hosted-zones/{zone_id}", tags=["DNS Records"])


@import_router.post("/import", response_model=ImportResult)
async def import_records(
    zone_id: str,
    file: UploadFile = File(..., description="BIND zone file to import"),
    db: Session = Depends(get_db),
):
    """Import DNS records from an uploaded BIND zone file."""
    zone = _get_zone_or_404(zone_id, db)

    content = (await file.read()).decode("utf-8", errors="replace")
    lines = content.strip().splitlines()

    imported = 0
    skipped = 0
    errors: list[str] = []
    origin = zone.name

    valid_types = {"A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA", "SOA"}

    for line_num, raw_line in enumerate(lines, start=1):
        line = raw_line.strip()

        # Skip comments and empty lines
        if not line or line.startswith(";"):
            continue

        # Handle $ORIGIN directive
        if line.upper().startswith("$ORIGIN"):
            parts = line.split(None, 1)
            if len(parts) == 2:
                origin = parts[1].strip()
            continue

        # Handle $TTL directive (ignored, per-record TTL takes precedence)
        if line.upper().startswith("$TTL"):
            continue

        # Parse: name  [TTL]  [class]  type  value...
        parts = line.split(None)
        if len(parts) < 4:
            errors.append(f"Line {line_num}: insufficient fields")
            skipped += 1
            continue

        try:
            name = parts[0]
            if name == "@":
                name = zone.name

            idx = 1
            # Try to parse TTL (numeric)
            ttl = 300
            if parts[idx].isdigit():
                ttl = int(parts[idx])
                idx += 1

            # Skip class (IN, CS, CH, HS)
            if idx < len(parts) and parts[idx].upper() in ("IN", "CS", "CH", "HS"):
                idx += 1

            if idx >= len(parts):
                errors.append(f"Line {line_num}: missing record type")
                skipped += 1
                continue

            rtype = parts[idx].upper()
            idx += 1

            if rtype not in valid_types:
                errors.append(f"Line {line_num}: unsupported type '{rtype}'")
                skipped += 1
                continue

            rvalue = " ".join(parts[idx:])
            if not rvalue:
                errors.append(f"Line {line_num}: missing record value")
                skipped += 1
                continue

            # Check if record set exists – append value or create new
            existing = db.query(DNSRecord).filter(
                DNSRecord.hosted_zone_id == zone_id,
                DNSRecord.name == name,
                DNSRecord.type == rtype,
            ).first()

            if existing:
                current_vals = json.loads(existing.values)
                if rvalue not in current_vals:
                    current_vals.append(rvalue)
                    existing.values = json.dumps(current_vals)
                    existing.updated_at = _utcnow()
                    imported += 1
                else:
                    skipped += 1
            else:
                record = DNSRecord(
                    id=_record_id(),
                    hosted_zone_id=zone_id,
                    name=name,
                    type=rtype,
                    ttl=ttl,
                    values=json.dumps([rvalue]),
                    routing_policy="Simple",
                    is_system=False,
                    created_at=_utcnow(),
                    updated_at=_utcnow(),
                )
                db.add(record)
                imported += 1

        except Exception as e:
            errors.append(f"Line {line_num}: {str(e)}")
            skipped += 1

    # Recount
    count = db.query(func.count(DNSRecord.id)).filter(
        DNSRecord.hosted_zone_id == zone_id
    ).scalar()
    db.query(HostedZone).filter(HostedZone.id == zone_id).update(
        {"record_count": count}
    )
    db.commit()

    return ImportResult(imported=imported, skipped=skipped, errors=errors)
