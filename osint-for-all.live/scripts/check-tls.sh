#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-osint-for-all.live}"

require_cmd() {
  local cmd="${1}"
  command -v "${cmd}" >/dev/null 2>&1 || {
    printf '[tls] missing command: %s\n' "${cmd}" >&2
    exit 1
  }
}

require_cmd openssl
require_cmd curl

printf '[tls] testing TLS handshake for %s\n' "${DOMAIN}"
openssl s_client -connect "${DOMAIN}:443" -servername "${DOMAIN}" -tls1_2 < /dev/null 2>/tmp/tls_check_err.log | rg -n "Protocol|Cipher|Verify return code" || true

printf '\n[tls] checking HTTPS response\n'
curl -sSIk "https://${DOMAIN}/" || true

if rg -q "wrong version number|handshake failure|no shared cipher|alert" /tmp/tls_check_err.log; then
  printf '\n[tls] TLS error detected. Common fixes:\n'
  printf '1) Ensure port 443 is forwarded to Caddy container.\n'
  printf '2) Disable proxy/CDN SSL interception until origin TLS is healthy.\n'
  printf '3) Restart caddy and inspect logs: docker compose logs --tail=200\n'
  exit 1
fi

printf '\n[tls] handshake command finished.\n'
