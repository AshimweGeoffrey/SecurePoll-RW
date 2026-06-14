"""Application configuration."""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Absolute path to .env so pydantic-settings finds it regardless of CWD.
_ENV_FILE = Path(__file__).parent.parent.parent / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    database_url: str

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 30

    # Encryption
    template_aes_key: str  # 32-byte hex for AES-256-GCM

    # AI/ML thresholds
    face_match_threshold: float = 0.80
    review_floor: float = 0.60
    dedup_threshold: float = 0.85

    # FAISS
    faiss_index_path: str = "ml/faiss/index.bin"

    # Debug
    debug: bool = False


# Singleton settings instance
settings = Settings()  # type: ignore
