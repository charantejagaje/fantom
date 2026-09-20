"""Password hashing, JWT issuing/verification, single-use opaque tokens.

- Passwords: bcrypt via passlib. Plaintext is never stored or logged.
- Access tokens: signed JWT (HS256) carrying sub (user id) + role + jti.
- Email-verification / password-reset tokens: cryptographically random
  opaque strings; only a SHA-256 hash is stored server-side, so a database
  leak does not expose usable tokens.
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str | None) -> bool:
    if not hashed:
        return False
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        return False


def create_access_token(user_id: int, role: str) -> tuple[str, str]:
    """Returns (token, jti)."""
    jti = secrets.token_hex(16)
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "role": role,
        "jti": jti,
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, jti


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if "sub" not in payload:
            return None
        return payload
    except JWTError:
        return None


def generate_opaque_token() -> str:
    """URL-safe single-use token for email verification / password reset."""
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """Store only this hash; the raw token exists only in the email link."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
