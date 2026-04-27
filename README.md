# All-in-One Cybersecurity Dashboard

> **Authorized Use Only.** This dashboard is designed for authorized security assessments, red-team engagements, and educational cybersecurity training. Only use against networks and targets you own or have explicit written permission to test.

A full-stack cybersecurity advisor interface combining **35 security tools** across OSINT, Pentest, and Reconnaissance categories — with live integrations, simulated terminal output, audit evidence chains, and report exports. Built with a forensic control-room aesthetic.

**Live demo:** [cyberdash-xnbpkymb.manus.space](http://cyberdash-xnbpkymb.manus.space)

---

## Features

| Category | Tools | Mode |
|----------|-------|------|
| **OSINT** | Sherlock, theHarvester, Maltego, Recon-ng, SpiderFoot, Shodan, Censys, Google Dorking, Wayback Machine, Social Media Analysis, ExifTool, WHOIS, DNS Enumeration | Passive collection |
| **Pentest** | Nmap, Nikto, Burp Suite, Metasploit, SQLMap, Hydra, John the Ripper, Hashcat, Aircrack-ng, Sparrow WiFi, Wireshark, Gobuster, WPScan, enum4linux | Controlled validation |
| **Recon** | Subfinder, Amass, Masscan, Nuclei, httpx, ffuf, Aquatone, Fierce | Surface mapping |

**Live server-side integrations** (no API key required):
- DNS enumeration via Node.js `dns` module
- WHOIS/RDAP via `rdap.org`
- Subdomain discovery via `crt.sh` certificate transparency
- Wayback Machine timeline via `web.archive.org` CDX API
- HTTP header analysis and directory probing (httpx, Nikto-lite, ffuf, Gobuster, Nuclei)
- TCP port scanning via Node.js `net`

**Additional capabilities:**
- Structured audit job tracking with terminal-style evidence output
- JSON and Markdown report export
- AI provider key management (ChatGPT, Claude, DeepSeek, Gemini, and more)
- Pentest methodology guide (7 phases)
- OSINT workflow guide
- Settings with configurable mode, routing, log retention, and behavior toggles
- PwnagotchiFace status indicators
- MatrixRain background animation
- Glassmorphism dark-mode UI

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS v4 |
| Backend | Node.js, Express 4, tRPC 11 |
| Database | Drizzle ORM + MySQL (optional) |
| Auth | JWT / session cookies (optional) |
| Testing | Vitest 2 |
| Package manager | pnpm |

---

## Quick Start — Local Development

```bash
# 1. Clone the repository
git clone https://github.com/krockodog/all-in-one-cybersecurity-dashboard-.git
cd all-in-one-cybersecurity-dashboard-

# 2. Install dependencies
pnpm install

# 3. (Optional) Copy and configure environment variables
cp .env.docker .env
# Edit .env with your settings

# 4. Run development server
pnpm dev
# App available at http://localhost:5173
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Recommended | Secret key for signing session tokens |
| `DATABASE_URL` | Optional | MySQL connection string for Engagement Dashboard |
| `OAUTH_SERVER_URL` | Optional | OAuth provider URL |
| `OWNER_OPEN_ID` | Optional | Admin user OpenID |
| `BUILT_IN_FORGE_API_KEY` | Optional | AI/LLM API key |

> Without `DATABASE_URL`, the core Dashboard, OSINT Tools, Pentest Tools, Reconnaissance, Reports, and Settings pages all work fully. Only the Engagement Dashboard requires a database.

---

## Deployment

### Option 1: Docker (Recommended for Self-Hosted)

The easiest production deployment path.

#### Prerequisites
- Docker 24+
- Docker Compose 2.20+

#### Steps

```bash
# 1. Clone the repository
git clone https://github.com/krockodog/all-in-one-cybersecurity-dashboard-.git
cd all-in-one-cybersecurity-dashboard-

# 2. Configure environment
cp .env.docker .env.docker.local
# Edit .env.docker.local — set at minimum JWT_SECRET

# 3. Build and start (minimal, no database)
docker compose up -d --build

# App available at http://localhost:3000
```

#### With MySQL (for Engagement Dashboard)

```bash
# Start with the database profile
docker compose --profile with-db up -d --build

# Run database migrations
docker compose exec app pnpm db:push
```

#### Environment configuration for Docker

Edit `.env.docker` before building:

```env
JWT_SECRET=your-secure-random-secret-here
# DATABASE_URL=mysql://cyberdash:cyberdash@db:3306/cyberdash
```

#### Docker commands reference

```bash
# Start
docker compose up -d

# View logs
docker compose logs -f app

# Stop
docker compose down

# Rebuild after code changes
docker compose up -d --build

# Remove all data including database
docker compose down -v
```

#### Custom port

```bash
PORT=8080 docker compose up -d
# App available at http://localhost:8080
```

---

### Option 2: Vercel

1. Fork or push to GitHub
2. Import in Vercel dashboard
3. Set build command: `pnpm build`
4. Set output directory: `dist/public`
5. Add environment variables in the Vercel dashboard

> Note: The Express backend is not compatible with Vercel's serverless runtime. Use Vercel only for the static frontend bundle. Backend integrations (DNS, port scan, etc.) won't function.

---

### Option 3: Netlify

1. Fork or push to GitHub
2. Import in Netlify dashboard
3. Set build command: `pnpm build`
4. Set publish directory: `dist/public`
5. Add a `netlify.toml` redirect rule for SPA routing:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

> Same limitation as Vercel — server-side integrations require a separate Node.js host.

---

### Option 4: VPS / Bare Metal

```bash
# Build
pnpm build

# Start production server
NODE_ENV=production JWT_SECRET=your-secret pnpm start

# Or with PM2 for process management
pm2 start "pnpm start" --name cyberdash
pm2 save
pm2 startup
```

---

## Project Structure

```
├── client/                 # React frontend
│   └── src/
│       ├── components/
│       │   └── cyber/
│       │       └── CyberShell.tsx   # Main UI shell, all shared components
│       ├── contexts/
│       │   └── AuditContext.tsx     # Global state: jobs, settings, history
│       ├── hooks/
│       │   └── useToolExecution.ts  # tRPC execution with local fallback
│       ├── lib/
│       │   └── cyber-data.ts        # 35-tool catalog definitions
│       └── pages/                   # Route-level page components
├── server/                 # Express + tRPC backend
│   ├── toolRunner.ts        # Live integrations: DNS, HTTP, port scan, etc.
│   ├── routers.ts           # tRPC router (tools, auth, engagements, workflows)
│   ├── tools/               # Specialized tool wrappers (Nmap, SQLMap, Burp…)
│   ├── services/            # AI integration, report export, execution console
│   └── workflows/           # Workflow engine for multi-step engagements
├── drizzle/                 # Database schema and migrations
├── shared/                  # Shared TypeScript types
├── Dockerfile               # Multi-stage production Docker build
├── docker-compose.yml       # Full stack orchestration
├── TEST_MATRIX.md           # Full functional test protocol and results
└── README.md
```

---

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run with verbose output
pnpm test --reporter=verbose
```

**Test coverage:**

| Test File | Tests | Focus |
|-----------|-------|-------|
| `server/toolRunner.test.ts` | 7 | Live DNS enumeration integration |
| `server/routers/authorization.test.ts` | 13 | Auth guards, admin checks |
| `server/tools/nmap.test.ts` | 7 | Nmap XML parser |
| `server/tools/toolManager.test.ts` | 4 | Tool dispatch |
| `server/workflows/workflowEngine.test.ts` | 8 | Workflow execution |
| `server/auth.logout.test.ts` | 1 | Session cookie clearing |
| `client/src/lib/cyber-data.test.ts` | 14 | Tool catalog validation |
| `client/src/contexts/AuditContext.test.tsx` | 10 | Audit context logic |
| **Total** | **64** | All passing |

See [TEST_MATRIX.md](./TEST_MATRIX.md) for the complete functional test protocol covering all 79 test cases across UI, mobile, performance, security, and integration categories.

---

## Learning Resources

### OSINT & Reconnaissance
- [OSINT Framework](https://osintframework.com/) — Visual map of OSINT sources and tools
- [Bellingcat Toolkit](https://bellingcat.gitbook.io/toolkit/) — Investigative research tools
- [SANS OSINT Cheat Sheet](https://www.sans.org/blog/list-of-resource-links-from-open-source-intelligence-summit-2021/) — Professional OSINT reference
- [IntelTechniques](https://inteltechniques.com/tools/) — Michael Bazzell's OSINT tools
- [Shodan Cheat Sheet](https://www.shodan.io/about/products) — IoT/network search queries

### Penetration Testing
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/) — Web application pentest methodology
- [HackTricks](https://book.hacktricks.xyz/) — Comprehensive pentest techniques
- [PTES (Penetration Testing Execution Standard)](http://www.pentest-standard.org/) — Industry-standard methodology
- [PortSwigger Web Security Academy](https://portswigger.net/web-security) — Free lab-based learning
- [TryHackMe](https://tryhackme.com/) — Guided cybersecurity learning paths
- [HackTheBox](https://www.hackthebox.com/) — Advanced CTF/lab environment

### Tool Documentation
- [Nmap Reference Guide](https://nmap.org/book/man.html)
- [Nuclei Templates](https://github.com/projectdiscovery/nuclei-templates)
- [Subfinder Docs](https://github.com/projectdiscovery/subfinder)
- [theHarvester](https://github.com/laramies/theHarvester)
- [Burp Suite Documentation](https://portswigger.net/burp/documentation)

### Frameworks & Standards
- [MITRE ATT&CK](https://attack.mitre.org/) — Adversary tactics and techniques
- [CIS Controls](https://www.cisecurity.org/controls/) — Security controls framework
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework) — Risk management guidelines
- [CVE Database](https://cve.mitre.org/) — Common Vulnerabilities and Exposures

---

## Security & Ethics

This tool is built for **authorized security assessments only**. Unauthorized use against systems you do not own or have explicit written permission to test is illegal in most jurisdictions.

Key design decisions that enforce responsible use:
- The "Authorized Use Only" disclaimer banner appears on every page
- Active/high-risk tools (Metasploit, Hydra, Aircrack-ng) use guided fallback mode — they generate command previews but never execute natively
- All tool runs produce an evidence chain tied to target, timestamp, and authorization scope
- Audit logs are export-ready for compliance and reporting

---

## License

MIT — see [package.json](./package.json)

---

*Built by [krockodog](https://github.com/krockodog)*
