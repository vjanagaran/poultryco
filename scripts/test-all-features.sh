#!/bin/bash

# Comprehensive Testing Script for Web & Admin Apps
# Run this after starting all services

set -e

echo "🧪 PoultryCo Comprehensive Testing Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3002/v1}"
WEB_URL="${WEB_URL:-http://localhost:3000}"
ADMIN_URL="${ADMIN_URL:-http://localhost:3001}"

# Test counters
PASSED=0
FAILED=0
SKIPPED=0

# Helper functions
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=${3:-200}
    local data=$4
    
    local url="${API_URL}${endpoint}"
    local response
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url" || echo "000")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" || echo "000")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT "$url" \
            -H "Content-Type: application/json" \
            -d "$data" || echo "000")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$url" || echo "000")
    fi
    
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ] || [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
        echo -e "${GREEN}✅${NC} $method $endpoint (Status: $status_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $method $endpoint (Status: $status_code)"
        echo "   Response: $body"
        ((FAILED++))
        return 1
    fi
}

test_app_running() {
    local url=$1
    local name=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} $name is running at $url"
        return 0
    else
        echo -e "${RED}❌${NC} $name is NOT running at $url"
        return 1
    fi
}

# ============================================
# 1. CHECK SERVICES ARE RUNNING
# ============================================
echo "1. Checking Services..."
echo "----------------------"

if ! test_app_running "$API_URL/health" "API Server"; then
    echo -e "${YELLOW}⚠️  API server not running. Start it with: cd apps/api && npm run dev${NC}"
    echo ""
fi

if ! test_app_running "$WEB_URL" "Web App"; then
    echo -e "${YELLOW}⚠️  Web app not running. Start it with: cd apps/web && npm run dev${NC}"
    echo ""
fi

if ! test_app_running "$ADMIN_URL" "Admin App"; then
    echo -e "${YELLOW}⚠️  Admin app not running. Start it with: cd apps/admin && npm run dev${NC}"
    echo ""
fi

echo ""

# ============================================
# 2. TEST API ENDPOINTS
# ============================================
echo "2. Testing API Endpoints..."
echo "---------------------------"

# Health check
test_endpoint "GET" "/health" 200

# Users API
echo ""
echo "  Users API:"
test_endpoint "GET" "/users/search?q=test&limit=10" 200
test_endpoint "GET" "/users/stats" 200 || echo -e "${YELLOW}⚠️  Requires authentication${NC}"

# Businesses API
echo ""
echo "  Businesses API:"
test_endpoint "GET" "/businesses/search?q=test&limit=10" 200

# Organizations API
echo ""
echo "  Organizations API:"
test_endpoint "GET" "/organizations/search?q=test&limit=10" 200

# Events API
echo ""
echo "  Events API:"
test_endpoint "GET" "/events/search?q=test&limit=10" 200

# Jobs API
echo ""
echo "  Jobs API:"
test_endpoint "GET" "/jobs/search?q=test&limit=10" 200

# Marketplace API
echo ""
echo "  Marketplace API:"
test_endpoint "GET" "/marketplace/products/search?q=test&limit=10" 200
test_endpoint "GET" "/marketplace/categories" 200

# NECC API
echo ""
echo "  NECC API:"
test_endpoint "GET" "/necc/zones" 200
test_endpoint "GET" "/necc/prices/today" 200 || echo -e "${YELLOW}⚠️  May require data${NC}"

# Discovery API
echo ""
echo "  Discovery API:"
test_endpoint "GET" "/discovery/members?q=test&limit=10" 200 || echo -e "${YELLOW}⚠️  Endpoint may not exist${NC}"

echo ""

# ============================================
# 3. TEST WEB APP PAGES
# ============================================
echo "3. Testing Web App Pages..."
echo "----------------------------"

test_web_page() {
    local path=$1
    local name=$2
    
    if curl -s -f "${WEB_URL}${path}" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} $name ($path)"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $name ($path)"
        ((FAILED++))
    fi
}

test_web_page "/" "Homepage"
test_web_page "/blog" "Blog Listing"
test_web_page "/necc" "NECC Dashboard"
test_web_page "/about" "About Page"
test_web_page "/contact" "Contact Page"

echo ""

# ============================================
# 4. TEST ADMIN APP PAGES
# ============================================
echo "4. Testing Admin App Pages..."
echo "------------------------------"

test_admin_page() {
    local path=$1
    local name=$2
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" "${ADMIN_URL}${path}")
    
    if [ "$status" = "200" ] || [ "$status" = "302" ] || [ "$status" = "401" ]; then
        # 401 is expected for protected routes without auth
        echo -e "${GREEN}✅${NC} $name ($path) - Status: $status"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $name ($path) - Status: $status"
        ((FAILED++))
    fi
}

test_admin_page "/" "Admin Dashboard"
test_admin_page "/login" "Admin Login"
test_admin_page "/blog" "Blog Management"
test_admin_page "/necc" "NECC Dashboard"

echo ""

# ============================================
# 5. SUMMARY
# ============================================
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo -e "${YELLOW}Skipped:${NC} $SKIPPED"
echo ""

TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    PASS_RATE=$((PASSED * 100 / TOTAL))
    echo "Pass Rate: ${PASS_RATE}%"
fi

echo ""
echo "📝 For detailed manual testing, see: docs/testing/COMPREHENSIVE_TEST_PLAN.md"
echo ""

if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi

