import asyncio
import httpx
from main import app

async def run_tests():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        # 1. Health check
        res = await client.get("/api/health")
        print("1. Health check:", res.status_code, res.json())
        assert res.status_code == 200

        # 2. Auth Login
        res = await client.post("/api/auth/login", json={"username": "admin", "password": "password"})
        print("2. Auth login:", res.status_code, res.json()["user"]["username"])
        token = res.json()["token"]
        assert res.status_code == 200

        # 3. Auth Me
        res = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        print("3. Auth me:", res.status_code, res.json()["role"])
        assert res.status_code == 200

        # 4. List Hosted Zones
        res = await client.get("/api/hosted-zones")
        print("4. List hosted zones:", res.status_code, "total =", res.json()["total"])
        assert res.status_code == 200
        assert res.json()["total"] >= 3

        # 5. Create Hosted Zone
        zone_payload = {"name": "verify-run.org", "type": "Public", "comment": "Verification zone"}
        res = await client.post("/api/hosted-zones", json=zone_payload)
        print("5. Create hosted zone:", res.status_code, res.json()["id"])
        assert res.status_code == 201
        zone_id = res.json()["id"]

        # 6. List Records in newly created zone (should have auto-provisioned NS and SOA)
        res = await client.get(f"/api/hosted-zones/{zone_id}/records")
        print("6. Auto records created:", [r["type"] for r in res.json()["items"]])
        assert len(res.json()["items"]) == 2

        # 7. Create custom A record
        rec_payload = {
            "name": "app.verify-run.org.",
            "type": "A",
            "ttl": 300,
            "values": ["198.51.100.1"],
            "routing_policy": "Simple"
        }
        res = await client.post(f"/api/hosted-zones/{zone_id}/records", json=rec_payload)
        print("7. Create DNS record:", res.status_code, res.json()["name"], res.json()["values"])
        assert res.status_code == 201
        rec_id = res.json()["id"]

        # 8. Update DNS record
        res = await client.put(f"/api/hosted-zones/{zone_id}/records/{rec_id}", json={"ttl": 60, "values": ["198.51.100.2"]})
        print("8. Update DNS record:", res.status_code, res.json()["ttl"], res.json()["values"])
        assert res.status_code == 200

        # 9. JSON Export
        res = await client.get(f"/api/hosted-zones/{zone_id}/records/export?format=json")
        print("9. JSON export records count:", len(res.json()["records"]))
        assert res.status_code == 200

        # 10. BIND Export
        res = await client.get(f"/api/hosted-zones/{zone_id}/records/export?format=bind")
        print("10. BIND export line count:", len(res.text.strip().splitlines()))
        assert res.status_code == 200
        assert "$ORIGIN verify-run.org." in res.text

        # 11. Bulk Delete
        res = await client.post(f"/api/hosted-zones/{zone_id}/records/bulk-delete", json={"record_ids": [rec_id]})
        print("11. Bulk delete records deleted:", res.json()["deleted"])
        assert res.status_code == 200
        assert res.json()["deleted"] == 1

        # 12. Delete zone
        res = await client.delete(f"/api/hosted-zones/{zone_id}")
        print("12. Delete hosted zone:", res.status_code)
        assert res.status_code == 204

        print("\nAll 12 backend verification checks succeeded without errors!")

if __name__ == "__main__":
    asyncio.run(run_tests())
