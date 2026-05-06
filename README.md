# Cybersecurity Framework

> **Operative All-in-One Pentesting Dashboard** für zertifizierte Pentester und Cybersecurity Advisors

[![Node.js](https://img.shields.io/badge/Node.js-22+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow)](#license)

---

## 🎯 Übersicht

Das **Cybersecurity Framework** ist ein operatives Pentesting-Dashboard, das OSINT, Reconnaissance und Penetration Testing in einer einzigen Anwendung vereinheitlicht. Es wurde speziell für professionelle Pentester entwickelt, die mehrere Tools koordinieren möchten, ohne zwischen verschiedenen Fenster und Anwendungen zu wechseln.

### Kernfeatures
- ✅ **Unified Workflow** — OSINT → Recon → Pentest in einer App
- ✅ **Echte Tool-Integration** — Nmap, Shodan, SQLMap, Burp Suite, Nuclei, Subfinder
- ✅ **KI-Assistenten** — 10 LLM-Provider (ChatGPT, Claude, DeepSeek, Kimi, etc.)
- ✅ **Engagement Management** — Scope Definition, Authorization, Audit Logging
- ✅ **Live Execution Console** — Real-time Tool Output
- ✅ **Report Export** — JSON, HTML, CSV
- ✅ **Mobile-Ready** — Vollständig responsiv
- ✅ **Compliance-Ready** — RBAC, Audit Trail, Scope Validation

---

## 🚀 Quick Start

### Voraussetzungen
- Node.js 22+
- pnpm
- MySQL 8+ oder TiDB

### Installation

```bash
# Repository klonen
git clone https://github.com/yourusername/cybersecurity-dashboard.git
cd cybersecurity-dashboard

# Dependencies installieren
pnpm install

# Environment Variablen konfigurieren
cp .env.example .env

# Datenbank-Migrationen durchführen
pnpm db:push

# Dev-Server starten
pnpm dev
```

Die App läuft dann auf `http://localhost:5173`

### Produktions-Build

```bash
# Build erstellen
pnpm build

# Produktions-Server starten
pnpm start
```

---

## 📋 Setup-Anleitung

### 1. Environment Variablen

Erstelle eine `.env` Datei im Root-Verzeichnis:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/cybersecurity_db

# Authentication
JWT_SECRET=your-super-secret-key-change-this

# OAuth
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://oauth.server.com
VITE_OAUTH_PORTAL_URL=https://portal.oauth.server.com

# Owner Info
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
```

### 2. Datenbank Setup

```bash
# Migrationen durchführen
pnpm db:push

# Optional: Seed-Daten laden
pnpm db:seed
```

### 3. AI Provider konfigurieren

Nach dem Start:
1. Gehe zu **Settings** → **KI-Assistenten**
2. Gib deine API-Keys für die gewünschten Provider ein:
   - ChatGPT (OpenAI)
   - Claude (Anthropic)
   - DeepSeek
   - Kimi (Moonshot)
   - Nemotron (NVIDIA)
   - Gemini (Google)
   - Meta Llama
   - Mistral
   - Perplexity
   - Hermes

---

## 🛠️ Deployment

### Manus Hosting (Empfohlen)

```bash
# Checkpoint erstellen
webdev_save_checkpoint "Production Release v1.0"

# Deployen
webdev_deploy_project
```

### Docker Deployment

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

```bash
docker build -t cybersecurity-framework .
docker run -p 3000:3000 -e DATABASE_URL=... cybersecurity-framework
```

### Railway / Render / Vercel

Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für detaillierte Anleitung.

---

## 📚 Dokumentation

- **[WIKI.md](WIKI.md)** — Vollständige Feature-Dokumentation
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Contribution Guidelines
- **[API.md](API.md)** — tRPC API Referenz
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — System-Architektur

---

## 🔐 Sicherheit

### Autorisierung
- Role-Based Access Control (RBAC): Admin, Pentester, Client
- Scope Validation für alle Tool-Ausführungen
- Audit Logging für Compliance

### Best Practices
- Verwende starke Passwörter für API-Keys
- Speichere API-Keys in Environment Variablen
- Verwende HTTPS in Produktion
- Regelmäßige Backups der Datenbank

### Compliance
- GDPR-konform (Datenschutz)
- SOC 2 Audit Trail
- Engagement Authorization Tracking

---

## 🧪 Testing

```bash
# Unit Tests
pnpm test

# Integration Tests
pnpm test:integration

# E2E Tests
pnpm test:e2e

# Coverage Report
pnpm test:coverage
```

---

## 📊 Architektur

```
cybersecurity-dashboard/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Page Components
│   │   ├── hooks/          # Custom Hooks
│   │   └── lib/            # Utilities
│   └── public/             # Static Assets
├── server/                 # Express Backend
│   ├── routers/            # tRPC Procedures
│   ├── tools/              # Tool Wrappers
│   ├── workflows/          # Workflow Engine
│   ├── services/           # Business Logic
│   └── db.ts               # Database Helpers
├── drizzle/                # Database Schema
│   ├── schema.ts           # Table Definitions
│   └── migrations/         # Migration Files
└── shared/                 # Shared Types
```

---

## 🤝 Contributing

Wir freuen uns über Contributions! Bitte lese [CONTRIBUTING.md](CONTRIBUTING.md) für Details.

### Entwicklungs-Workflow

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit deine Änderungen (`git commit -m 'Add AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

---

## 📝 Lizenz

Dieses Projekt ist unter der MIT Lizenz lizenziert. Siehe [LICENSE](LICENSE) für Details.

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/cybersecurity-dashboard/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/cybersecurity-dashboard/discussions)
- **Email:** support@example.com

---

## 🙏 Danksagungen

- Manus Team für die Hosting-Infrastruktur
- Alle Pentester, die Feedback gegeben haben
- Open-Source Community für großartige Tools

---

**Made with ❤️ for Pentester**

**Version:** 1.0.0  
**Last Updated:** 2026-04-27
