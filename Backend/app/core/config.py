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

    # AI/ML thresholds — calibrated on the LFW cross-session benchmark
    # (genuine cosine ~0.63, impostor max ~0.195). Old 0.80/0.60/0.85 rejected
    # ~95% of genuine voters; see scripts/benchmark_lfw.py.
    face_match_threshold: float = 0.30
    review_floor: float = 0.20
    dedup_threshold: float = 0.40

    # Inference backend: "insightface" (real ArcFace) | "synthetic" (deterministic, no model)
    ai_backend: str = "insightface"

    # Liveness backend: "passive" (image-quality anti-spoof) | "none" (always pass)
    liveness_backend: str = "passive"

    # FAISS
    faiss_index_path: str = "ml/faiss/index.bin"

    # CORS — comma-separated allowed origins, or "*" for any (dev only)
    cors_origins: str = "*"

    # Rate limiting (requests/minute on sensitive endpoints; 0 disables)
    rate_limit_per_minute: int = 60

    # Debug
    debug: bool = False

    @property
    def cors_origin_list(self) -> list:
        v = (self.cors_origins or "*").strip()
        return ["*"] if v == "*" else [o.strip() for o in v.split(",") if o.strip()]


# Singleton settings instance
settings = Settings()  # type: ignore
