"""FastAPI application entry point for the AWS Route 53 Clone backend."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from seed import seed
from routers.auth import router as auth_router
from routers.hosted_zones import router as zones_router
from routers.records import router as records_router, import_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the database and seed data on startup."""
    init_db()
    seed()
    yield


app = FastAPI(
    title="Route 53 Clone API",
    description="A functional clone of the AWS Route 53 DNS management service API.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS – allow the Next.js frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router)
app.include_router(zones_router)
app.include_router(records_router)
app.include_router(import_router)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "route53-clone"}
