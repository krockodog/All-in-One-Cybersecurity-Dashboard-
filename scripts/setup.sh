#!/bin/bash
set -euo pipefail

echo "=============================="
echo "  OMNIUS RED-Team Framework   "
echo "  Setup Script v1.0           "
echo "=============================="

command -v docker >/dev/null 2>&1 || { echo "Docker required"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose required"; exit 1; }

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
fi

# EMERGENT_LLM_KEY is an OPTIONAL fallback key (providers can use their own keys).
# It is read from the environment - never hardcode keys in this repo. If it is not
# set, an existing value in backend/.env is kept unchanged.
if [ -n "${EMERGENT_LLM_KEY:-}" ]; then
  export EMERGENT_LLM_KEY
  # awk reads the key via ENVIRON, so it never appears in any process argv
  # (/proc/<pid>/cmdline); the file is rewritten atomically with mode 600.
  tmp_env=$(mktemp backend/.env.XXXXXX)
  awk 'BEGIN { key = ENVIRON["EMERGENT_LLM_KEY"]; done = 0 }
       /^EMERGENT_LLM_KEY=/ { print "EMERGENT_LLM_KEY=" key; done = 1; next }
       { print }
       END { if (!done) print "EMERGENT_LLM_KEY=" key }' backend/.env > "$tmp_env"
  chmod 600 "$tmp_env"
  mv "$tmp_env" backend/.env
else
  echo "Hinweis: EMERGENT_LLM_KEY nicht gesetzt - vorhandener Wert in backend/.env bleibt unveraendert (optional)."
fi

docker-compose pull postgres neo4j redis minio clickhouse
docker-compose build backend frontend tools-recon tools-exploit tools-c2
docker-compose up -d

echo "OMNIUS stack is starting..."
echo "Frontend: http://localhost"
echo "Backend:  http://localhost:8080"
