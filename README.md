# All-in-One Cybersecurity Dashboard

Operatives Dashboard fuer OSINT, Reconnaissance und Pentesting mit Web-UI, Tool-Workflows und Reporting.

## Tech Stack
- Node.js 22+
- TypeScript
- React + Vite
- Express/tRPC Backend
- Drizzle ORM
- MySQL-kompatible Datenbank

## Projektstruktur
- `client/` UI-Komponenten und Seiten
- `server/` API-Router, Services, Tool-Integration
- `shared/` gemeinsame Typen/Konstanten
- `drizzle/` Datenbankschema und Migrationen

## Voraussetzungen
- Node.js `>=22`
- `pnpm`
- laufende Datenbank (MySQL/TiDB kompatibel)

## Setup
```bash
pnpm install
pnpm db:push
pnpm dev
```

Danach laeuft die App lokal (Standard: `http://localhost:5173` fuer Frontend/Vite).

## Wichtige Scripts
```bash
pnpm dev      # Dev-Server
pnpm build    # Produktions-Build
pnpm start    # Produktions-Start
pnpm test     # Tests
pnpm check    # TypeScript Check
pnpm format   # Prettier
pnpm db:push  # Drizzle generate + migrate
```

## Deployment
- Basis-Infos: `DEPLOYMENT.md`
- Docker-Dateien sind im Repo vorhanden (`Dockerfile`, `docker-compose.yml`).

## Weitere Doku
- `INSTALLATION_LOKAL.md`
- `WIKI.md`
- `TROUBLESHOOTING.md`
- `CONTRIBUTING.md`

## Sicherheitshinweis
Nur in autorisierten Umgebungen und mit expliziter Freigabe testen. Keine Scans oder Exploit-Workflows gegen Systeme ohne schriftliche Erlaubnis ausfuehren.
