# osint-for-all.live Deployment (Produktiv)

## 0) Sofort lokal testen
```bash
cd osint-for-all.live
./scripts/run-local.sh
```

## Welche Werte musst du eintragen?

- `DOMAIN`: `osint-for-all.live`
- `SERVER_IP`: **öffentliche IPv4 deines VPS** (Beispiel: `203.0.113.10`)
- `REPO_URL`: Git-URL von deinem Repository
- `REPO_DIR`: lokaler Ordnername nach dem Klonen

Kopiere die Vorlage:
```bash
cp .env.example .env
```

## 1) DNS setzen
Trage bei deinem DNS-Provider ein:
- `A` Record: Host `@` -> Wert `SERVER_IP` (z. B. `203.0.113.10`)
- Optional `AAAA` Record für IPv6

## 2) Server vorbereiten (Ubuntu)
```bash
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin curl
sudo systemctl enable --now docker
```

## 3) Repository auf Server holen
```bash
git clone https://github.com/krockodog/All-in-One-Cybersecurity-Dashboard-.git
cd All-in-One-Cybersecurity-Dashboard-/osint-for-all.live
```

## 4) Deployment starten
```bash
./scripts/deploy.sh
```

## 5) Verifizieren
```bash
curl -I https://osint-for-all.live
curl -I https://osint-for-all.live/robots.txt
curl -I https://osint-for-all.live/sitemap.xml
```

## 6) Updates ausrollen
```bash
git pull --ff-only
./scripts/deploy.sh
```


## 7) Live-Domain prüfen (muss extern erreichbar sein)
```bash
./scripts/go-live-check.sh osint-for-all.live 5 8
```

Wenn dieser Check fehlschlägt, ist meistens DNS oder Firewall (Ports 80/443) noch nicht korrekt gesetzt.


## DNS-Fehler aus deinem Screenshot (wichtig)

Dein **erster TXT-Eintrag** (`openai-domain-verification=...`) ist korrekt und kann bleiben. Fehlerhaft ist nur `TXT @ = 203.0.113.10` – dieser muss gelöscht werden.

Setze stattdessen genau so:
- `A`  `@` -> `203.0.113.10`
- `A`  `osint-for-all.live` -> `203.0.113.10` (optional, oft durch `@` bereits abgedeckt)
- `CNAME` `www` -> `osint-for-all.live`
- `TXT` Verifikationseinträge nur für echte Verifizierungs-Strings (nicht IP-Adressen)

Danach 5-15 Minuten warten und prüfen:
```bash
./scripts/go-live-check.sh osint-for-all.live 5 8
./scripts/go-live-check.sh www.osint-for-all.live 5 8
```


## 8) Live-Diagnose (wenn Check fehlschlägt)
```bash
./scripts/diagnose-live.sh osint-for-all.live
```


## 9) SSL-Fehler `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` beheben
```bash
./scripts/check-tls.sh osint-for-all.live
```

Wenn der Fehler erscheint, sind die häufigsten Ursachen:
- Port `443` zeigt nicht auf den Caddy-Container.
- Ein Proxy/CDN terminiert TLS falsch (vorübergehend Proxy deaktivieren / DNS-only).
- Alter Reverse-Proxy läuft parallel und beantwortet 443.

Direkt auf dem Server ausführen:
```bash
cd osint-for-all.live
docker compose down
docker compose up -d --build
docker compose logs --tail=200
```
