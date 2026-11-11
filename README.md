# Route 53 Clone

A full-stack, open-source recreation of the Amazon Route 53 console for learning, prototyping, and local development. The project provides an AWS-inspired interface for managing hosted zones and DNS records through a Next.js frontend and a FastAPI backend.

> **Live demo:** [route53clonefrontend.vercel.app](https://route53clonefrontend.vercel.app/)

This is an educational clone, not an AWS product or a replacement for Route 53.

## Highlights

- AWS Console-inspired navigation, layout, responsive tables, alerts, modals, and dark mode
- Hosted zone creation, search, editing, deletion, and public/private zone support
- Automatic NS and SOA record provisioning for new zones
- DNS record management for `A`, `AAAA`, `CNAME`, `TXT`, `MX`, `NS`, `PTR`, `SRV`, `CAA`, and `SOA`
- Simple, weighted, latency, and failover routing policy selections
- BIND zone-file import and BIND/JSON export
- Bulk record deletion and protected system records
- Mocked sections for health checks, resolver, traffic policies, profiles, and dashboard views
- Interactive OpenAPI documentation through FastAPI

## Important limitations

This project does **not** connect to AWS or any real DNS provider.

- Authentication and IAM roles are mocked.
- Demo users and DNS records are seeded into SQLite.
- Nameservers and DNS responses are simulated; no real DNS propagation occurs.
- Creating or deleting a zone does not change a real domain.
- The default deployment uses SQLite, whose filesystem is ephemeral on Render.
- The deployed app is intended for demonstration and development, not production workloads.

## Architecture

```text
┌──────────────────────┐       REST API       ┌──────────────────────┐
│ Next.js + TypeScript │ ◄──────────────────► │ FastAPI + SQLAlchemy │
│ AWS-style console    │                      │ Mock Route 53 API    │
└──────────────────────┘                      └──────────┬───────────┘
                                                         │
                                                         ▼
                                                   SQLite database
```

### Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | FastAPI, Uvicorn, SQLAlchemy, Pydantic |
| Database | SQLite |
| Deployment | Vercel (frontend), Render (backend) |

## Project structure

```text
.
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # API schemas
│   ├── database.py          # SQLite engine and sessions
│   ├── seed.py              # Demo data
│   └── routers/             # Auth, hosted zones, and records
├── frontend/
│   └── src/
│       ├── app/              # Next.js routes and pages
│       ├── components/       # Reusable UI components
│       ├── lib/              # API client
│       └── types/            # TypeScript types
├── render.yaml               # Render backend configuration
└── README.md
```

## Quick start

### Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer
- npm

### 1. Start the backend

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

The backend is available at [http://localhost:8000](http://localhost:8000).

- API health: `GET /api/health`
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If the backend is not running on the default URL, set `NEXT_PUBLIC_API_URL` to the backend URL without a trailing slash.

## Demo credentials

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `password` | `AdministratorAccess` |
| `developer` | `password` | `PowerUserAccess` |

These credentials are intentionally public demo values. Do not use them for a real deployment.

## API overview

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Create a mock session |
| `GET` | `/api/auth/me` | Get the current mock user |
| `POST` | `/api/auth/logout` | Revoke a mock session |

### Hosted zones

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/hosted-zones` | List and search zones |
| `POST` | `/api/hosted-zones` | Create a zone and system records |
| `GET` | `/api/hosted-zones/{id}` | View zone details |
| `PATCH` | `/api/hosted-zones/{id}` | Update zone metadata |
| `DELETE` | `/api/hosted-zones/{id}` | Delete a zone and its records |

### Records

Record endpoints are available under `/api/hosted-zones/{zone_id}/records`, including CRUD operations, bulk deletion, BIND import, and BIND/JSON export.

## Deployment

### Backend on Render

1. Create a Render Blueprint from this repository using `render.yaml`.
2. Set `CORS_ORIGINS` to the deployed frontend URL.
3. Render installs `backend/requirements.txt` and starts Uvicorn on the assigned port.

The included Render configuration exposes `/api/health` as its health check. Because the default database is SQLite on an ephemeral filesystem, data should be migrated to a persistent database before production use.

### Frontend on Vercel

1. Import the repository into Vercel.
2. Set the project root to `frontend`.
3. Set `NEXT_PUBLIC_API_URL` to the deployed Render API URL.
4. Deploy using the default Next.js settings.

## Verification

Run the backend verification script:

```bash
cd backend
python test_direct.py
```

Build the frontend:

```bash
cd frontend
npm run build
```

## Contributing

Issues and pull requests are welcome. For changes, please keep the frontend and backend behavior consistent, update the relevant documentation, and verify the affected workflows locally before opening a pull request.

## Disclaimer

Amazon Route 53, AWS, and related names and trademarks belong to Amazon Web Services, Inc. This project is an independent educational implementation and is not affiliated with or endorsed by AWS.
