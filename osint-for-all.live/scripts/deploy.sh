#!/usr/bin/env bash
set -euo pipefail

log() {
  local msg="${1}"
  printf '[deploy] %s\n' "${msg}"
}

require_cmd() {
  local cmd="${1}"
  command -v "${cmd}" >/dev/null 2>&1 || {
    log "Fehlt: ${cmd}"
    exit 1
  }
}

main() {
  require_cmd docker
  docker compose version >/dev/null 2>&1 || {
    log 'Docker Compose plugin fehlt.'
    exit 1
  }

  log 'Baue und starte Container...'
  docker compose up -d --build

  log 'Warte auf Service-Startup...'
  sleep 3

  log 'Lokaler Healthcheck...'
  curl -fsS http://127.0.0.1/ >/dev/null
  curl -fsS http://127.0.0.1/robots.txt >/dev/null

  log 'Deployment erfolgreich.'
}

main "$@"
