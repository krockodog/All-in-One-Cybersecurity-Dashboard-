#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-osint-for-all.live}"

printf '[diag] DNS entries for %s\n' "${DOMAIN}"
getent ahosts "${DOMAIN}" || true

printf '\n[diag] HTTPS status for %s\n' "${DOMAIN}"
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' "https://${DOMAIN}/" || true

printf '\n[diag] Headers\n'
curl -sSI "https://${DOMAIN}/" || true

printf '\n[diag] robots/sitemap/manifest\n'
for path in /robots.txt /sitemap.xml /site.webmanifest; do
  code="$(curl -sS -o /dev/null -w '%{http_code}' "https://${DOMAIN}${path}" || true)"
  printf '%s -> %s\n' "${path}" "${code}"
done
