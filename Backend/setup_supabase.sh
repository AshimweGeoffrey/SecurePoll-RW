#!/bin/bash

# ============================================================
# SecurePoll Supabase Setup Script
# ============================================================
# This script automates Supabase database setup for SecurePoll
# 
# Usage: bash setup_supabase.sh
# 
# What it does:
# 1. Checks Python is installed
# 2. Installs dependencies
# 3. Prompts for Supabase connection details
# 4. Creates .env file with strong random secrets
# 5. Runs database migrations
# 6. Seeds sample data
# 7. Tests the connection
#
# ============================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Header
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║      SecurePoll Supabase Database Setup Script         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================
# 1. Check Python
# ============================================================
echo -e "\n${BLUE}[1/6]${NC} Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.11+${NC}"
    exit 1
fi
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✓ Python ${python_version} found${NC}"

# ============================================================
# 2. Check pip
# ============================================================
echo -e "\n${BLUE}[2/6]${NC} Checking pip..."
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}❌ pip3 not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ pip3 found${NC}"

# ============================================================
# 3. Install dependencies
# ============================================================
echo -e "\n${BLUE}[3/6]${NC} Installing Python dependencies..."
echo "This may take a minute..."
if pip3 install -e . > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# ============================================================
# 4. Generate random secrets
# ============================================================
echo -e "\n${BLUE}[4/6]${NC} Generating random secrets..."

JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
TEMPLATE_AES_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")

echo -e "${GREEN}✓ Generated JWT_SECRET${NC}"
echo -e "${GREEN}✓ Generated TEMPLATE_AES_KEY${NC}"

# ============================================================
# 5. Prompt for Supabase connection details
# ============================================================
echo -e "\n${BLUE}[5/6]${NC} Supabase Configuration"
echo -e "${YELLOW}"
echo "To find your Supabase connection string:"
echo "  1. Go to https://app.supabase.com"
echo "  2. Select your project"
echo "  3. Settings > Database > Connection String"
echo "  4. Copy the 'URI' connection string"
echo -e "${NC}"

# Prompt for DATABASE_URL with validation
while true; do
    read -p "Paste your Supabase DATABASE_URL: " DATABASE_URL
    
    # Validate it looks like a valid Postgres URI
    if [[ $DATABASE_URL == postgresql://* ]] && [[ $DATABASE_URL == *supabase.co* ]]; then
        echo -e "${GREEN}✓ Valid Supabase connection string${NC}"
        break
    else
        echo -e "${RED}❌ Invalid connection string. Must start with 'postgresql://' and contain 'supabase.co'${NC}"
    fi
done

# ============================================================
# 6. Create .env file
# ============================================================
echo -e "\n${BLUE}[6/6]${NC} Creating .env file..."

cat > .env << EOF
# ============================================================
# Database (Supabase)
# ============================================================
DATABASE_URL=${DATABASE_URL}

# ============================================================
# Authentication
# ============================================================
JWT_SECRET=${JWT_SECRET}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_MINUTES=30

# ============================================================
# Encryption
# ============================================================
TEMPLATE_AES_KEY=${TEMPLATE_AES_KEY}

# ============================================================
# Biometric Thresholds
# ============================================================
FACE_MATCH_THRESHOLD=0.80
REVIEW_FLOOR=0.60
DEDUP_THRESHOLD=0.85

# ============================================================
# ML/AI
# ============================================================
FAISS_INDEX_PATH=ml/faiss/index.bin

# ============================================================
# Server
# ============================================================
DEBUG=False
EOF

echo -e "${GREEN}✓ Created .env file${NC}"

# ============================================================
# 7. Run migrations
# ============================================================
echo -e "\n${BLUE}🗄️  Running database migrations...${NC}"
if alembic upgrade head 2>&1 | tee migration.log; then
    echo -e "${GREEN}✓ Migrations completed${NC}"
else
    echo -e "${RED}❌ Migration failed. Check migration.log${NC}"
    exit 1
fi

# ============================================================
# 8. Seed sample data
# ============================================================
echo -e "\n${BLUE}🌱 Seeding sample data...${NC}"
if python scripts/seed.py > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Sample data loaded${NC}"
else
    echo -e "${YELLOW}⚠️  Seed script failed (optional, can retry manually)${NC}"
fi

# ============================================================
# 9. Test connection
# ============================================================
echo -e "\n${BLUE}🔌 Testing database connection...${NC}"

python3 << 'PYTHON_TEST'
try:
    from app.core.config import settings
    import sqlalchemy as sa
    
    engine = sa.create_engine(settings.database_url)
    with engine.connect() as conn:
        result = conn.execute(sa.text('SELECT COUNT(*) FROM voters'))
        count = result.scalar()
        print(f"✓ Connected to Supabase! Found {count} voters in database")
except Exception as e:
    print(f"❌ Connection test failed: {e}")
    exit(1)
PYTHON_TEST

# ============================================================
# Success!
# ============================================================
echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║            ✅ Setup Complete!                          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "\n${GREEN}Next steps:${NC}"
echo ""
echo "1️⃣  Start the API server:"
echo -e "   ${BLUE}uvicorn app.main:app --reload${NC}"
echo ""
echo "2️⃣  Access the API:"
echo -e "   Swagger UI:  ${BLUE}http://localhost:8000/docs${NC}"
echo -e "   Health:      ${BLUE}http://localhost:8000/health${NC}"
echo ""
echo "3️⃣  View your database:"
echo -e "   ${BLUE}https://app.supabase.com${NC} > Your Project > SQL Editor"
echo ""

echo -e "${YELLOW}📝 .env file created with:${NC}"
echo "   DATABASE_URL: ✓"
echo "   JWT_SECRET: ✓ (random, 32+ chars)"
echo "   TEMPLATE_AES_KEY: ✓ (random, 64 hex chars)"
echo "   All other settings: ✓"
echo ""

echo -e "${GREEN}🎉 SecurePoll is ready!${NC}"
echo ""
