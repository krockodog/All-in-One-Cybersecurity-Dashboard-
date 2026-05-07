#!/usr/bin/env bash
set -euo pipefail

SERVER_IP="${1:-${SERVER_IP:-}}"
SSH_PORT="${2:-22}"

require_cmd() {
  local cmd="${1}"
  command -v "${cmd}" >/dev/null 2>&1 || {
    printf '[access] missing command: %s\n' "${cmd}" >&2
    exit 1
  }
}

is_reserved_doc_ip() {
  local ip="${1}"
  [[ "${ip}" =~ ^203\.0\.113\.[0-9]{1,3}$ ]] || [[ "${ip}" =~ ^198\.51\.100\.[0-9]{1,3}$ ]] || [[ "${ip}" =~ ^192\.0\.2\.[0-9]{1,3}$ ]]
}

main() {
  require_cmd nc
  require_cmd curl

  if [[ -z "${SERVER_IP}" ]]; then
    printf '[access] missing SERVER_IP. Pass as arg: ./scripts/check-server-access.sh <REAL_SERVER_IP> 22\n' >&2
    exit 1
  fi

  if is_reserved_doc_ip "${SERVER_IP}"; then
    printf '[access] %s is a documentation/test IP and NOT routable on the internet.\n' "${SERVER_IP}" >&2
    printf '[access] Use your real VPS public IPv4 from the hosting provider dashboard.\n' >&2
    exit 1
  fi

  printf '[access] checking HTTP reachability for %s\n' "${SERVER_IP}"
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
}

main "$@"
