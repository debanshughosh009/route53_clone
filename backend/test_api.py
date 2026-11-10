"""Integration tests verifying Phase 1 & Phase 2 backend functionality."""

from fastapi.testclient import TestClient
from main import app

with TestClient(app) as client:
    print("Testing health...")
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    print("[PASS] test_health")

    print("Testing auth...")
    res = client.post("/api/auth/login", json={"username": "admin", "password": "password"})
    assert res.status_code == 200
    data = res.json()
    token = data["token"]
    assert data["user"]["username"] == "admin"

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["username"] == "admin"
    print("[PASS] test_auth")

    print("Testing hosted zones...")
    res = client.get("/api/hosted-zones")
    assert res.status_code == 200
    assert res.json()["total"] >= 3

    new_zone_name = "testzone-ci-runner.org"
    res = client.post(
        "/api/hosted-zones",
        json={"name": new_zone_name, "type": "Public", "comment": "Test zone"}
    )
    assert res.status_code == 201
    zone_id = res.json()["id"]

    res = client.get(f"/api/hosted-zones/{zone_id}/records")
    assert res.status_code == 200
    records = res.json()["items"]
    types = {r["type"] for r in records}
    assert "NS" in types and "SOA" in types
    print("[PASS] test_hosted_zones")

    print("Testing DNS records...")
    res = client.post(
        f"/api/hosted-zones/{zone_id}/records",
        json={
            "name": f"test-host.{new_zone_name}.",
            "type": "A",
            "ttl": 60,
            "values": ["192.0.2.1"],
            "routing_policy": "Simple"
        }
    )
    assert res.status_code == 201
    rec_id = res.json()["id"]

    # Export
    res = client.get(f"/api/hosted-zones/{zone_id}/records/export?format=json")
    assert res.status_code == 200
    assert "records" in res.json()

    res = client.get(f"/api/hosted-zones/{zone_id}/records/export?format=bind")
    assert res.status_code == 200
    assert "$ORIGIN" in res.text

    # Bulk delete
    res = client.post(
        f"/api/hosted-zones/{zone_id}/records/bulk-delete",
        json={"record_ids": [rec_id]}
    )
    assert res.status_code == 200
    assert res.json()["deleted"] == 1

    # Cleanup zone
    client.delete(f"/api/hosted-zones/{zone_id}")
    print("[PASS] test_dns_records & export")

print("\n>>> ALL PHASE 1 & PHASE 2 BACKEND CHECKS PASSED SUCCESSFULLY! <<<")
