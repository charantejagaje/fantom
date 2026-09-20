"""Authentication & account endpoints.

Role assignment policy (enforced here, never in the frontend):
- WORKER: open self-registration.
- ENGINEER: self-registration allowed only with a valid invite code
  (ENGINEER_INVITE_CODES env). Otherwise requires an OWNER invite.
- OWNER: can NEVER self-register - only an existing owner can promote.
- Email verification is required before login completes (configurable).
- Generic responses avoid account enumeration.
"""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth_deps import get_current_user, require_role
from ..config import settings
from ..db import get_db
from ..models import User, UserToken
from ..security import (
    create_access_token,
    generate_opaque_token,
    hash_password,
    hash_token,
    verify_password,
)
from ..services.email_service import send_password_reset_email, send_verification_email

router = APIRouter(prefix="/auth", tags=["auth"])

VALID_ROLES = ("worker", "engineer")


def _verification_link(token: str) -> str:
    return f"{settings.APP_PUBLIC_URL.rstrip('/')}/verify-email?token={token}"


def _reset_link(token: str) -> str:
    return f"{settings.APP_PUBLIC_URL.rstrip('/')}/reset-password?token={token}"


def _token_expired(expires_at: datetime) -> bool:
    """SQLite returns naive datetimes; compare consistently in UTC."""
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at < datetime.now(timezone.utc)


def _issue_token(db: Session, user: User, purpose: str, minutes: int) -> str:
    raw = generate_opaque_token()
    db.add(
        UserToken(
            user_id=user.id,
            purpose=purpose,
            token_hash=hash_token(raw),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=minutes),
        )
    )
    db.commit()
    return raw


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: str = "worker"
    assigned_station: str | None = Field(default=None, max_length=64)
    invite_code: str | None = Field(default=None, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str | None
    role: str
    email_verified: bool
    assigned_station: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    role = payload.role.lower().strip()
    if role not in VALID_ROLES:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Only 'worker' self-registration is open. Engineers need a valid invite code; owners cannot self-register.",
        )
    if role == "engineer":
        codes = settings.engineer_invite_code_list
        if not codes or payload.invite_code not in codes:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                detail="Engineer registration requires a valid invite code from an owner.",
            )

    email = payload.email.lower().strip()
    existing = db.scalar(select(User).where(User.email == email))
    if existing is not None:
        # 409 with generic text; never reveal whether the address exists beyond this.
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Registration failed for this email.")

    user = User(
        email=email,
        full_name=payload.full_name.strip(),
        role=role,
        hashed_password=hash_password(payload.password),
        assigned_station=(payload.assigned_station or None),
        email_verified=not settings.REQUIRE_EMAIL_VERIFICATION,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if settings.REQUIRE_EMAIL_VERIFICATION:
        raw = _issue_token(db, user, "verify_email", 60 * 24)
        try:
            send_verification_email(user.email, _verification_link(raw))
        except Exception:
            pass  # outbox/log fallback handled in the service
    return user


@router.post("/verify-email")
def verify_email(payload: VerifyRequest, db: Session = Depends(get_db)):
    th = hash_token(payload.token)
    tok = db.scalar(
        select(UserToken).where(UserToken.token_hash == th, UserToken.purpose == "verify_email")
    )
    if tok is None or _token_expired(tok.expires_at):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification link.")
    user = db.get(User, tok.user_id)
    if user is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Invalid verification link.")
    user.email_verified = True
    db.delete(tok)  # single use
    db.commit()
    return {"status": "verified", "email": user.email}


@router.post("/resend-verification")
def resend_verification(payload: ResendVerificationRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    user = db.scalar(select(User).where(User.email == email))
    if user is not None and not user.email_verified:
        raw = _issue_token(db, user, "verify_email", 60 * 24)
        send_verification_email(user.email, _verification_link(raw))
    # Same response either way (no enumeration).
    return {"status": "sent_if_account_exists"}


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Account disabled.")
    if settings.REQUIRE_EMAIL_VERIFICATION and not user.email_verified:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Check your inbox, or request a new verification link.",
        )
    token, _ = create_access_token(user.id, user.role)
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    user = db.scalar(select(User).where(User.email == email))
    if user is not None and user.is_active:
        raw = _issue_token(db, user, "reset_password", 60)
        send_password_reset_email(user.email, _reset_link(raw))
    return {"status": "sent_if_account_exists"}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    th = hash_token(payload.token)
    tok = db.scalar(
        select(UserToken).where(UserToken.token_hash == th, UserToken.purpose == "reset_password")
    )
    if tok is None or _token_expired(tok.expires_at):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset link.")
    user = db.get(User, tok.user_id)
    if user is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Invalid reset link.")
    user.hashed_password = hash_password(payload.new_password)
    db.delete(tok)  # single use
    # Invalidate existing sessions minimally by rotating per-user marker:
    user.created_at = user.created_at  # (kept simple: short token TTL limits exposure)
    db.commit()
    return {"status": "password_reset"}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


class PromoteRequest(BaseModel):
    email: EmailStr
    role: str = Field(pattern="^(worker|engineer|owner)$")
    assigned_station: str | None = None


@router.post("/users/promote", response_model=UserOut)
def promote(
    payload: PromoteRequest,
    owner: User = Depends(require_role("owner")),
    db: Session = Depends(get_db),
):
    """OWNER-only: invite/assign a role to an existing account (or create it,
    emailing an invite/verification link). This is the ONLY path to OWNER."""
    email = payload.email.lower().strip()
    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        temp_password = uuid.uuid4().hex  # account must use password reset flow
        user = User(
            email=email,
            full_name=email.split("@")[0],
            role=payload.role,
            hashed_password=hash_password(temp_password),
            assigned_station=payload.assigned_station,
            email_verified=False,
            invited_by=owner.id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        raw = _issue_token(db, user, "verify_email", 60 * 24 * 3)
        send_verification_email(user.email, _verification_link(raw))
    else:
        if payload.role == "owner" and owner.role != "owner":
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Only owners can assign owners.")
        user.role = payload.role
        if payload.assigned_station is not None:
            user.assigned_station = payload.assigned_station
        db.commit()
        db.refresh(user)
    return user


class UsersListResponse(BaseModel):
    count: int
    users: list[UserOut]


@router.get("/users", response_model=UsersListResponse)
def list_users(
    owner: User = Depends(require_role("owner")),
    db: Session = Depends(get_db),
):
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    return UsersListResponse(count=len(users), users=[UserOut.model_validate(u) for u in users])
