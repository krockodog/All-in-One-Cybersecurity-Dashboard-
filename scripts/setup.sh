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

# Secret is read from the environment - never hardcode keys in this repo.
EMERGENT_LLM_KEY="${EMERGENT_LLM_KEY:?EMERGENT_LLM_KEY muss als Umgebungsvariable gesetzt sein}"

if grep -q "EMERGENT_LLM_KEY=" backend/.env; then
  # Escape characters that are special in the sed replacement (\, |, &)
  escaped_key=$(printf '%s' "$EMERGENT_LLM_KEY" | sed -e 's/[\\|&]/\\&/g')
  sed -i "s|EMERGENT_LLM_KEY=.*|EMERGENT_LLM_KEY=${escaped_key}|g" backend/.env
fi

docker-compose pull postgres neo4j redis minio clickhouse
docker-compose build backend frontend tools-recon tools-exploit tools-c2
docker-compose up -d

echo "OMNIUS stack is starting..."
echo "Frontend: http://localhost"
echo "Backend:  http://localhost:8080"
