# AWS Route 53 Clone

A full-stack, functional clone of the **Amazon Route 53** web application and DNS management console built with **Next.js (TypeScript)**, **FastAPI (Python)**, and **SQLite**.

The project closely mirrors the authentic AWS Console and Route 53 user experience, workflows, typography, and CloudScape design aesthetics.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend (TS)                           │
│  - AWS Console TopNav (Global search, Account Switcher, Dark Mode)     │
│  - Route 53 Collapsible Sidebar Navigation                             │
│  - Hosted Zones Console (CRUD, search, filters, CloudScape table)      │
│  - DNS Records Console (Quick Create wizard, A/AAAA/CNAME/MX/TXT/etc.) │
│  - BIND Zone File Import & Export (.zone / RFC 1035 format)            │
│  - Bulk Operations, Modals, Flash Alert Notifications                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          FastAPI Backend                               │
│  - /api/auth: Mocked IAM authentication and session persistence        │
│  - /api/hosted-zones: Full CRUD, auto-provisioned NS and SOA records   │
│  - /api/hosted-zones/{id}/records: Record sets CRUD & bulk operations  │
│  - /api/hosted-zones/{id}/export & /import: RFC 1035 BIND zone files   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQLAlchemy ORM
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         SQLite Database                                │
│  - users & active sessions                                             │
│  - hosted_zones (Route 53 ID format: Z0A1B2C3D4E5F6)                   │
│  - dns_records (A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA, SOA)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Features

### 1. Hosted Zones Management
- **Full CRUD functionality**: View, search, create, edit, and delete hosted zones.
- **Route 53 ID formatting**: Auto-generated zone IDs matching AWS format (`Z` followed by alphanumeric uppercase characters).
- **Auto-Provisioned System Records**: Every new zone automatically receives **4 randomized AWS nameservers** (`ns-*.awsdns-*.com/net/org/co.uk`) and a standard **SOA record**.
- **Public & Private Zones**: Supports public hosted zones and private hosted zones associated with Amazon VPCs.
- **CloudScape Details Drawer**: Click any zone to view details, metadata, and quick navigation.

### 2. DNS Record Sets Management
- **Full CRUD functionality**: View, search, create, edit, and delete records within a zone.
- **Supported Record Types**:
  - `A` (IPv4 addresses)
  - `AAAA` (IPv6 addresses)
  - `CNAME` (Canonical names)
  - `TXT` (SPF, verification strings)
  - `MX` (Mail exchangers with priority)
  - `NS` (Name servers)
  - `PTR` (Pointer records)
  - `SRV` (Service locators)
  - `CAA` (Certificate Authority Authorization)
  - `SOA` (Start of Authority)
- **Quick Create Wizard**:
  - Subdomain input with automatic root domain appending (`api` + `.example.com.`)
  - Multi-line textarea for multiple record values
  - TTL presets (`60s`, `300s`, `3600s`, `86400s`)
  - Routing policy selection (`Simple`, `Weighted`, `Latency`, `Failover`)
- **System Protection**: Default NS and SOA records are protected against accidental deletion or breaking edits.

### 3. AWS Console Experience & Design
- **Global Top Navigation Bar**:
  - Route 53 service logo and header in authentic AWS navy (`#232f3e`).
  - Search bar with `/` keyboard shortcut indicator.
  - Global region badge (`Global (Route 53)`).
  - Mocked IAM Account selector (`admin @ 1234-5678-9012` with `AdministratorAccess` role).
  - Dark mode and light mode toggle.
- **Collapsible Sidebar**: Grouped sections for DNS management, Health checking, DNS Firewall, and Monitoring.
- **Flash Alerts**: Authentic AWS green success and red error notification banners.
- **Confirmation Modals**: Type `delete` verification modal before deleting hosted zones.

### 4. Bonus Capabilities
- **Import BIND Zone Files**: Upload standard RFC 1035 `.zone` or `.txt` zone files to automatically parse and populate records.
- **Export Formats**: One-click export to standard **BIND zone file** format or structured **JSON**.
- **Bulk Operations**: Multi-select checkboxes to bulk delete DNS records in a single request.
- **Dark Mode**: Complete AWS Dark Mode styling across all tables, inputs, modals, and navigation bars.
- **Mocked Placeholder Sections**: Coming Soon landing pages for *Dashboard*, *Traffic Policies*, *Health Checks*, *Resolver*, and *Profiles*.

---

## Database Schema

```sql
-- Hosted Zones table
CREATE TABLE hosted_zones (
    id VARCHAR PRIMARY KEY,                  -- e.g. Z0A1B2C3D4EXAMPL
    name VARCHAR(255) NOT NULL,              -- e.g. example.com.
    type VARCHAR(10) NOT NULL DEFAULT 'Public', -- Public | Private
    comment TEXT,
    vpc_id VARCHAR(64),
    vpc_region VARCHAR(32),
    record_count INTEGER NOT NULL DEFAULT 2, -- Computed count
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- DNS Records table
CREATE TABLE dns_records (
    id VARCHAR PRIMARY KEY,                  -- e.g. REC-3f9a2b1c8e
    hosted_zone_id VARCHAR NOT NULL REFERENCES hosted_zones(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,              -- e.g. api.example.com.
    type VARCHAR(10) NOT NULL,               -- A, AAAA, CNAME, TXT, MX, NS, etc.
    ttl INTEGER NOT NULL DEFAULT 300,
    values TEXT NOT NULL,                    -- JSON array: '["192.0.2.1", "192.0.2.2"]'
    routing_policy VARCHAR(20) DEFAULT 'Simple',
    is_system BOOLEAN NOT NULL DEFAULT 0,    -- 1 for auto-generated NS and SOA
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- Mock IAM Users
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    account_id VARCHAR(20) NOT NULL,
    role VARCHAR(64) NOT NULL,
    token VARCHAR(128)
);
```

---

## API Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Log in and receive session token (`admin` / `password`) |
| `GET` | `/api/auth/me` | Fetch active profile and account role |
| `POST` | `/api/auth/logout` | Revoke session |

### Hosted Zones (`/api/hosted-zones`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/hosted-zones` | List zones (supports `search`, `sort_by`, `sort_order`, pagination) |
| `POST` | `/api/hosted-zones` | Create zone with auto-provisioned NS and SOA records |
| `GET` | `/api/hosted-zones/{id}` | Get zone details |
| `PATCH` | `/api/hosted-zones/{id}` | Update zone description/comment |
| `DELETE` | `/api/hosted-zones/{id}` | Delete zone and cascade delete records |

### DNS Records (`/api/hosted-zones/{zone_id}/records`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/hosted-zones/{zone_id}/records` | List records (supports `type` filter, `search`, pagination) |
| `POST` | `/api/hosted-zones/{zone_id}/records` | Create new record set |
| `GET` | `/api/hosted-zones/{zone_id}/records/{rec_id}` | Get single record set |
| `PUT` | `/api/hosted-zones/{zone_id}/records/{rec_id}` | Edit record values and TTL |
| `DELETE` | `/api/hosted-zones/{zone_id}/records/{rec_id}` | Delete record |
| `POST` | `/api/hosted-zones/{zone_id}/records/bulk-delete` | Bulk delete multiple records |
| `GET` | `/api/hosted-zones/{zone_id}/records/export` | Export zone (`?format=bind` or `?format=json`) |
| `POST` | `/api/hosted-zones/{zone_id}/import` | Import RFC 1035 BIND zone file |

---

## Quick Start / Setup Instructions

### Prerequisites
- **Python**: 3.10+ (tested on Python 3.14)
- **Node.js**: 18+ (tested on Node v24.16.0 with npm 11+)

---

### Step 1: Start the Backend (FastAPI)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server (auto-initializes and seeds SQLite database)
python -m uvicorn main:app --reload --port 8000
```

The API and interactive Swagger documentation will be available at:
- **API Base**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/docs`

---

### Step 2: Start the Frontend (Next.js)

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open your browser at:
**[http://localhost:3000](http://localhost:3000)**

---

### Default Credentials

| Username | Password | Role | Account ID |
| :--- | :--- | :--- | :--- |
| `admin` | `password` | `AdministratorAccess` | `1234-5678-9012` |
| `developer` | `password` | `PowerUserAccess` | `1234-5678-9012` |

---

## Automated Verification

To run the backend integration test suite:

```bash
cd backend
python test_direct.py
```

## Deployment

### Backend on Render

1. Create a new Render Blueprint from this repository and select `render.yaml`.
2. Set `CORS_ORIGINS` to the Vercel deployment URL (for example,
   `https://route53-clone.vercel.app`). Use a comma-separated list if multiple
   frontend URLs need access.
3. Render will build from `backend/`, expose `/api/health`, and start FastAPI
   on Render's assigned port.

The current backend stores data in SQLite. Render's local filesystem is
ephemeral, so this deployment is suitable for a demo; use a persistent
database before production.

### Frontend on Vercel

1. Import this repository into Vercel.
2. Set the project root directory to `frontend`.
3. Add `NEXT_PUBLIC_API_URL` with the deployed Render API URL, without a
   trailing slash (for example, `https://route53-clone-api.onrender.com`).
4. Deploy with the default Next.js build settings.

Every push and pull request also runs the checks in
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).
