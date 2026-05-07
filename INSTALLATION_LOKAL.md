# Lokale Installation – OSINT-Dashboard

## Voraussetzungen
- Node.js (LTS empfohlen)
- pnpm
- Docker + Docker Compose

## 1. Projekt klonen
```bash
git clone <DEIN_REPO_URL> OSINT-Dashboard
cd OSINT-Dashboard
```

## 2. Abhängigkeiten installieren
```bash
pnpm install
```

## 3. Umgebungsvariablen setzen
Die Vorlage `.env.docker` ist im Projekt enthalten.

```bash
cp .env.docker .env
```

Passe anschließend `.env` für deine lokale Umgebung an (z. B. DB-URL, Ports, Secrets).

## 4. Services starten (Docker)
```bash
docker compose up -d
```

## 5. Datenbank-Migrationen ausführen
Falls Drizzle-Migrationen genutzt werden:
```bash
pnpm drizzle-kit push
```

## 6. App starten
```bash
pnpm dev
```

## 7. Verifikation
- Frontend im Browser öffnen (typisch `http://localhost:5173`)
- API/Backend prüfen (Port abhängig von `.env`/Konfiguration)

## Nützliche Kommandos
```bash
pnpm test
pnpm build
```

## Troubleshooting
- Prüfe `TROUBLESHOOTING.md`
- Prüfe `DEPLOYMENT.md` für Umgebungsdetails
- Container-Logs:
```bash
docker compose logs -f
```
