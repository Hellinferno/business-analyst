import os
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_INSECURE_DEFAULTS = {"change-me-in-production", "secret", "changeme", "dev-secret"}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://ba_user:ba_password@localhost:5432/ba_assistant"
    redis_url: str = "redis://localhost:6379/0"

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    @field_validator("jwt_secret")
    @classmethod
    def jwt_secret_must_be_strong(cls, v: str) -> str:
        env = os.getenv("ENVIRONMENT", "development")
        if env == "development" and v in _INSECURE_DEFAULTS and len(v) >= 32:
            return v
        if v in _INSECURE_DEFAULTS or len(v) < 32:
            raise ValueError(
                "JWT_SECRET is insecure. Set a random string of at least 32 characters in your .env file. "
                "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
            )
        return v

    google_oauth_client_id: str = ""
    google_oauth_client_secret: str = ""

    gemini_api_key: str = ""

    upstash_redis_rest_url: str = ""
    upstash_redis_rest_token: str = ""

    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket_name: str = "ba-assistant-files"
    r2_public_url: str = ""

    cors_allowed_origins: str = ""  # comma-separated production origins, e.g. "https://meridian.app"

    environment: str = "development"
    debug: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
