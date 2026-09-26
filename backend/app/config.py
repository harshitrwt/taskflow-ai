import os
import re
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

_current_dir = os.path.dirname(os.path.abspath(__file__))
_backend_dir = os.path.dirname(_current_dir)
_root_dir = os.path.dirname(_backend_dir)

_env_files = [
    os.path.join(_root_dir, ".env"),
    os.path.join(_backend_dir, ".env"),
    ".env",
]


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./taskflow.db"
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    port: int = 8000
    host: str = "0.0.0.0"

    model_config = SettingsConfigDict(
        env_file=_env_files,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def clean_database_url(cls, v: str) -> str:
        if not v or not isinstance(v, str):
            return "sqlite+aiosqlite:///./taskflow.db"

        url = v.strip()

        # Handle psql CLI command strings e.g. psql 'postgresql://...'
        match = re.search(r"'(postgresql[^']+)'", url)
        if match:
            url = match.group(1)

        # Normalize driver for async SQLAlchemy
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)

        # Clean query parameters for asyncpg
        # asyncpg accepts ssl=require rather than sslmode=require
        if "sslmode=require" in url:
            url = url.replace("sslmode=require", "ssl=require")
        if "&channel_binding=require" in url:
            url = url.replace("&channel_binding=require", "")
        if "?channel_binding=require&" in url:
            url = url.replace("?channel_binding=require&", "?")
        if "?channel_binding=require" in url:
            url = url.replace("?channel_binding=require", "")

        return url

    @field_validator("groq_model", mode="before")
    @classmethod
    def validate_groq_model(cls, v: str) -> str:
        if not v or not isinstance(v, str):
            return "openai/gpt-oss-120b"
        return v.strip()



settings = Settings()
