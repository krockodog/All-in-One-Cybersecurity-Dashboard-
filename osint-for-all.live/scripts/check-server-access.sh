#!/usr/bin/env bash
set -euo pipefail

SERVER_IP="${1:-${SERVER_IP:-203.0.113.10}}"
SSH_PORT="${2:-22}"

require_cmd() {
  local cmd="${1}"
  command -v "${cmd}" >/dev/null 2>&1 || {
    printf '[access] missing command: %s\n' "${cmd}" >&2
    exit 1
  }
}

require_cmd nc
require_cmd curl

printf '[access] checking ICMP/HTTP reachability for %s\n' "${SERVER_IP}"
curl -sS -m 5 "http://${SERVER_IP}" >/dev/null 2>&1 || true

printf '[access] checking SSH port %s on %s ...\n' "${SSH_PORT}" "${SERVER_IP}"
if nc -zvw5 "${SERVER_IP}" "${SSH_PORT}"; then
  printf '[access] SSH port reachable.\n'
else
  printf '[access] SSH port NOT reachable.\n' >&2
  printf '[access] Fix: open inbound TCP %s in cloud firewall + server firewall.\n' "${SSH_PORT}" >&2
  exit 1
fi

printf '[access] next: ssh -p %s <user>@%s\n' "${SSH_PORT}" "${SERVER_IP}"
