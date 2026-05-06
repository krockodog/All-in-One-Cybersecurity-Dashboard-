#!/bin/bash
set -euo pipefail

echo "Building OMNIUS images..."
docker-compose build backend frontend

echo "Launching OMNIUS services..."
docker-compose up -d

echo "Deployment complete."
echo "Frontend: http://localhost"
echo "Backend:  http://localhost:8080"
