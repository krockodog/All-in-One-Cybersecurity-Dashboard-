#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-osint-for-all.live}"
ATTEMPTS="${2:-5}"
SLEEP_SECONDS="${3:-8}"

require_cmd() {
  local cmd="${1}"
  command -v "${cmd}" >/dev/null 2>&1 || {
    printf '[go-live] missing command: %s\n' "${cmd}" >&2
    exit 1
  }
}

check_once() {
  local domain="${1}"
  local status_code
  local path
  local code

  printf '[go-live] checking DNS for %s...\n' "${domain}"
  if ! getent ahosts "${domain}" >/dev/null 2>&1; then
    printf '[go-live] DNS not resolving for %s\n' "${domain}" >&2
    return 1
  fi

  printf '[go-live] checking https://%s ...\n' "${domain}"
  status_code="$(curl -sS -o /dev/null -w '%{http_code}' "https://${domain}/")"
  if [[ "${status_code}" != "200" ]]; then
    printf '[go-live] expected 200, got %s\n' "${status_code}" >&2
    return 1
  fi

  for path in /robots.txt /sitemap.xml /site.webmanifest; do
    code="$(curl -sS -o /dev/null -w '%{http_code}' "https://${domain}${path}")"
    if [[ "${code}" != "200" ]]; then
      printf '[go-live] %s failed with HTTP %s\n' "${path}" "${code}" >&2
      return 1
    fi
    printf '[go-live] ok %s\n' "${path}"
  done

  printf '[go-live] %s is reachable and healthy.\n' "${domain}"
}

main() {
  local try

  require_cmd curl
  require_cmd getent

  for try in $(seq 1 "${ATTEMPTS}"); do
    printf '\n[go-live] attempt %s/%s\n' "${try}" "${ATTEMPTS}"
    if check_once "${DOMAIN}"; then
      return 0
    fi

    if [[ "${try}" -lt "${ATTEMPTS}" ]]; then
      printf '[go-live] retrying in %s seconds...\n' "${SLEEP_SECONDS}"
      sleep "${SLEEP_SECONDS}"
    fi
  done

  printf '[go-live] all attempts failed for %s\n' "${DOMAIN}" >&2
  exit 1
}

main "$@"
