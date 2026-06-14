"""
Unit test conftest — injects minimal env vars before any app module is imported.

Unit tests MUST NOT connect to a real database.  The DATABASE_URL here is a
syntactically valid placeholder that will never be used; crypto and JWT tests
only need TEMPLATE_AES_KEY and JWT_SECRET.
"""
import os

os.environ.setdefault("DATABASE_URL", "postgresql://unit:test@localhost:5432/unit_noop")
os.environ.setdefault("JWT_SECRET", "unit-test-only-secret-padding-32-chars-ok")
os.environ.setdefault("TEMPLATE_AES_KEY", "aabbccdd" * 8)  # 64 hex chars = 32 bytes
