"""Unit test: rate limiting middleware returns 429 once the limit is exceeded."""
import pytest

pytestmark = pytest.mark.unit


def test_rate_limit_triggers_429():
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    from slowapi.middleware import SlowAPIMiddleware

    app = FastAPI()
    limiter = Limiter(key_func=get_remote_address, default_limits=["3/minute"])
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    @app.get("/ping")
    def ping():
        return {"ok": True}

    client = TestClient(app)
    codes = [client.get("/ping").status_code for _ in range(5)]
    assert codes[:3] == [200, 200, 200]
    assert 429 in codes[3:], f"expected a 429 after the limit, got {codes}"
