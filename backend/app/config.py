from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "activio-api"
    app_env: str = "development"
    debug: bool = False

    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "activio"
    postgres_user: str = "activio"
    postgres_password: str = "activio"
    database_url: str = "postgresql+psycopg://activio:activio@localhost:5432/activio"

    jwt_secret_key: str = "change-me-in-development-secret-key-12345"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    # Google AI Studio configuration. The key is only read by the backend.
    gemini_api_key: str | None = None
    gemini_api_url: str = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "{model}:generateContent"
    )
    gemini_model: str = "gemini-3.6-flash"

    @property
    def sqlalchemy_database_url(self) -> str:
        return self.database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()
