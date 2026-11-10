"""Authentication router – mocked session-based auth."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import LoginRequest, AuthResponse, UserOut

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# In-memory active sessions: token -> user_id
_active_sessions: dict[str, str] = {}


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Dependency: extract and validate bearer token from Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header[7:]
    user_id = _active_sessions.get(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Mocked login – accepts any pre-seeded user with password 'password'."""
    user = db.query(User).filter(User.username == body.username).first()
    if not user or body.password != user.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = f"aws-sess-{uuid.uuid4().hex}"
    user.token = token
    db.commit()
    _active_sessions[token] = user.id

    return AuthResponse(user=UserOut.model_validate(user), token=token)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user profile."""
    return UserOut.model_validate(current_user)


@router.post("/logout", status_code=204)
def logout(request: Request):
    """Clear the active session."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        _active_sessions.pop(token, None)
    return Response(status_code=204)
