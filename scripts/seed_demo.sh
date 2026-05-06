#!/bin/bash
set -euo pipefail

API_URL=${API_URL:-http://localhost:8080}
EMAIL=${ADMIN_EMAIL:-admin@omnius.local}
PASSWORD=${ADMIN_PASSWORD:-change_me_admin_password}

TOKEN=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | python3 -c "import json,sys;print(json.load(sys.stdin)['accessToken'])")

TARGET_ID=$(curl -s -X POST "$API_URL/api/v1/targets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Corp","type":"domain","value":"demo-target.local","tags":["demo","pentest"]}' | python3 -c "import json,sys;print(json.load(sys.stdin)['data']['id'])")

PENTEST_ID=$(curl -s -X POST "$API_URL/api/v1/pentests" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Demo Pentest\",\"mode\":\"agent\",\"targetIds\":[\"$TARGET_ID\"],\"toolIds\":[\"nmap\",\"nuclei\"]}" | python3 -c "import json,sys;print(json.load(sys.stdin)['data']['id'])")

curl -s -X POST "$API_URL/api/v1/pentests/$PENTEST_ID/authorize" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"agreeToTerms":true,"scope":["demo-target.local"],"scopeDocUrl":"https://docs.omnius.local/demo-authorization.pdf"}' >/dev/null

curl -s -X POST "$API_URL/api/v1/pentests/$PENTEST_ID/start" \
  -H "Authorization: Bearer $TOKEN" >/dev/null

echo "Demo data seeded. Pentest started: $PENTEST_ID"
