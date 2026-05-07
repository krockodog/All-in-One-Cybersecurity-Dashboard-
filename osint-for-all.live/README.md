# osint-for-all.live Deployment (Produktiv)

## 0) Sofort lokal testen
```bash
cd osint-for-all.live
./scripts/run-local.sh
```

## Welche Werte musst du eintragen?


> Wichtig: `203.0.113.x`, `198.51.100.x`, `192.0.2.x` sind nur Dokumentations-IP-Bereiche und funktionieren **nicht** im Live-Betrieb.

- `DOMAIN`: `osint-for-all.live`
- `SERVER_IP`: **öffentliche IPv4 deines VPS** (Beispiel: `<DEINE_ECHTE_PUBLIC_IP>`)
- `REPO_URL`: Git-URL von deinem Repository
- `REPO_DIR`: lokaler Ordnername nach dem Klonen

Kopiere die Vorlage:
```bash
cp .env.example .env
```

## 1) DNS setzen
Trage bei deinem DNS-Provider ein:
- `A` Record: Host `@` -> Wert `SERVER_IP` (z. B. `<DEINE_ECHTE_PUBLIC_IP>`)
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

Dein **erster TXT-Eintrag** (`openai-domain-verification=...`) ist korrekt und kann bleiben. Fehlerhaft ist nur `TXT @ = <DEINE_ECHTE_PUBLIC_IP>` – dieser muss gelöscht werden.

Setze stattdessen genau so:
- `A`  `@` -> `<DEINE_ECHTE_PUBLIC_IP>`
- `A`  `osint-for-all.live` -> `<DEINE_ECHTE_PUBLIC_IP>` (optional, oft durch `@` bereits abgedeckt)
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


## 10) Kein Zugriff auf Zielserver (SSH) beheben
```bash
./scripts/check-server-access.sh <DEINE_ECHTE_PUBLIC_IP> 22
```

Wenn `SSH port NOT reachable` kommt:
- In der Cloud-Firewall eingehend `TCP 22` erlauben.
- Auf dem Server `ufw allow 22/tcp` (oder Security Group) setzen.
- Sicherstellen, dass `sshd` läuft.

Danach verbinden:
```bash
ssh -p 22 <dein-user>@<DEINE_ECHTE_PUBLIC_IP>
```


## 11) Wenn "membership expired" Seite erscheint

Wenn du diese Meldung siehst (wie im Screenshot), kommt die Seite **nicht** von deinem Code, sondern vom Hosting-Anbieter der alten Verlinkung.

Sofort-Fix über Domain-Panel (ohne Serverzugriff):
1. Alte A/CNAME-Zuordnung zur abgelaufenen Instanz entfernen.
2. Falls dein Panel **Web-Forwarding / URL Redirect** kann:
   - Host: `@`
   - Ziel: `https://cyberdash-xnbpkymb.manus.space`
   - Typ: `301 Permanent`
3. Falls dein Panel **CNAME bei apex** unterstützt (ALIAS/ANAME/Flattening):
   - `@ -> cyberdash-xnbpkymb.manus.space`
4. `www` zusätzlich auf dieselbe Ziel-Domain zeigen lassen.

Hinweis: Der Text "author's membership has expired" bedeutet, dass die alte Hosting-Instanz deaktiviert wurde. DNS allein kann keinen abgelaufenen Account reaktivieren.
