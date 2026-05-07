#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "${SERVER_PID}" >/dev/null 2>&1; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

python3 -m http.server 8080 --bind 127.0.0.1 --directory . >/tmp/osint-local.log 2>&1 &
SERVER_PID=$!
sleep 1

curl -fsS http://127.0.0.1:8080/ >/dev/null
curl -fsS http://127.0.0.1:8080/robots.txt >/dev/null
curl -fsS http://127.0.0.1:8080/sitemap.xml >/dev/null

echo "Local static site is running on http://127.0.0.1:8080"
echo "Press Ctrl+C to stop"
wait "${SERVER_PID}"
