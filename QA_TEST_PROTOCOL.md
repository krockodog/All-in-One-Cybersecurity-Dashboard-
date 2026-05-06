# CyberDash Framework — QA Testprotokoll

**Projekt:** Operative Cybersecurity Dashboard  
**Version:** ce92a74c  
**Testdatum:** 2026-04-27  
**Tester:** QA-Engineer & DevOps-Spezialist  
**Status:** In Progress

---

## 1. Testabdeckungsübersicht

### 1.1 Funktionale Bereiche
- [ ] **Dashboard & Navigation** (Hamburger Menu, Sidebar, Routing)
- [ ] **Engagement Management** (CRUD, Scope Validation)
- [ ] **OSINT Tools** (Shodan, WHOIS, CT, GitHub Dorking)
- [ ] **Reconnaissance Tools** (Nmap, Nuclei, Subfinder)
- [ ] **Pentest Tools** (SQLMap, Burp Suite, Payload Generator)
- [ ] **Workflow Engine** (4 Workflows, Orchestrierung)
- [ ] **AI Integration** (10 KI-Provider, Chat-Fenster)
- [ ] **Notifications** (Toast, Real-Time Updates)
- [ ] **Reports & Export** (JSON, HTML, CSV)
- [ ] **Authentication & RBAC** (Login, Roles, Permissions)
- [ ] **Audit Logging** (Compliance Tracking)

### 1.2 Technische Bereiche
- [ ] **Performance** (Bundle Size, Load Time, Rendering)
- [ ] **Security** (XSS, CSRF, Input Validation, API Security)
- [ ] **Mobile Responsiveness** (375px, 768px, 1024px Viewports)
- [ ] **Browser Kompatibilität** (Chrome, Firefox, Safari, Edge)
- [ ] **API Integration** (tRPC, Tool Wrapper, LLM APIs)
- [ ] **Database** (Engagement, ExecutionJob, Finding CRUD)

---

## 2. Testfälle — Dashboard & Navigation

### TC-001: Hamburger Menu auf Mobile
**Viewport:** 375px  
**Schritte:**
1. Öffne App auf Mobile (375px)
2. Klicke auf Hamburger Menu Icon
3. Verifiziere Menu öffnet sich
4. Klicke auf Menu-Item
5. Verifiziere Navigation funktioniert
6. Klicke auf X zum Schließen

| Schritt | Erwartet | Tatsächlich | Status |
|---------|----------|------------|--------|
| Menu öffnet | Sichtbar | ? | ⏳ |
| Navigation funktioniert | Seite lädt | ? | ⏳ |
| Menu schließt | Nicht sichtbar | ? | ⏳ |

---

### TC-002: Sidebar Navigation auf Desktop
**Viewport:** 1920px  
**Schritte:**
1. Öffne App auf Desktop
2. Verifiziere Sidebar sichtbar
3. Klicke auf alle Navigation Items
4. Verifiziere Routing funktioniert
5. Verifiziere aktive Route highlighted

| Schritt | Erwartet | Tatsächlich | Status |
|---------|----------|------------|--------|
| Sidebar sichtbar | Ja | ? | ⏳ |
| Dashboard Link | Lädt | ? | ⏳ |
| Engagements Link | Lädt | ? | ⏳ |
| OSINT Guide Link | Lädt | ? | ⏳ |
| Settings Link | Lädt | ? | ⏳ |

---

## 3. Testfälle — Engagement Management

### TC-003: Engagement erstellen
**Schritte:**
1. Navigiere zu Engagements
2. Klicke "New Engagement"
3. Fülle Form aus (Name, Client, Start Date, Scope)
4. Klicke "Create"
5. Verifiziere Engagement in Liste

| Schritt | Erwartet | Tatsächlich | Status |
|---------|----------|------------|--------|
| Form öffnet | Sichtbar | ? | ⏳ |
| Eingaben speichern | Erfolgreich | ? | ⏳ |
| Engagement in Liste | Sichtbar | ? | ⏳ |

---

### TC-004: Scope Validation
**Schritte:**
1. Erstelle Engagement mit ungültigem Scope
2. Verifiziere Validierungsfehler
3. Korrigiere Scope
4. Speichere erfolgreich

| Schritt | Erwartet | Tatsächlich | Status |
|---------|----------|------------|--------|
| Validierungsfehler | Angezeigt | ? | ⏳ |
| Speichern blockiert | Ja | ? | ⏳ |
| Nach Korrektur speichbar | Ja | ? | ⏳ |

---

## 4. Testfälle — OSINT Tools

### TC-005: Shodan Integration
**Schritte:**
1. Navigiere zu OSINT Guide
2. Klicke auf Shodan Tool
3. Gebe Domain/IP ein
4. Klicke "Execute"
5. Verifiziere Ergebnisse laden

| Schritt | Erwartet | Tatsächlich | Status |
|---------|----------|------------|--------|
| Tool öffnet | Sichtbar | ? | ⏳ |
| Input akzeptiert | Ja | ? | ⏳ |
| Execution startet | Ja | ? | ⏳ |
| Ergebnisse laden | < 5s | ? | ⏳ |

---

## 5. Testfälle — Mobile Responsiveness

### TC-006: Mobile Layout (375px)
**Viewport:** 375px  
**Schritte:**
1. Öffne App auf 375px Viewport
2. Verifiziere Text lesbar (keine Overflow)
3. Verifiziere Buttons klickbar (min 44px)
4. Verifiziere Scroll funktioniert
5. Verifiziere Formulare ausfüllbar

| Schritt | Erwartet | Tatsächlich | Status |
|---------|----------|------------|--------|
| Text lesbar | Ja | ? | ⏳ |
| Buttons klickbar | Ja | ? | ⏳ |
| Scroll funktioniert | Ja | ? | ⏳ |
| Formulare ausfüllbar | Ja | ? | ⏳ |

---

### TC-007: Mobile Touch Events
**Viewport:** 375px  
**Schritte:**
1. Öffne App auf Mobile
2. Tippe auf Buttons (nicht Klick)
3. Verifiziere active:opacity-75 Feedback
4. Verifiziere onClick Handler reagiert
5. Verifiziere keine Verzögerung

| Schritt | Erwartet | Tatsächlich | Status |
|---------|----------|------------|--------|
| Touch-Feedback | Sichtbar | ? | ⏳ |
| Handler reagiert | Sofort | ? | ⏳ |
| Keine Verzögerung | < 100ms | ? | ⏳ |

---

## 6. Testfälle — Performance

### TC-008: Initial Load Time
**Schritte:**
1. Öffne App (Cold Start)
2. Messe Load Time bis "LOADING" verschwindet
3. Verifiziere < 3 Sekunden

| Metrik | Erwartet | Tatsächlich | Status |
|--------|----------|------------|--------|
| Load Time | < 3s | ? | ⏳ |
| First Paint | < 1s | ? | ⏳ |
| Largest Contentful Paint | < 2s | ? | ⏳ |

---

### TC-009: Bundle Size
**Schritte:**
1. Prüfe dist/ Größe nach Build
2. Verifiziere Code Splitting funktioniert
3. Verifiziere Chunks: vendor, ui, trpc

| Chunk | Erwartet | Tatsächlich | Status |
|-------|----------|------------|--------|
| vendor | < 50kb | ? | ⏳ |
| ui | < 50kb | ? | ⏳ |
| trpc | < 100kb | ? | ⏳ |
| index | < 700kb | ? | ⏳ |

---

## 7. Testfälle — Security

### TC-010: XSS Protection
**Schritte:**
1. Versuche XSS-Payload in Engagement Name einzugeben
2. Verifiziere Payload wird escaped
3. Verifiziere kein Script ausgeführt

| Schritt | Erwartet | Tatsächlich | Status |
|---------|----------|------------|--------|
| Payload escaped | Ja | ? | ⏳ |
| Kein Script | Ja | ? | ⏳ |

---

### TC-011: CSRF Protection
**Schritte:**
1. Prüfe HTTP Headers (X-CSRF-Token)
2. Verifiziere Token in Requests
3. Verifiziere Token Validation

| Schritt | Erwartet | Tatsächlich | Status |
|---------|----------|------------|--------|
| CSRF Token | Vorhanden | ? | ⏳ |
| Token in Requests | Ja | ? | ⏳ |
| Validation funktioniert | Ja | ? | ⏳ |

---

## 8. Testfälle — AI Integration

### TC-012: AI Chat Window
**Schritte:**
1. Gehe zu AI Settings
2. Konfiguriere ChatGPT API Key
3. Verifiziere Chat Button erscheint
4. Klicke auf Chat Button
5. Sende Nachricht
6. Verifiziere Antwort kommt

| Schritt | Erwartet | Tatsächlich | Status |
|---------|----------|------------|--------|
| Chat Button | Sichtbar | ? | ⏳ |
| Chat öffnet | Ja | ? | ⏳ |
| Nachricht sendet | Ja | ? | ⏳ |
| Antwort kommt | < 5s | ? | ⏳ |

---

## 9. Fehler-Dokumentation

### Format für Fehler:
```
**Fehler-ID:** BUG-XXX
**Titel:** [Kurze Beschreibung]
**Schweregrad:** Critical | High | Medium | Low
**Komponente:** [Dashboard, OSINT, Mobile, etc.]
**Reproduktion:** [Schritte]
**Erwartetes Verhalten:** [Was sollte passieren]
**Tatsächliches Verhalten:** [Was passiert stattdessen]
**Screenshot:** [Falls relevant]
**Status:** Open | In Progress | Fixed | Closed
```

---

## 10. Testergebnisse-Zusammenfassung

| Kategorie | Testfälle | Bestanden | Fehlgeschlagen | Blockiert |
|-----------|-----------|-----------|-----------------|-----------|
| Navigation | 2 | ? | ? | ? |
| Engagement | 2 | ? | ? | ? |
| OSINT | 1 | ? | ? | ? |
| Mobile | 2 | ? | ? | ? |
| Performance | 2 | ? | ? | ? |
| Security | 2 | ? | ? | ? |
| AI | 1 | ? | ? | ? |
| **GESAMT** | **12** | **?** | **?** | **?** |

---

## 11. Freigabestatus

- [ ] Alle kritischen Fehler behoben
- [ ] Alle High-Priority Fehler behoben
- [ ] Performance-Ziele erreicht
- [ ] Security-Tests bestanden
- [ ] Mobile-Tests bestanden
- [ ] Dokumentation aktualisiert
- [ ] Deployment vorbereitet

**Freigabedatum:** TBD  
**Freigegeben durch:** QA-Engineer
