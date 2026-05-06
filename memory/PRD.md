# OMNIUS RED-Team Dashboard — Phase 1 PRD

## Original Problem Statement (User)
Build a production-ready, self-hosted OMNIUS RED-Team dashboard framework with Go backend + React/TypeScript frontend, GraphQL + REST + WebSocket, Dockerized offensive security tool ecosystem (200+ tools), multi-LLM routing (OpenAI, Anthropic, Google, Ollama, OpenRouter), authorization gate, RBAC, risk scoring (NIST/CVSS/EPSS), plugin system, reporting, monitoring stack, and bilingual DE/EN UX.

## User Choices Captured
- Delivery mode: **Phased implementation**
- Phase-1 priorities: backend foundation + frontend foundation + docker infra + end-to-end slice
- Language: **Bilingual (DE/EN toggle from start)**
- LLM providers to wire first: **OpenAI + Anthropic + Google + Ollama + OpenRouter**
- Credential strategy: **Use Emergent universal key for OpenAI/Anthropic/Google where applicable**

## Architecture Decisions (Phase 1)
1. **Backend foundation (Go)**
   - Chi router with CORS, timeout, request logging, JWT auth middleware, RBAC middleware.
   - REST routes under `/api/v1` for targets, pentests, findings, plugins, settings, users.
   - GraphQL endpoint at `/graphql` and lightweight playground at `/playground`.
   - WebSocket live terminal endpoint `/ws/pentest/{id}`.
   - Authorization gate with terms confirmation, scope, document URL, 24h expiry, audit events, kill-switch callback.
   - In-memory store for Phase 1 to enable full flow without DB migration blockers.

2. **LLM routing foundation**
   - Provider interface + router with per-provider minimal rate-gap and failover order.
   - OpenAI/Anthropic/Google/Ollama/OpenRouter provider adapters via HTTP transport.
   - Cost tracking map by provider.
   - Universal key fallback support via `EMERGENT_LLM_KEY`.

3. **Frontend foundation (React 19 + TS + Tailwind + Vite)**
   - Route-based dashboard layout (Sidebar + TopBar + content).
   - Bilingual toggle (EN/DE) and theme toggle.
   - Core pages: Dashboard, Targets, Pentests, Findings, Risk Matrix, Plugins, Settings, Reports, Users.
   - End-to-end vertical slice: create target → create pentest → authorize → start/stop → live terminal stream.
   - React Query for REST data flow, Apollo client configured for GraphQL.
   - `data-testid` added throughout key interactive and user-visible elements.

4. **Infrastructure foundation**
   - `docker-compose.yml` expanded for postgres/pgvector, neo4j, redis, clickhouse, minio, nats, backend, frontend, tools containers, grafana/victoriametrics/loki/jaeger/langfuse.
   - Added tool container Dockerfiles for recon/exploit/c2.
   - Added nginx config, grafana datasource and starter dashboard JSON.

5. **Plugin foundation**
   - Added 16 YAML plugins (nuclei, nmap, metasploit, sliver, bloodhound, lynis, amass, sqlmap, crackmapexec, responder, mimikatz, peass, impacket, bloodyad, certipy, cobaltstrike).
   - Added Go registry with 200+ tool definitions grouped by category.

## What Was Implemented
- New Go backend module and runtime:
  - `backend/cmd/server/main.go`
  - `internal/auth/*`, `internal/models/*`, `internal/store/store.go`
  - REST handlers in `internal/api/rest/*`
  - GraphQL schema + resolver handler in `internal/api/graph/*`
  - WebSocket hub in `internal/ws/hub.go`
  - LLM router and providers in `internal/core/llm/*`
  - Tool registry in `pkg/tools/register.go`
  - `backend/.env.example`, `backend/Dockerfile`

- Runtime compatibility API for current environment:
  - `backend/server.py` FastAPI runtime adapter exposing `/api/v1` + `/ws` contracts
  - `backend/requirements.txt`

- New React frontend scaffold in `/app/frontend`:
  - app bootstrap (`main.tsx`, `App.tsx`, `index.css`)
  - contexts (auth/theme/locale), hooks, utils, types
  - layout + target manager + pentest wizard + findings/risk/settings/dashboard modules
  - GraphQL document files and types stub
  - config files (`package.json`, `tsconfig.json`, `vite.config.ts`, tailwind/postcss, Dockerfile, .env.example)

- Infra + ops files:
  - root `docker-compose.yml`
  - `docker/tools-*/Dockerfile`
  - `plugins/*.yaml`
  - `nginx.conf`
  - `grafana/datasources/prometheus.yaml`
  - `grafana/dashboards/omnius.json`
  - `scripts/setup.sh`, `scripts/deploy.sh`, `scripts/seed_demo.sh`

## Validation Status
- ✅ Frontend build validated: `pnpm build` succeeds in `/app/frontend`.
- ✅ Backend API contract test validated: `pytest -q /app/backend/tests/test_api_v1_contract.py` → **5 passed** with `REACT_APP_BACKEND_URL=http://localhost:8001`.
- ✅ Manual curl lifecycle verification passed: login, targets create, pentest authorize/start, risk-matrix 5x5, websocket HTTP-upgrade contract (426 on plain GET).
- ⚠️ Native Go compile step still not executable in this container (`go: command not found`).

## Prioritized Backlog

### P0 (must complete next)
1. Replace in-memory store with PostgreSQL/Neo4j/Redis persistence layers and migrations.
2. Upgrade GraphQL layer to full gqlgen schema-first generation with query/mutation/subscription parity.
3. Implement full authorization gate file upload to MinIO with 10MB PDF validation.
4. Integrate real sandbox execution engine (Docker SDK), tool run auditing, and strict network isolation.
5. Implement robust report generation (PDF/HTML/JSON) with templates and timelines.

### P1
1. Full AI-agent core (`orchestrator/planner/executor/analyst/verifier`) wired to MITRE ATT&CK phases.
2. CVSS 3.1 parser/generator + EPSS fetch/cache + NIST CSF weighted matrix engine.
3. Plugin manager lifecycle (load/unload/hot-reload/validation) from YAML registry.
4. Complete settings UX with secure secret refs and per-user provider testing.

### P2
1. Advanced visualizations (ReactFlow pipeline map, attack path graph, richer D3 risk interactions).
2. Full monitoring instrumentation and SLO dashboards.
3. Bulk import/export hardening and enterprise audit analytics.

## Next Tasks (Execution Order)
1. Implement database adapters + migrations and replace all in-memory CRUD calls.
2. Add gqlgen setup with generated types/resolvers and GraphQL subscriptions for live streams.
3. Add sandbox runtime and tool execution orchestration pipeline.
4. Add report engine + PDF generation and report download APIs.
5. Harden auth/session refresh flow and complete admin/user management workflows.

