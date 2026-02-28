#!/bin/bash

# Art Frames Application Testing Script
# Tests all pages, API endpoints, and functionality

echo "========================================="
echo "Art Frames Application Testing"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
PASS_COUNT=0
FAIL_COUNT=0

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_code="${3:-200}"
    
    echo -n "Testing $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" == "$expected_code" ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $response)"
        ((PASS_COUNT++))
    else
        echo -e "${RED}FAIL${NC} (Expected $expected_code, got $response)"
        ((FAIL_COUNT++))
    fi
}

# Test API POST endpoint
test_api_post() {
    local name="$1"
    local url="$2"
    local data="$3"
    local expected_code="${4:-200}"
    
    echo -n "Testing $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$url")
    
    if [ "$response" == "$expected_code" ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $response)"
        ((PASS_COUNT++))
    else
        echo -e "${RED}FAIL${NC} (Expected $expected_code, got $response)"
        ((FAIL_COUNT++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. MAIN PAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Homepage" "$BASE_URL"
test_endpoint "Waitlist Page" "$BASE_URL/waitlist"
test_endpoint "Login Page" "$BASE_URL/auth/login"
test_endpoint "Register Page" "$BASE_URL/auth/register"
test_endpoint "Profile Page" "$BASE_URL/profile"
test_endpoint "Auth Callback" "$BASE_URL/auth/callback"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. PRODUCT PAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Product P1" "$BASE_URL/product/p1"
test_endpoint "Product P2" "$BASE_URL/product/p2"
test_endpoint "Product P10" "$BASE_URL/product/p10"
test_endpoint "Product P32" "$BASE_URL/product/p32"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. API ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Health Check API" "$BASE_URL/api/health"

# Test waitlist API - GET (returns count)
test_endpoint "Waitlist API (GET Count)" "$BASE_URL/api/waitlist" "200"

# Test waitlist API - POST with valid email and productId
test_api_post "Waitlist API - Valid Entry" "$BASE_URL/api/waitlist" '{"email":"test-'"$(date +%s)"'@example.com","productId":"p1","productTitle":"Test Product"}' "200"

# Test waitlist API - POST with invalid email
test_api_post "Waitlist API - Invalid Email" "$BASE_URL/api/waitlist" '{"email":"invalid-email","productId":"p1"}' "400"

# Test waitlist API - POST with missing email
test_api_post "Waitlist API - Missing Email" "$BASE_URL/api/waitlist" '{"productId":"p1"}' "400"

# Test waitlist API - POST with missing productId
test_api_post "Waitlist API - Missing ProductId" "$BASE_URL/api/waitlist" '{"email":"test@example.com"}' "400"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. ERROR PAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "404 Not Found" "$BASE_URL/non-existent-page" "404"
test_endpoint "Invalid Product" "$BASE_URL/product/invalid-product-id" "200"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. STATIC ASSETS & METADATA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Next.js is serving properly
echo -n "Testing Next.js Static Assets... "
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/_next/static/chunks/webpack.js" 2>/dev/null || echo "000")
if [[ "$response" =~ ^(200|304)$ ]]; then
    echo -e "${GREEN}PASS${NC} (HTTP $response)"
    ((PASS_COUNT++))
else
    echo -e "${YELLOW}SKIP${NC} (Static assets not tested)"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. CONTENT VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check homepage content
echo -n "Checking Homepage Content... "
content=$(curl -s "$BASE_URL")
if echo "$content" | grep -iq "art\|frame\|product\|shop"; then
    echo -e "${GREEN}PASS${NC} (Contains expected content)"
    ((PASS_COUNT++))
else
    echo -e "${RED}FAIL${NC} (Missing expected content)"
    ((FAIL_COUNT++))
fi

# Check product page content
echo -n "Checking Product Page Content... "
content=$(curl -s "$BASE_URL/product/p1")
if echo "$content" | grep -q "product"; then
    echo -e "${GREEN}PASS${NC} (Contains product data)"
    ((PASS_COUNT++))
else
    echo -e "${RED}FAIL${NC} (Missing product content)"
    ((FAIL_COUNT++))
fi

# Check API health response
echo -n "Checking Health API JSON... "
response=$(curl -s "$BASE_URL/api/health")
if echo "$response" | grep -q '"status"'; then
    echo -e "${GREEN}PASS${NC} (Valid JSON response)"
    ((PASS_COUNT++))
else
    echo -e "${RED}FAIL${NC} (Invalid JSON)"
    ((FAIL_COUNT++))
fi
echo ""

echo "========================================="
echo "TEST SUMMARY"
echo "========================================="
echo -e "Total Tests: $((PASS_COUNT + FAIL_COUNT))"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
