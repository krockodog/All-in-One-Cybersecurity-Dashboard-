#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-osint-for-all.live}"

html="$(curl -fsSL "https://${DOMAIN}" || true)"

if [[ -z "${html}" ]]; then
  printf '[provider] no html response from %s\n' "${DOMAIN}" >&2
  exit 1
fi

if printf '%s' "${html}" | rg -qi "membership has expired|temporarily unavailable|manus\.space"; then
  printf '[provider] domain currently points to a provider holding page (expired membership).\n'
  exit 2
fi

printf '[provider] no provider holding page markers found.\n'
