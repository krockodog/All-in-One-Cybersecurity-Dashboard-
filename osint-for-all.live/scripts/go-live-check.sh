#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-osint-for-all.live}"

require_cmd() {
  local cmd="${1}"
  command -v "${cmd}" >/dev/null 2>&1 || {
    printf '[go-live] missing command: %s\n' "${cmd}" >&2
    exit 1
  }
}

require_cmd curl
require_cmd getent

printf '[go-live] checking DNS for %s...\n' "${DOMAIN}"
if ! getent ahosts "${DOMAIN}" >/dev/null 2>&1; then
  printf '[go-live] DNS not resolving for %s\n' "${DOMAIN}" >&2
  exit 1
fi

printf '[go-live] checking https://%s ...\n' "${DOMAIN}"
status_code="$(curl -sS -o /dev/null -w '%{http_code}' "https://${DOMAIN}/")"
if [[ "${status_code}" != "200" ]]; then
  printf '[go-live] expected 200, got %s\n' "${status_code}" >&2
  exit 1
fi

for path in /robots.txt /sitemap.xml /site.webmanifest; do
  code="$(curl -sS -o /dev/null -w '%{http_code}' "https://${DOMAIN}${path}")"
  if [[ "${code}" != "200" ]]; then
    printf '[go-live] %s failed with HTTP %s\n' "${path}" "${code}" >&2
    exit 1
  fi
  printf '[go-live] ok %s\n' "${path}"
done

printf '[go-live] %s is reachable and healthy.\n' "${DOMAIN}"
