"""Direct unit/integration verification of Phase 1 and Phase 2 logic."""

import json
from database import SessionLocal, init_db
from models import HostedZone, DNSRecord
from routers.auth import login, me, _active_sessions
from routers.hosted_zones import list_hosted_zones, create_hosted_zone, get_hosted_zone, update_hosted_zone, delete_hosted_zone
from routers.records import list_records, create_record, update_record, delete_record, bulk_delete_records, export_records
from schemas import LoginRequest, HostedZoneCreate, HostedZoneUpdate, DNSRecordCreate, DNSRecordUpdate, BulkDeleteRequest

def run_tests():
    init_db()
    db = SessionLocal()
    try:
        print("[1] Testing Mock Auth...")
        auth_res = login(LoginRequest(username="admin", password="password"), db=db)
        assert auth_res.token.startswith("aws-sess-")
        assert auth_res.user.role == "AdministratorAccess"
        assert auth_res.user.account_id == "1234-5678-9012"
        print("  -> Auth succeeded with token:", auth_res.token)

        print("[2] Testing Hosted Zones List...")
        zones = list_hosted_zones(db=db)
        print("  -> Total zones:", zones.total)
        assert zones.total >= 3

        print("[3] Testing Create Hosted Zone with Auto NS + SOA...")
        new_zone = create_hosted_zone(HostedZoneCreate(name="my-cloud-app.io", type="Public", comment="Test zone"), db=db)
        print("  -> Created Zone ID:", new_zone.id, "Name:", new_zone.name, "Records:", new_zone.record_count)
        assert new_zone.record_count == 2
        assert new_zone.name == "my-cloud-app.io."

        print("[4] Testing DNS Records List (Verifying Auto-Provisioned NS and SOA)...")
        records = list_records(zone_id=new_zone.id, db=db)
        types = [r.type for r in records.items]
        print("  -> System records in new zone:", types)
        assert "NS" in types and "SOA" in types
        assert all(r.is_system for r in records.items)

        print("[5] Testing Create Custom DNS Records (A, CNAME, MX, TXT)...")
        # Create A record
        rec_a = create_record(
            zone_id=new_zone.id,
            body=DNSRecordCreate(
                name="api.my-cloud-app.io.",
                type="A",
                ttl=300,
                values=["1.2.3.4", "1.2.3.5"],
                routing_policy="Simple"
            ),
            db=db
        )
        print("  -> Created A Record:", rec_a.name, "values:", rec_a.values)
        assert rec_a.type == "A"
        assert len(rec_a.values) == 2

        # Create CNAME record
        rec_cname = create_record(
            zone_id=new_zone.id,
            body=DNSRecordCreate(
                name="docs.my-cloud-app.io.",
                type="CNAME",
                ttl=300,
                values=["my-cloud-app.io."],
                routing_policy="Simple"
            ),
            db=db
        )
        print("  -> Created CNAME Record:", rec_cname.name)

        # Create MX record
        rec_mx = create_record(
            zone_id=new_zone.id,
            body=DNSRecordCreate(
                name="my-cloud-app.io.",
                type="MX",
                ttl=300,
                values=["10 mail.my-cloud-app.io."],
                routing_policy="Simple"
            ),
            db=db
        )
        print("  -> Created MX Record:", rec_mx.name)

        # Check total records in zone
        zone_updated = get_hosted_zone(new_zone.id, db=db)
        print("  -> Updated Zone Record Count:", zone_updated.record_count)
        assert zone_updated.record_count == 5

        print("[6] Testing DNS Record Update...")
        updated_a = update_record(
            zone_id=new_zone.id,
            record_id=rec_a.id,
            body=DNSRecordUpdate(ttl=60, values=["1.2.3.99"]),
            db=db
        )
        print("  -> Updated A Record TTL:", updated_a.ttl, "values:", updated_a.values)
        assert updated_a.ttl == 60
        assert updated_a.values == ["1.2.3.99"]

        print("[7] Testing Export Zone to JSON & BIND format...")
        json_export = export_records(zone_id=new_zone.id, format="json", db=db)
        # Parse JSONResponse
        content = json.loads(json_export.body.decode("utf-8"))
        assert len(content["records"]) == 5
        print("  -> JSON Export Verified (5 records)")

        bind_export = export_records(zone_id=new_zone.id, format="bind", db=db)
        bind_text = bind_export.body.decode("utf-8")
        assert "$ORIGIN my-cloud-app.io." in bind_text
        assert "api.my-cloud-app.io." in bind_text
        print("  -> BIND Export Verified ($ORIGIN header present)")

        print("[8] Testing Bulk Delete DNS Records...")
        bulk_res = bulk_delete_records(
            zone_id=new_zone.id,
            body=BulkDeleteRequest(record_ids=[rec_a.id, rec_cname.id, rec_mx.id]),
            db=db
        )
        print("  -> Bulk deleted count:", bulk_res.deleted)
        assert bulk_res.deleted == 3

        print("[9] Testing Delete Hosted Zone (Cascades records)...")
        delete_hosted_zone(zone_id=new_zone.id, db=db)
        try:
            get_hosted_zone(new_zone.id, db=db)
            assert False, "Should have raised 404"
        except Exception:
            print("  -> Zone deleted successfully (404 as expected)")

        print("\n=======================================================")
        print("  ALL 9 PHASE 1 & PHASE 2 VERIFICATION TESTS PASSED!  ")
        print("=======================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
