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

if grep -q "EMERGENT_LLM_KEY=" backend/.env; then
  sed -i 's|EMERGENT_LLM_KEY=.*|EMERGENT_LLM_KEY=sk-emergent-b3315241431575d3dE|g' backend/.env
fi

docker-compose pull postgres neo4j redis minio clickhouse
docker-compose build backend frontend tools-recon tools-exploit tools-c2
docker-compose up -d

echo "OMNIUS stack is starting..."
echo "Frontend: http://localhost"
echo "Backend:  http://localhost:8080"
