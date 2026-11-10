"""Seed the database with demo users and hosted zones for development."""

import json

from sqlalchemy.orm import Session

from database import SessionLocal
from models import User, HostedZone, DNSRecord, _zone_id, _record_id, _utcnow


def seed():
    """Populate the database with sample data if tables are empty."""
    db: Session = SessionLocal()
    try:
        # Only seed if no users exist yet
        if db.query(User).count() > 0:
            print("[seed] Database already seeded – skipping.")
            return

        now = _utcnow()

        # ----- Users -----
        users = [
            User(
                id="usr-admin001",
                username="admin",
                password="password",
                account_id="1234-5678-9012",
                role="AdministratorAccess",
            ),
            User(
                id="usr-dev00002",
                username="developer",
                password="password",
                account_id="1234-5678-9012",
                role="PowerUserAccess",
            ),
        ]
        db.add_all(users)

        # ----- Hosted Zone 1: example.com -----
        zone1_id = "Z0A1B2C3D4EXAMPL"
        zone1 = HostedZone(
            id=zone1_id,
            name="example.com.",
            type="Public",
            comment="Primary production domain",
            record_count=7,
            created_at=now,
            updated_at=now,
        )
        db.add(zone1)

        zone1_records = [
            DNSRecord(
                id=_record_id(), hosted_zone_id=zone1_id, name="example.com.",
                type="NS", ttl=172800,
                values=json.dumps([
                    "ns-384.awsdns-48.com",
                    "ns-1022.awsdns-63.net",
                    "ns-1536.awsdns-01.org",
                    "ns-768.awsdns-32.co.uk",
                ]),
                routing_policy="Simple", is_system=True,
                created_at=now, updated_at=now,
            ),
            DNSRecord(
                id=_record_id(), hosted_zone_id=zone1_id, name="example.com.",
                type="SOA", ttl=900,
                values=json.dumps([
                    "ns-384.awsdns-48.com awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"
                ]),
                routing_policy="Simple", is_system=True,
                created_at=now, updated_at=now,
            ),
            DNSRecord(
                id=_record_id(), hosted_zone_id=zone1_id, name="example.com.",
                type="A", ttl=300,
                values=json.dumps(["93.184.216.34"]),
                routing_policy="Simple", is_system=False,
                created_at=now, updated_at=now,
            ),
            DNSRecord(
                id=_record_id(), hosted_zone_id=zone1_id, name="www.example.com.",
                type="CNAME", ttl=300,
                values=json.dumps(["example.com."]),
                routing_policy="Simple", is_system=False,
                created_at=now, updated_at=now,
            ),
            DNSRecord(
                id=_record_id(), hosted_zone_id=zone1_id, name="example.com.",
                type="MX", ttl=300,
                values=json.dumps(["10 mail.example.com.", "20 mail2.example.com."]),
                routing_policy="Simple", is_system=False,
                created_at=now, updated_at=now,
            ),
            DNSRecord(
                id=_record_id(), hosted_zone_id=zone1_id, name="api.example.com.",
                type="A", ttl=60,
                values=json.dumps(["10.0.1.50", "10.0.1.51"]),
                routing_policy="Simple", is_system=False,
                created_at=now, updated_at=now,
            ),
            DNSRecord(
                id=_record_id(), hosted_zone_id=zone1_id, name="example.com.",
                type="TXT", ttl=300,
                values=json.dumps(['"v=spf1 include:_spf.google.com ~all"']),
                routing_policy="Simple", is_system=False,
                created_at=now, updated_at=now,
            ),
        ]
        db.add_all(zone1_records)

        # ----- Hosted Zone 2: internal.service.local (Private) -----
        zone2_id = "Z0INTERNAL00PRIV"
        zone2 = HostedZone(
            id=zone2_id,
            name="internal.service.local.",
            type="Private",
            comment="Internal microservices VPC zone",
            vpc_id="vpc-0abc123def456789",
            vpc_region="us-east-1",
            record_count=4,
            created_at=now,
            updated_at=now,
        )
        db.add(zone2)

        zone2_records = [
            DNSRecord(
                id=_record_id(), hosted_zone_id=zone2_id, name="internal.service.local.",
                type="NS", ttl=172800,
                values=json.dumps([
                    "ns-512.awsdns-09.com",
                    "ns-1100.awsdns-17.net",
                    "ns-1800.awsdns-35.org",
                    "ns-256.awsdns-22.co.uk",
                ]),
                routing_policy="Simple", is_system=True,
                created_at=now, updated_at=now,
            ),
            DNSRecord(
                id=_record_id(), hosted_zone_id=zone2_id, name="internal.service.local.",
                type="SOA", ttl=900,
                values=json.dumps([
                    "ns-512.awsdns-09.com awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"
                ]),
                routing_policy="Simple", is_system=True,
                created_at=now, updated_at=now,
            ),
            DNSRecord(
                id=_record_id(), hosted_zone_id=zone2_id, name="auth.internal.service.local.",
                type="A", ttl=60,
                values=json.dumps(["10.0.2.10"]),
                routing_policy="Simple", is_system=False,
                created_at=now, updated_at=now,
            ),
            DNSRecord(
                id=_record_id(), hosted_zone_id=zone2_id, name="db.internal.service.local.",
                type="CNAME", ttl=300,
                values=json.dumps(["rds-primary.us-east-1.rds.amazonaws.com."]),
                routing_policy="Simple", is_system=False,
                created_at=now, updated_at=now,
            ),
        ]
        db.add_all(zone2_records)

        # ----- Hosted Zone 3: staging.io -----
        zone3_id = "Z0STAGING00IO001"
        zone3 = HostedZone(
            id=zone3_id,
            name="staging.io.",
            type="Public",
            comment="Staging environment",
            record_count=3,
            created_at=now,
            updated_at=now,
        )
        db.add(zone3)

        zone3_records = [
            DNSRecord(
                id=_record_id(), hosted_zone_id=zone3_id, name="staging.io.",
                type="NS", ttl=172800,
                values=json.dumps([
                    "ns-200.awsdns-54.com",
                    "ns-900.awsdns-01.net",
                    "ns-1400.awsdns-48.org",
                    "ns-600.awsdns-09.co.uk",
                ]),
                routing_policy="Simple", is_system=True,
                created_at=now, updated_at=now,
            ),
            DNSRecord(
                id=_record_id(), hosted_zone_id=zone3_id, name="staging.io.",
                type="SOA", ttl=900,
                values=json.dumps([
                    "ns-200.awsdns-54.com awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"
                ]),
                routing_policy="Simple", is_system=True,
                created_at=now, updated_at=now,
            ),
            DNSRecord(
                id=_record_id(), hosted_zone_id=zone3_id, name="staging.io.",
                type="A", ttl=300,
                values=json.dumps(["52.12.34.56"]),
                routing_policy="Simple", is_system=False,
                created_at=now, updated_at=now,
            ),
        ]
        db.add_all(zone3_records)

        db.commit()
        print("[seed] Database seeded with 2 users, 3 hosted zones, and 14 DNS records.")

    except Exception as e:
        db.rollback()
        print(f"[seed] Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    from database import init_db
    init_db()
    seed()
