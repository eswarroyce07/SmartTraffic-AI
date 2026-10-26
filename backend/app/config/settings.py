from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    mongodb_url: Optional[str] = None
    database_name: str = "smarttraffic"
    secret_key: str = "change-me-in-production-min-32-chars-long"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    environment: str = "development"
    log_level: str = "INFO"
    upload_dir: str = "uploads"
    models_dir: str = "app/ml/models_saved"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
