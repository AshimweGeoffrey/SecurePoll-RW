#!/bin/bash
# Quick setup script for SecurePoll backend

set -e

echo "🔧 SecurePoll Backend Setup"
echo "============================="

# Check Python version
python_version=$(python3 --version 2>&1 | grep -oP '(?<=Python )\d+\.\d+')
echo "✓ Python $python_version detected"

if [[ ! "$python_version" =~ ^3\.1[1-9]$ ]]; then
    echo "⚠️  Warning: Python 3.11+ recommended, found $python_version"
fi

# Create .env from example
if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    
    # Generate random JWT secret
    jwt_secret=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$jwt_secret/" .env
    rm .env.bak 2>/dev/null || true
    
    # Generate random AES key
    aes_key=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    sed -i.bak "s/TEMPLATE_AES_KEY=.*/TEMPLATE_AES_KEY=$aes_key/" .env
    rm .env.bak 2>/dev/null || true
    
    echo "✓ .env created with generated secrets"
else
    echo "✓ .env already exists"
fi

# Create virtual environment if it doesn't exist
if [ ! -d venv ]; then
    echo "🐍 Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment exists"
    source venv/bin/activate
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -e . > /dev/null 2>&1
echo "✓ Dependencies installed"

# Check Docker and start Postgres
if command -v docker &> /dev/null; then
    echo "🐳 Starting PostgreSQL with Docker Compose..."
    docker-compose up -d db
    sleep 3
    echo "✓ PostgreSQL started (waiting for health check...)"
    sleep 5
else
    echo "⚠️  Docker not found. Please start PostgreSQL manually:"
    echo "   createdb securepoll"
fi

# Run migrations
echo "📊 Running database migrations..."
alembic upgrade head
echo "✓ Migrations complete"

# Seed data
echo "🌱 Seeding sample data..."
python scripts/seed.py
echo "✓ Sample data seeded"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start development server:"
echo "     uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo ""
echo "  2. Visit API documentation:"
echo "     http://localhost:8000/docs"
echo ""
echo "  3. Login with:"
echo "     Email: admin@securepoll.rw"
echo "     Password: SecurePassword123!"
