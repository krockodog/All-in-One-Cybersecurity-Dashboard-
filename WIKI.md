# Cybersecurity Framework Wiki

## Inhaltsverzeichnis
1. [Projektübersicht](#projektübersicht)
2. [Architektur](#architektur)
3. [Features](#features)
4. [Tool-Beschreibungen](#tool-beschreibungen)
5. [Workflow-Dokumentation](#workflow-dokumentation)
6. [API-Integration](#api-integration)
7. [Setup & Installation](#setup--installation)
8. [Best Practices](#best-practices)

---

## Projektübersicht

Das **Cybersecurity Framework** ist ein operatives All-in-One Pentesting-Dashboard für zertifizierte Pentester und Cybersecurity Advisors. Es vereinheitlicht OSINT, Reconnaissance und Penetration Testing in einem einzigen Framework.

### Kernziele
- **Unified Workflow** — OSINT → Recon → Pentest in einer Anwendung
- **KI-gestützte Analyse** — Intelligente Schwachstellenerkennung mit 10 KI-Providern
- **Echte Tool-Integration** — Nmap, Shodan, SQLMap, Burp Suite, etc.
- **Compliance & Authorization** — Explizite Scope Definition und Audit Logging
- **Mobile-Ready** — Vollständig responsiv für Pentest unterwegs

---

## Architektur

### Frontend Stack
- **React 19** — UI Framework
- **Tailwind CSS 4** — Styling
- **Wouter** — Routing
- **tRPC** — Type-safe API calls
- **Shadcn/UI** — Component Library

### Backend Stack
- **Express 4** — Server
- **tRPC 11** — RPC Framework
- **Drizzle ORM** — Database
- **MySQL/TiDB** — Database Engine
- **Node.js** — Runtime

### Key Services
- **Tool Runner** — Executes Nmap, Shodan, SQLMap, Burp Suite
- **Workflow Engine** — Orchestrates OSINT → Recon → Pentest sequences
- **AI Integration** — Connects to 10 LLM providers
- **Report Generator** — JSON, HTML, CSV exports
- **Notification System** — Real-time toast notifications

---

## Features

### 1. Engagement Management
- Create & manage pentesting engagements
- Define scope (domains, IP ranges, exclusions)
- Track status and timeline
- Audit logging for compliance

### 2. Workflow Engine
4 predefined workflows:
- **Full Penetration Test** — Complete OSINT → Recon → Pentest cycle
- **Quick Security Scan** — Fast OSINT + Recon
- **Web Application Pentest** — SQLMap + Burp Suite automation
- **Network Reconnaissance** — Aggressive Nmap scanning

### 3. Tool Wrappers
- **Nmap** — Network scanning & service detection
- **Shodan** — Internet-wide device search
- **SQLMap** — SQL injection automation
- **Burp Suite** — Web vulnerability scanning
- **Extended OSINT** — WHOIS, Certificate Transparency, GitHub Dorking
- **Nuclei & Subfinder** — Vulnerability templates & subdomain enumeration
- **Payload Generator** — Reverse shells, web shells, encoders

### 4. AI Integration
10 supported providers:
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

### 5. Pentest Guide
6-phase roadmap:
1. **Vorbereitung** — Scope, Authorization, RoE
2. **OSINT** — Domain, Subdomains, Credential Leaks
3. **Reconnaissance** — Nmap, Service Fingerprinting
4. **Vulnerability Assessment** — Web vulns, SQLi, XSS
5. **Exploitation** — Initial Access, Privilege Escalation
6. **Reporting** — CVSS Scoring, Remediation

### 6. Notification System
- Real-time toast notifications
- Workflow status updates
- Finding alerts
- Engagement events

### 7. KI-Chat-Fenster
- Floating button (bottom-right)
- Activates when API keys configured
- Assists with framework navigation
- Can execute tools via AI commands
- Maintains engagement context

---

## Tool-Beschreibungen

### Nmap
**Zweck:** Network scanning and service detection

**Nutzung:**
```bash
# Quick scan
nmap -sV <target>

# Aggressive scan
nmap -A -T4 <target>

# UDP scan
nmap -sU <target>
```

**Output:** XML parsing, service detection, OS fingerprinting

### Shodan
**Zweck:** Internet-wide device search

**Nutzung:**
```
query: "apache 2.4"
query: "cisco router"
query: "mongodb"
```

**Output:** Device metadata, open ports, banners

### SQLMap
**Zweck:** SQL injection detection and exploitation

**Nutzung:**
```bash
sqlmap -u "http://target.com/page?id=1" --dbs
sqlmap -u "http://target.com/page?id=1" -D dbname --tables
```

**Output:** Vulnerable parameters, database extraction

### Burp Suite
**Zweck:** Web application security testing

**Features:**
- Proxy scanning
- Active/Passive scanning
- Intruder attacks
- Repeater for manual testing

### Extended OSINT
**WHOIS:** Domain registration info
**Certificate Transparency:** SSL/TLS certificate enumeration
**GitHub Dorking:** Credential leak detection

### Nuclei & Subfinder
**Nuclei:** Vulnerability template scanning
**Subfinder:** Subdomain enumeration

### Payload Generator
**Reverse Shells:** Bash, Python, PowerShell, PHP
**Web Shells:** PHP, ASP.NET, JSP
**Encoders:** Base64, Hex, ROT13, XOR
**Obfuscation:** Payload encoding & evasion

---

## Workflow-Dokumentation

### Full Penetration Test Workflow

**Phase 1: OSINT (2-3 days)**
1. Domain enumeration (Shodan, WHOIS)
2. Subdomain discovery (Subfinder)
3. Certificate enumeration (CT)
4. Credential leak search (GitHub)
5. Social media reconnaissance

**Phase 2: Reconnaissance (2-3 days)**
1. Nmap network scanning
2. Service fingerprinting
3. OS detection
4. CVE identification
5. Network mapping

**Phase 3: Vulnerability Assessment (3-5 days)**
1. Web application testing
2. SQL injection testing
3. XSS vulnerability detection
4. CSRF testing
5. Authentication bypass attempts

**Phase 4: Exploitation (2-4 days)**
1. Initial access (web shells, reverse shells)
2. Privilege escalation
3. Lateral movement
4. Data exfiltration
5. Persistence mechanisms

**Phase 5: Reporting (2-3 days)**
1. Finding classification
2. CVSS scoring
3. Risk assessment
4. Remediation recommendations
5. Executive summary

---

## API-Integration

### tRPC Procedures

**Engagements:**
```typescript
trpc.engagements.create.useMutation()
trpc.engagements.list.useQuery()
trpc.engagements.getById.useQuery(id)
trpc.engagements.update.useMutation()
```

**Workflows:**
```typescript
trpc.workflows.execute.useMutation()
trpc.workflows.getStatus.useQuery(jobId)
trpc.workflows.getResults.useQuery(jobId)
```

**Tools:**
```typescript
trpc.tools.execute.useMutation()
trpc.tools.getResults.useQuery(executionId)
```

**Reports:**
```typescript
trpc.reports.generate.useMutation()
trpc.reports.export.useMutation()
```

### AI Integration

**Chat Endpoint:**
```
POST /api/ai/chat
{
  "message": "user message",
  "provider": "chatgpt",
  "context": { "userId": "...", "engagementId": "..." }
}
```

---

## Setup & Installation

### Requirements
- Node.js 22+
- pnpm
- MySQL 8+ or TiDB

### Installation

```bash
# Clone repository
git clone <repo-url>
cd cybersecurity-dashboard

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env

# Run database migrations
pnpm db:push

# Start dev server
pnpm dev

# Build for production
pnpm build
```

### Environment Variables
```
DATABASE_URL=mysql://user:pass@localhost/db
JWT_SECRET=your-secret
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://oauth.server
```

---

## Best Practices

### Pentesting
1. **Always get written authorization** before starting
2. **Define scope clearly** — domains, IP ranges, exclusions
3. **Document everything** — findings, timestamps, evidence
4. **Use Rules of Engagement** — respect client constraints
5. **Cleanup after exploitation** — remove shells, reverse connections

### Tool Usage
1. **Start passive** — OSINT before active scanning
2. **Respect bandwidth** — Don't overwhelm target networks
3. **Use stealth modes** — Avoid IDS/WAF detection
4. **Verify findings** — Confirm vulnerabilities before reporting
5. **Test remediation** — Verify fixes after client patches

### Reporting
1. **Executive summary** — Non-technical overview for management
2. **Technical findings** — Detailed vulnerability descriptions
3. **CVSS scoring** — Standardized risk assessment
4. **Remediation steps** — Clear, actionable fixes
5. **Timeline** — When vulnerabilities were discovered/fixed

---

## Support & Troubleshooting

### Common Issues

**Mobile responsiveness problems:**
- Clear browser cache
- Check z-index conflicts
- Verify touch-action CSS

**Tool execution failures:**
- Check API keys/credentials
- Verify scope validation
- Review audit logs

**AI provider issues:**
- Verify API keys in AI Settings
- Check provider status
- Review rate limits

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

**Last Updated:** 2026-04-27
**Version:** 1.0.0
