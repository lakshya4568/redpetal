#!/bin/bash

# RedPetal Backend Server Startup Script
# This script checks prerequisites and starts the backend server

set -e

echo "🌸 RedPetal Backend Startup"
echo "======================================"
echo ""

# Color codes for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "server/server.ts" ]; then
  echo -e "${RED}❌ Error: Must be run from the project root directory${NC}"
  echo "   Current directory: $(pwd)"
  exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please update .env with your database credentials${NC}"
    echo ""
  else
    echo -e "${RED}❌ Error: .env.example not found${NC}"
    exit 1
  fi
fi

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL..."
if pg_isready -q; then
  echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
  echo -e "${RED}❌ PostgreSQL is not running${NC}"
  echo "   Start it with: brew services start postgresql@14"
  echo "   Or: pg_ctl start"
  exit 1
fi

# Check if database exists
DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
echo ""
echo "🔍 Checking database '$DB_NAME'..."
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo -e "${GREEN}✅ Database '$DB_NAME' exists${NC}"
else
  echo -e "${YELLOW}⚠️  Database '$DB_NAME' not found. Creating...${NC}"
  createdb "$DB_NAME" || {
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
  }
  echo -e "${GREEN}✅ Database created${NC}"
fi

# Check if node_modules exists in server
echo ""
echo "🔍 Checking server dependencies..."
if [ ! -d "server/node_modules" ]; then
  echo -e "${YELLOW}⚠️  Server dependencies not installed. Installing...${NC}"
  cd server
  pnpm install || npm install
  cd ..
  echo -e "${GREEN}✅ Dependencies installed${NC}"
else
  echo -e "${GREEN}✅ Server dependencies installed${NC}"
fi

# All checks passed, start the server
echo ""
echo "======================================"
echo -e "${GREEN}🚀 Starting backend server...${NC}"
echo "======================================"
echo ""

cd server
pnpm run dev
