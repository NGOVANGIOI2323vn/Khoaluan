#!/bin/bash

echo "🌍 Starting geocoding for all hotels..."
echo ""
echo "ℹ️  This script will:"
echo "   - Find all hotels WITHOUT latitude/longitude"
echo "   - Geocode their addresses using Google Maps API"
echo "   - Update the database with accurate coordinates"
echo "   - Skip hotels that already have coordinates"
echo ""

# Login as admin
echo "📝 Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}')

# Extract token (try different JSON parsing methods)
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', '') if isinstance(data.get('data'), dict) else '')" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    # Try alternative parsing (using -E for macOS compatibility)
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -oE '"token"\s*:\s*"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get admin token."
    echo "Response: $LOGIN_RESPONSE"
    echo ""
    echo "Please check:"
    echo "1. Backend is running on http://localhost:8081"
    echo "2. Admin credentials: username=admin, password=123456"
    echo "3. If password doesn't work, try restarting the backend to regenerate admin user"
    exit 1
fi

echo "✅ Got admin token"
echo ""
echo "🚀 Calling geocoding API..."

# Call geocoding API
RESPONSE=$(curl -s -X POST http://localhost:8081/api/geocoding/admin/geocode-all-hotels \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo ""
echo "📊 Geocoding Results:"
echo "===================="
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""
echo "✅ Done!"

