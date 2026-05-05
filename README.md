# OSINT-Dashboard
Diese Integration im Dashboard macht es nicht nur einfacher, deine Ergebnisse zu versionieren, sondern unterstützt auch die Vorbereitung auf gängige **Security‑Zertifizierungen**. Wenn du dich auf Prüfungen wie **CompTIA Security+**, **Certified Ethical Hacker (CEH)** oder **Certified Information Systems Security Professional (CISSP)** vorbereitest, ist solide Git‑Kompetenz unerlässlich.

* **CompTIA Security+** validiert grundlegende Fähigkeiten in der Einschätzung von Sicherheitsrisiken, dem Überwachen und Absichern von Cloud‑, Mobile‑ und IoT‑Umgebungen und ist ideal für den Einstieg in das Thema Informationssicherheit.
* **Certified Ethical Hacker (CEH)** fokussiert sich auf das Vorgehen von Angreifern, das Aufdecken von Schwachstellen und das Durchführen von Penetration‑Tests – ein ideales Anwendungsfeld für die Tools in diesem Dashboard.
* **CISSP – Certified Information Systems Security Professional** ist eine anspruchsvolle Zertifizierung für erfahrene Expertinnen und Experten mit mindestens fünf Jahren Berufserfahrung und deckt acht verschiedene Sicherheitsdomänen ab. Das Dashboard hilft dir, praktische Erfahrungen zu sammeln und fundiertes Wissen zu vertiefen.

### Verantwortung und Sicherheit

Wir sehen uns der Verantwortung verpflichtet, dass Sicherheits‑Werkzeuge nicht für unethische Zwecke missbraucht werden. Daher verfügt das Dashboard über:

- **Scope‑Validierung** und **Autorisation**: Du legst fest, welche Ziele getestet werden dürfen und dokumentierst die Freigabe durch Kundinnen und Kunden.
- **Role‑Based Access Control (RBAC)**: Unterschiedliche Rollen (Admin, Pentester, Client) sorgen dafür, dass nur autorisierte Personen Zugriff auf sensible Funktionen erhalten.
- **Audit Logging**: Sämtliche Aktionen werden nachvollziehbar protokolliert, um Compliance‑Anforderungen wie GDPR und SOC 2 zu erfüllen.

## 
Installation

### Voraussetzungen

- **Node.js 22+**
- **pnpm** (Paketmanager)
- **MySQL 8+** oder **TiDB** als Datenbank

### Schnellstart

```bash
# Repository klonen
git clone https://github.com/krockodog/OSINT-Dashboard.git
cd OSINT-Dashboard

# Abhängigkeiten installieren
pnpm install

# Environment‑Variablen konfigurieren
cp .env.example .env

# Datenbank‑Migration durchführen
pnpm db:push

# Entwicklungsserver starten
pnpm dev
```

Nach dem Start erreichst du die Anwendung lokal unter **http://localhost:5173**.

### Produktions‑Build

```bash
# Build generieren
pnpm build

# Produktionsserver starten
pnpm start
```

### Konfiguration der Environment

Erstelle eine `.env`‑Datei im Root‑Verzeichnis und setze die folgenden Variablen an deine Umgebung an:

```env
# Datenbank
DATABASE_URL=mysql://user:password@localhost:3306/osint_dashboard

# Authentifizierung
JWT_SECRET=super‑secret‑key

# OAuth
VITE_APP_ID=deine‑app‑id
OAUTH_SERVER_URL=https://oauth.server.com
VITE_OAUTH_PORTAL_URL=https://portal.oauth.server.com

# Owner‑Informationen
OWNER_NAME=Dein Name
OWNER_OPEN_ID=deine‑open‑id

# Manus APIs (falls benötigt)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=api‑key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=frontend‑key
```

### KI‑Provider einrichten

Nach dem ersten Start navigierst du zu **Settings → KI‑Assistenten** und hinterlegst API‑Keys für die gewünschten LLM‑Provider (ChatGPT, Claude, DeepSeek, Kimi, Gemini, Llama, Mistral usw.).

### Datenbank vorbereiten

```bash
# Migrationen anwenden
pnpm db:push

# Optional: Seed‑Daten für Testzwecke
pnpm db:seed
```

## Funktionsübersicht

- **Vereinheitlichter Workflow**: OSINT‑Recherche → Reconnaissance → Pentest – alles in einem Dashboard.
- **Echte Tool‑Integration**: Nutze bewährte Werkzeuge wie Nmap, Shodan, SQLMap, Burp Suite, Nuclei, Subfinder und weitere.
- **KI‑Assistenz**: Zehn LLM‑Provider unterstützen bei der Analyse und Auswertung der Ergebnisse.
- **Engagement Management**: Scope‑Definition, Autorisations‑Verwaltung und Audit Logging für Compliance.
- **Live‑Execution‑Console**: Sieh den Output der Tools in Echtzeit und reagiere sofort auf Ergebnisse.
- **Report‑Export**: Exportiere Berichte als JSON, HTML oder CSV direkt aus der Anwendung.
- **Responsives Design**: Das Dashboard funktioniert auf Desktop und Mobilgeräten.

## Marketing & Vision

Stell dir vor, du öffnest eine Plattform, auf der alle wichtigen Sicherheits‑Tools harmonisch zusammenarbeiten. Das **OSINT Dashboard** ist mehr als ein Werkzeugkasten – es ist dein **Begleiter** auf dem Weg zum zertifizierten Security‑Professional. Während andere noch nach Screenshots, Terminalfenstern und Notizen suchen, arbeitest du strukturiert im gleichen Workspace. Die integrierte **TryGit**‑Funktion nimmt dir die Berührungsängste mit Git: In wenigen Minuten lernst du, wie man Repositories erstellt, Commits verwaltet und Branches richtig nutzt. So kannst du deine Erkenntnisse sofort versionieren und verlierst keine Zeit im Prüfungsstress.

Ob du für die **Security+** lernst, dich auf den **CEH** vorbereitest oder die **CISSP** anstrebst – das Dashboard hilft dir, Theorie in die Praxis umzusetzen. Jede Sicherheitslücke, die du mit Nmap oder Burp Suite findest, bringt dich dem Zertifikat einen Schritt näher. Und wenn du mal eine Frage hast, steht der KI‑Assistent bereit, um Anleitungen und Hintergrundwissen zu liefern.

## Keywords

`osint`, `cybersecurity`, `penetration testing`, `pentest dashboard`, `nmap`, `shodan`, `sqlmap`, `burp suite`, `nuclei`, `subfinder`, `security report`, `ai assistant`, `trygit`, `git learning`, `git training`, `security certifications`, `comptia security+`, `ceh`, `cissp`, `ethical hacking`, `reconnaissance`, `rbac`, `audit logging`, `scope validation`, `manus`.

---

© 2026 OSINT Dashboard – Entwickelt von engagierten Pentestern für eine sichere digitale Welt.
weitere tools kommen :-) "stay save"
