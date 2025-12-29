#!/bin/bash
echo "🔍 Testing PoultryCo Setup..."
echo ""

# Test 1: API Server Running
echo "1. Testing API Server..."
if curl -s http://localhost:3002/v1/health > /dev/null 2>&1; then
  echo "   ✅ API server is running"
else
  echo "   ❌ API server is NOT running"
  echo "   Fix: cd apps/api && npm run dev"
  exit 1
fi

# Test 2: API OTP Endpoint
echo "2. Testing OTP Endpoint..."
RESPONSE=$(curl -s -X POST http://localhost:3002/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","channel":"email"}')

if echo "$RESPONSE" | grep -q "security token invalid"; then
  echo "   ❌ AWS credentials missing or invalid"
  echo "   Fix: Add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to apps/api/.env.local"
  exit 1
elif echo "$RESPONSE" | grep -q "success"; then
  echo "   ✅ OTP endpoint working"
else
  echo "   ⚠️  Response: $RESPONSE"
fi

# Test 3: Web App Running
echo "3. Testing Web App..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "   ✅ Web app is running"
else
  echo "   ❌ Web app is NOT running"
  echo "   Fix: cd apps/web && npm run dev"
  exit 1
fi

echo ""
echo "✅ All basic tests passed!"
echo "Next: Test OTP flow in browser at http://localhost:3000/login"
