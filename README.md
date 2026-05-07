# OSINT Dashboard — All-in-One Cybersecurity Operations Platform

[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](https://github.com/krockodog/All-in-One-Cybersecurity-Dashboard-)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=nodedotjs)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://mysql.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> **Ein selbst hostbares, production-ready Cybersecurity-Dashboard für autorisierte Pentester, OSINT-Analysten und Compliance-Teams.**

---

## 🎯 Vision

Das **OSINT Dashboard** vereint Open Source Intelligence, Penetration Testing, automatisierte Reconnaissance und Compliance-Reporting in einer einzigen, integrierten Plattform.

Statt zwischen Dutzenden Tools, Terminal-Fenstern und Browser-Tabs zu wechseln, bietet das Dashboard einen **zentralisierten Arbeitsbereich** für den gesamten Security-Lifecycle — von der Zieldefinition über die autorisierte Durchführung bis hin zur dokumentierten Ergebnisübergabe.

**Kernprinzipien:**
- 🔒 **Autorisierung zuerst** — Kein Scan ohne definierten Scope und ausdrückliche Freigabe
- 🤖 **KI-gestützte Planung** — LLM-gesteuerte Tool-Auswahl mit Begründung und Konfidenz-Scoring
- 📊 **Compliance-Integration** — Direkte ISO 27001 Mapping, Risiko-Matrizen und audit-sichere Reports
- 🌐 **Self-Hosted** — Volle Datenhoheit, keine Abhängigkeit von SaaS-Plattformen

---

## ✨ Was das Tool macht

### 1. Unified Security Workflow
Orchestriere den kompletten Pentest-Lifecycle in einer Anwendung:

```
Zieldefinition → Autorisierung → KI-Planung → Live-Ausführung → Analyse → Reporting
```

### 2. Integrierte Tool-Plattform
**134+ Security-Tools** aus 6 Kategorien, direkt ansteuerbar:

| Kategorie | Beispiel-Tools |
|-----------|----------------|
| 🔍 **OSINT** | Amass, Shodan, Sherlock, SpiderFoot, theHarvester |
| 🌐 **Reconnaissance** | Nmap, Subfinder, MassDNS, dnsrecon |
| ⚔️ **Pentest** | Nuclei, SQLMap, Metasploit, Burp Suite, Nikto |
| ☁️ **Cloud Security** | ScoutSuite, Prowler, Steampipe |
| 🧬 **Forensics** | Volatility, Autopsy, Plaso |
| 🛠️ **Binary Analysis** | Ghidra, Radare2, Binwalk |

### 3. KI-Assistent & Agent-Orchestrierung
- **Natürlichsprachliche Steuerung** — "Scanne example.com auf OWASP Top 10"
- **Multi-Provider LLM-Routing** — OpenAI, Anthropic, Google, Ollama, OpenRouter mit Failover
- **Agent-Pipeline** — Planner → Executor → Analyst → Verifier, mapped auf MITRE ATT&CK Phasen
- **Smart Tool Selection** — Automatische Tool-Auswahl mit Confidence-Score und Begründung

### 4. ISO 27001 Compliance Framework
- **114 Annex A Controls** (A.5–A.18) mit vollständigem Mapping
- **Risiko-Matrix** (5×5) mit NIST/CVSS/EPSS-Gewichtung
- **Gap-Analyse** — Automatische Identifikation von Kontrollschwächen
- **SoA-Generierung** — Statement of Applicability mit Begründungen
- **Multi-Format Export** — PDF, Excel, HTML, JSON

### 5. Live Execution & Monitoring
- **Echtzeit-Streaming** von Tool-Output via WebSockets
- **Status-Tracking** — Running, Completed, Failed mit Auto-Retry
- **Ressourcen-Monitoring** — CPU, Memory, Network pro Ausführung
- **Session-Terminals** — Interaktive Konsolen für laufende Scans

### 6. Threat Intelligence
- **CVE-Lookup** — National Vulnerability Database Integration
- **Exploit-DB** — Bekannte Exploits und Proof-of-Concepts
- **CISA KEV** — Known Exploited Vulnerabilities Tracking
- **CVSS v3.1 Scoring** mit vollständigen Vector Strings

### 7. Erweitertes Reporting
- **Finding Enrichment** — Deduplizierung, Attack-Path Mapping, Remediation-Priorisierung
- **Investigation Snapshots** — Reproduzierbare Assessment-Zustände
- **Vergleichsansichten** — Tracking von Remediation-Fortschritt über Zeit
- **Exporte**: JSON, HTML, CSV, PDF (pdf-lib), Excel (xlsx), DOCX

### 8. Security & Governance
- **RBAC** — Admin, Pentester, Client Rollen
- **Audit-Logging** — Vollständige Nachvollziehbarkeit aller Aktionen
- **Scope-Validation** — Harte Grenzen für autorisierte Systeme
- **MFA-Unterstützung** & Session-Management

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React 19 + Vite)                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐    │
│  │  Dashboard   │ │  Pentest     │ │  ISO 27001           │    │
│  │  Widgets     │ │  Workflows   │ │  Compliance Center   │    │
│  └──────────────┘ └──────────────┘ └──────────────────────┘    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐    │
│  │  KI-Chat     │ │  Threat      │ │  Security Center     │    │
│  │  Assistant   │ │  Intelligence│ │  (RBAC / Audit)      │    │
│  └──────────────┘ └──────────────┘ └──────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │ tRPC + WebSocket
┌────────────────────────────┴────────────────────────────────────┐
│              Backend (Node.js + Express + tRPC)                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐    │
│  │  Pentest     │ │  Agent       │ │  ISO 27001 Service   │    │
│  │  Router      │ │  Orchestrator│ │  (Risk / SoA / Gap)  │    │
│  └──────────────┘ └──────────────┘ └──────────────────────┘    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐    │
│  │  Threat      │ │  Exports     │ │  LLM Router          │    │
│  │  Intel       │ │  (PDF/XLSX)  │ │  (Multi-Provider)    │    │
│  └──────────────┘ └──────────────┘ └──────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │ Drizzle ORM
┌────────────────────────────┴────────────────────────────────────┐
│                   Database (MySQL 8.0)                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐    │
│  │  Users       │ │  Engagements │ │  Findings            │    │
│  │  Sessions    │ │  Executions  │ │  Reports / Snapshots │    │
│  └──────────────┘ └──────────────┘ └──────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Schicht | Technologie |
|---------|-------------|
| **Frontend** | React 19, TypeScript 5.6, Vite, Tailwind CSS 4, Radix UI, tRPC Client, Socket.IO |
| **Backend** | Node.js 22, Express, tRPC 11, Zod, Drizzle ORM, Socket.IO |
| **Datenbank** | MySQL 8.0 (oder TiDB-kompatibel) |
| **AI/LLM** | OpenAI, Anthropic, Google, Ollama, OpenRouter Adapter mit Failover |
| **Reporting** | pdf-lib, xlsx, docx |
| **Deployment** | Docker, Docker Compose, Caddy (SSL), Nginx (alternative) |
| **Monitoring** | Grafana, VictoriaMetrics, Loki (optional) |

---

## 🚀 Installation

### Option A: Lokale Entwicklung (Node.js + MySQL)

#### Voraussetzungen
- [Node.js 22+](https://nodejs.org)
- [pnpm](https://pnpm.io)
- [MySQL 8.0+](https://mysql.com) (oder Docker für die DB)

#### Schritt-für-Schritt

```bash
# 1. Repository klonen
git clone https://github.com/krockodog/All-in-One-Cybersecurity-Dashboard-.git
cd All-in-One-Cybersecurity-Dashboard-

# 2. Dependencies installieren
pnpm install

# 3. Umgebungsvariablen konfigurieren
cp .env.example .env
# → Bearbeite .env und setze mindestens:
#   - DATABASE_URL (z. B. mysql://osint:changeme@localhost:3306/osint_dashboard)
#   - JWT_SECRET (mind. 32 zufällige Zeichen)

# 4. Datenbank-Migrationen ausführen
pnpm db:push

# 5. Development-Server starten
pnpm dev
```

Die App ist dann unter `http://localhost:5173` erreichbar.  
Das Backend läuft auf `http://localhost:3000`.

#### Produktions-Build lokal testen
```bash
pnpm build
pnpm start
```

---

### Option B: Docker Compose (Empfohlen für Quick Start)

#### Voraussetzungen
- [Docker](https://docker.com)
- [Docker Compose](https://docs.docker.com/compose/)

#### Schritt-für-Schritt

```bash
# 1. Repository klonen
git clone https://github.com/krockodog/All-in-One-Cybersecurity-Dashboard-.git
cd All-in-One-Cybersecurity-Dashboard-

# 2. Umgebungsvariablen konfigurieren
cp .env.example .env
# → Bearbeite .env:
#   JWT_SECRET=dein-sehr-langes-zufälliges-geheimnis-mindestens-32-zeichen
#   (Datenbank-Passwörter werden automatisch aus .env übernommen)

# 3. Lokale Stack starten (App + MySQL)
docker compose -f docker-compose.local.yml up -d

# 4. Logs verfolgen
docker logs -f osint-app
```

| Dienst | URL / Port |
|--------|-----------|
| Dashboard | http://localhost:3001 |
| MySQL | localhost:3308 (für externe Tools) |

#### Stack stoppen
```bash
docker compose -f docker-compose.local.yml down
# Datenbank persistent halten:
docker compose -f docker-compose.local.yml down -v
```

---

### Option C: VPS / Produktions-Deployment

Für ein vollständiges Produktions-Setup mit eigener Domain und SSL-Zertifikat.

#### Voraussetzungen
- VPS mit Ubuntu 22.04+ (z. B. DigitalOcean, Hetzner, AWS)
- Domain (z. B. `osint-for-all.live`)
- Docker & Docker Compose Plugin

#### Automatisches Setup (empfohlen)

```bash
# Auf dem VPS als root ausführen:
curl -fsSL https://raw.githubusercontent.com/krockodog/All-in-One-Cybersecurity-Dashboard-/main/scripts/setup-vps.sh | sudo bash
```

Das Script installiert Docker, klont das Repository, erstellt die Verzeichnisstruktur und die `.env` Datei.

#### Manuelles Setup

```bash
# 1. Auf dem VPS einloggen
ssh root@deine-server-ip

# 2. Repository klonen
git clone https://github.com/krockodog/All-in-One-Cybersecurity-Dashboard-.git /opt/osint-dashboard
cd /opt/osint-dashboard

# 3. .env anpassen (siehe .env.example)
nano .env

# 4. Produktions-Stack starten
docker compose -f docker-compose.prod.yml up -d
```

#### SSL / Reverse Proxy

Das Produktions-Setup verwendet **Caddy** (automatisches Let's Encrypt) oder optional **Nginx** mit Certbot:

```bash
# Caddy (Standard)
docker compose -f docker-compose.prod.yml up -d caddy app db

# Nginx + Certbot (Alternative)
# → Siehe nginx/sites/osint-for-all.live.conf
```

---

### Option D: Vollständiger OMNIUS Stack (Development)

Für Entwicklung des gesamten Ökosystems inkl. Go-Backend, Neo4j, Redis, ClickHouse und Monitoring:

```bash
./scripts/setup.sh
```

Startet:
- Node.js App + Go Backend
- PostgreSQL, Neo4j, Redis, ClickHouse, MinIO, NATS
- Security Tool Container (`tools-recon`, `tools-exploit`)
- Monitoring: Grafana, VictoriaMetrics, Loki, Jaeger

---

## ⚙️ Konfiguration

### Wichtige Umgebungsvariablen

Erstelle eine `.env` Datei im Projektroot:

```env
# ============================================
# Basis-Konfiguration
# ============================================
NODE_ENV=production
PORT=3000

# Datenbank (MySQL)
DATABASE_URL=mysql://osint:changeme@db:3306/osint_dashboard

# JWT Secret (mind. 32 Zeichen!)
JWT_SECRET=dein-super-geheimes-jwt-secret-hier-einfuegen

# App ID
VITE_APP_ID=osint-dashboard-prod

# OAuth (optional)
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=

# Owner
OWNER_OPEN_ID=
OWNER_NAME=Admin

# KI-Provider (optional)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
VITE_FRONTEND_FORGE_API_KEY=

# MySQL Docker (nur für docker-compose)
MYSQL_ROOT_PASSWORD=changeme-mysql-root
MYSQL_DATABASE=osint_dashboard
MYSQL_USER=osint
MYSQL_PASSWORD=changeme
```

### KI-Provider einrichten

Nach dem ersten Start:
1. Einloggen und zu **Einstellungen → KI-Assistenten** navigieren
2. API-Keys für gewünschte Provider hinterlegen:
   - OpenAI (GPT-4, GPT-4o)
   - Anthropic (Claude 3.5)
   - Google (Gemini)
   - DeepSeek
   - Ollama (lokale Modelle)
   - OpenRouter (Aggregation)

---

## 🧪 Entwicklung

```bash
# Unit Tests
pnpm test

# Integration Tests
pnpm test:integration

# E2E Tests
pnpm test:e2e

# Datenbank-Schema aktualisieren
pnpm db:generate
pnpm db:push

# Linting
pnpm lint
```

---

## 📁 Projektstruktur

```
All-in-One-Cybersecurity-Dashboard-
├── client/                 # React Frontend (Haupt-App)
│   ├── src/pages/          # Seiten: Dashboard, Pentest, ISO27001, KI-Chat, ...
│   ├── src/components/     # UI-Komponenten
│   └── src/lib/            # Utilities, Tool-Katalog (134+ Tools)
├── server/                 # Node.js Backend (tRPC + Express)
│   ├── routers/            # 22+ tRPC Router (pentest, iso27001, aiChat, ...)
│   ├── services/           # Business-Logik (Agent Orchestrator, ISO Reports)
│   └── _core/              # Auth, LLM-Client, Notifications
├── backend/                # Go Backend + Python FastAPI (optional/legacy)
├── drizzle/                # Datenbank-Schema & Migrationen (MySQL)
├── plugins/                # YAML-Plugin-Definitionen (16 Security Tools)
├── docker/                 # Dockerfiles für Security Tool Container
├── scripts/                # Deployment, Backup, Setup-Skripte
├── nginx/                  # Nginx-Konfiguration (Alternative zu Caddy)
├── grafana/                # Dashboards & Datasources
└── shared/                 # Geteilte TypeScript-Typen (Client ↔ Server)
```

---

## 🔐 Sicherheit & Compliance

- **Autorisierungs-Gate** — Jeder Pentest erfordert definierten Scope und ausdrückliche Freigabe
- **Scope-Validation** — Harte Prüfung gegen autorisierte Systeme vor Tool-Ausführung
- **Audit-Trail** — Jede Aktion wird protokolliert (Wer, Was, Wann)
- **RBAC** — Rollenbasierte Zugriffssteuerung (Admin, Pentester, Client)
- **Session-Sicherheit** — Secure Cookies, JWT-Signierung, automatisches Timeout
- **GDPR-konform** — Datenschutz-freundliche Architektur

> ⚠️ **Wichtig:** Dieses Tool ist ausschließlich für **autorisierte Sicherheitsprüfungen** bestimmt. Die Verwendung gegen nicht autorisierte Ziele ist illegal.

---

## 🤝 Contributing

Contributions sind willkommen!

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Commit deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffne einen Pull Request

Details findest du in [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 Lizenz

Dieses Projekt ist unter der [MIT License](LICENSE) lizenziert.

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/krockodog/All-in-One-Cybersecurity-Dashboard-/issues)
- **Discussions:** [GitHub Discussions](https://github.com/krockodog/All-in-One-Cybersecurity-Dashboard-/discussions)

---

**Built with ❤️ for the cybersecurity community.**

**Version:** 1.0.0  
**Last Updated:** 2026-05-08
