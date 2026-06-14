# SecurePoll RW — developer convenience targets
# All commands must be run from the Backend/ directory.

.DEFAULT_GOAL := help
PYTHON := python3
PYTEST  := $(PYTHON) -m pytest

# ─── Help ────────────────────────────────────────────────────────────────────
.PHONY: help
help:
	@echo ""
	@echo "  SecurePoll RW — available make targets"
	@echo ""
	@echo "  Testing"
	@echo "    make test              Run ALL tests (unit + integration)"
	@echo "    make test-unit         Run only pure unit tests (no DB needed)"
	@echo "    make test-integration  Run only integration tests (needs .env)"
	@echo "    make test-fast         Unit tests + fail fast on first error"
	@echo "    make coverage          Full coverage report (HTML)"
	@echo ""
	@echo "  Code quality"
	@echo "    make lint              Run black + isort checks"
	@echo "    make format            Auto-format with black + isort"
	@echo ""
	@echo "  Dev server"
	@echo "    make run               Start FastAPI with auto-reload"
	@echo "    make seed              Seed the database with test data"
	@echo ""

# ─── Testing ─────────────────────────────────────────────────────────────────
.PHONY: test
test:
	$(PYTEST) tests/ -ra --tb=short

.PHONY: test-unit
test-unit:
	$(PYTEST) tests/unit/ -m unit -ra --tb=short -v

.PHONY: test-integration
test-integration:
	$(PYTEST) tests/ -m integration --ignore=tests/unit -ra --tb=short -v

.PHONY: test-fast
test-fast:
	$(PYTEST) tests/unit/ -m unit -x --tb=short -q

.PHONY: test-auth
test-auth:
	$(PYTEST) tests/test_auth.py -ra --tb=short -v

.PHONY: test-voters
test-voters:
	$(PYTEST) tests/test_voters.py -ra --tb=short -v

.PHONY: test-fraud
test-fraud:
	$(PYTEST) tests/test_fraud.py -ra --tb=short -v

.PHONY: test-audit
test-audit:
	$(PYTEST) tests/test_audit_extended.py -ra --tb=short -v

.PHONY: coverage
coverage:
	$(PYTEST) tests/ \
	  --cov=app \
	  --cov-report=term-missing \
	  --cov-report=html:htmlcov \
	  -q
	@echo ""
	@echo "  HTML report written to htmlcov/index.html"

.PHONY: coverage-unit
coverage-unit:
	$(PYTEST) tests/unit/ -m unit \
	  --cov=app \
	  --cov-report=term-missing \
	  --cov-report=html:htmlcov-unit \
	  -q
	@echo ""
	@echo "  HTML report written to htmlcov-unit/index.html"

# ─── Code quality ────────────────────────────────────────────────────────────
.PHONY: lint
lint:
	$(PYTHON) -m black --check app/ tests/
	$(PYTHON) -m isort --check-only app/ tests/

.PHONY: format
format:
	$(PYTHON) -m black app/ tests/
	$(PYTHON) -m isort app/ tests/

# ─── Dev server ──────────────────────────────────────────────────────────────
.PHONY: run
run:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

.PHONY: seed
seed:
	$(PYTHON) scripts/seed.py

# ─── Install ─────────────────────────────────────────────────────────────────
.PHONY: install
install:
	pip install -e ".[dev]"

.PHONY: install-prod
install-prod:
	pip install -e "."
