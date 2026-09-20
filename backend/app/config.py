"""Central configuration.

Values come from environment variables (12-factor). The repo-root `.env`
is loaded only in local development; in Docker the values are injected by
compose. Secrets are NEVER hardcoded here.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]  # fantom/


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # App
    APP_NAME: str = "Fantom Industrial Decision Support API"
    ENVIRONMENT: str = "development"  # development | production
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    LOG_LEVEL: str = "INFO"

    # CORS - comma-separated origins in env, e.g. "http://localhost:3000,..."
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:4173"

    # Database (PostgreSQL in deployment; SQLite fallback keeps local dev runnable
    # without a DB server - same SQLAlchemy code path either way)
    DB_ENGINE: str = "sqlite"  # postgresql | sqlite
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "fantom_user"
    DB_PASSWORD: str = ""  # secret: injected via env, never committed
    DB_NAME: str = "fantom_db"
    DB_ECHO: bool = False

    # Data locations (bind-mounted into the container in deployment)
    DATASET_RAW_DIR: str = str(BASE_DIR / "data" / "raw")
    DATASET_PROCESSED_DIR: str = str(BASE_DIR / "data" / "processed")

    # Advisory thresholds (documented heuristic from Step 6 - tunable, documented)
    BOTTLENECK_MEDIAN_MULTIPLIER: float = 2.0

    # ML registry (real models land here; nothing is faked until then)
    ML_MODELS_DIR: str = str(BASE_DIR / "ml" / "saved_models")

    # ---- Authentication / RBAC ----
    SECRET_KEY: str = "change_this_to_a_secure_random_key_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720  # 12 h
    JWT_ALGORITHM: str = "HS256"
    REQUIRE_EMAIL_VERIFICATION: bool = True
    # Comma-separated invite codes that allow self-registration as ENGINEER.
    # Empty => engineer self-registration is disabled (use owner invite instead).
    # OWNER accounts can NEVER be self-registered (see api/auth.py).
    ENGINEER_INVITE_CODES: str = ""

    # ---- Email (verification / password reset) ----
    # Empty SMTP_HOST in development => emails are written to data/outbox/*.eml
    # and the verification/reset link is logged. Production must set SMTP_*.
    SMTP_HOST: str = ""
    SMTP_PORT: int = 1025
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "fantom@localhost"
    SMTP_TLS: bool = False
    APP_PUBLIC_URL: str = "http://localhost:8080"

    @property
    def engineer_invite_code_list(self) -> list[str]:
        return [c.strip() for c in self.ENGINEER_INVITE_CODES.split(",") if c.strip()]

    @property
    def database_url(self) -> str:
        if self.DB_ENGINE.lower() == "postgresql":
            return (
                f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}"
                f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            )
        return f"sqlite:///{BASE_DIR / 'data' / 'fantom_app.db'}"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def auth_secret_ready(self) -> bool:
        """Production must not run on placeholder/example secrets."""
        weak = ("change_this", "your", "example", "placeholder", "")
        return self.SECRET_KEY.lower().strip() not in weak or not self.is_production


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
