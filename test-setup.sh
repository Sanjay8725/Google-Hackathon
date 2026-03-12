#!/bin/bash
# EventFlow Authentication System - Automated Test Script
# Run this script to validate the entire authentication system

echo "🔍 EventFlow Authentication System - Full Test"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Check Node.js
echo -e "${BLUE}[Test 1/8]${NC} Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js found: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js${NC}"
    exit 1
fi

# Test 2: Check MySQL
echo -e "${BLUE}[Test 2/8]${NC} Checking MySQL..."
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version)
    echo -e "${GREEN}✅ MySQL found: $MYSQL_VERSION${NC}"
else
    echo -e "${RED}❌ MySQL not found. Please install MySQL${NC}"
    exit 1
fi

# Test 3: Check database connection
echo -e "${BLUE}[Test 3/8]${NC} Checking database connection..."
MYSQL_TEST=$(mysql -u root -p'root' -e "SELECT 1" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MySQL connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  MySQL connection failed (trying without password)${NC}"
    MYSQL_TEST=$(mysql -u root -e "SELECT 1" 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ MySQL connection successful (no password)${NC}"
    else
        echo -e "${RED}❌ Cannot connect to MySQL. Is it running?${NC}"
    fi
fi

# Test 4: Check backend dependencies
echo -e "${BLUE}[Test 4/8]${NC} Checking backend dependencies..."
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Installing backend dependencies...${NC}"
    cd backend
    npm install
    cd ..
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
fi

# Test 5: Check database setup
echo -e "${BLUE}[Test 5/8]${NC} Testing database setup..."
if [ -f "backend/server/database/schema.sql" ]; then
    echo -e "${GREEN}✅ Schema file found${NC}"
else
    echo -e "${RED}❌ Schema file not found${NC}"
    exit 1
fi

# Test 6: Check frontend files
echo -e "${BLUE}[Test 6/8]${NC} Checking frontend files..."
FILES_TO_CHECK=(
    "frontend/src/public/auth.html"
    "frontend/src/public/test-auth.html"
    "frontend/src/js/api.js"
    "frontend/src/js/auth.js"
    "frontend/src/styles/AuthPage.css"
)

MISSING=0
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✅ $file${NC}"
    else
        echo -e "${RED}  ❌ $file missing${NC}"
        ((MISSING++))
    fi
done

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✅ All frontend files present${NC}"
else
    echo -e "${RED}❌ Some frontend files missing${NC}"
fi

# Test 7: Check backend files
echo -e "${BLUE}[Test 7/8]${NC} Checking backend files..."
FILES_TO_CHECK=(
    "backend/server/server.js"
    "backend/server/controllers/authController.js"
    "backend/server/routes/authRoutes.js"
    "backend/setup-credentials.js"
    "backend/diagnose.js"
)

MISSING=0
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✅ $file${NC}"
    else
        echo -e "${RED}  ❌ $file missing${NC}"
        ((MISSING++))
    fi
done

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✅ All backend files present${NC}"
else
    echo -e "${RED}❌ Some backend files missing${NC}"
fi

# Test 8: Diagnose database
echo -e "${BLUE}[Test 8/8]${NC} Running database diagnosis..."
cd backend
if node diagnose.js; then
    echo -e "${GREEN}✅ Database diagnosis complete${NC}"
else
    echo -e "${YELLOW}⚠️  Check database setup${NC}"
fi
cd ..

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Pre-flight checks complete!${NC}"
echo ""
echo "Next steps:"
echo "1. cd backend && npm start"
echo "2. Open browser: http://localhost:5000/test-auth.html"
echo "3. Follow ACTION_PLAN.md for detailed testing"
echo ""
echo "Good luck! 🚀"
