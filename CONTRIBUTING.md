# Contributing Guidelines

Danke, dass du zum **Cybersecurity Framework** beitragen möchtest! 🎉

## Code of Conduct

Wir erwarten von allen Beitragenden, dass sie sich respektvoll und professionell verhalten. Beleidigende oder diskriminierende Sprache wird nicht toleriert.

---

## Wie kann ich beitragen?

### 1. Bug Reports
Wenn du einen Bug findest:
1. Öffne ein [GitHub Issue](https://github.com/yourusername/cybersecurity-dashboard/issues)
2. Beschreibe das Problem klar
3. Gib Schritte zur Reproduktion an
4. Teile dein System (OS, Browser, Node-Version)

**Template:**
```
**Beschreibung:** Was ist das Problem?
**Reproduktion:** Schritte zum Reproduzieren
**Erwartet:** Was sollte passieren?
**Tatsächlich:** Was passiert stattdessen?
**System:** OS, Browser, Versionen
```

### 2. Feature Requests
Neue Features sind willkommen:
1. Öffne ein [GitHub Issue](https://github.com/yourusername/cybersecurity-dashboard/issues)
2. Beschreibe die gewünschte Funktionalität
3. Erkläre den Use-Case
4. Diskutiere mit Maintainern

### 3. Code Contributions

#### Setup für Entwicklung

```bash
# Repository forken und klonen
git clone https://github.com/YOUR_USERNAME/cybersecurity-dashboard.git
cd cybersecurity-dashboard

# Branch erstellen
git checkout -b feature/your-feature-name

# Dependencies installieren
pnpm install

# Dev-Server starten
pnpm dev

# Tests laufen
pnpm test
```

#### Coding Standards

**TypeScript:**
- Verwende strikte Type-Definitionen
- Keine `any` Types ohne Grund
- Dokumentiere komplexe Funktionen

**React:**
- Funktionale Components mit Hooks
- Memoization für Performance
- Accessibility (a11y) beachten

**Styling:**
- Tailwind CSS für Styling
- Mobile-First Approach
- Dark Mode Support

**Backend:**
- tRPC für API-Calls
- Error Handling mit try-catch
- Input Validation

#### Code Style

```bash
# Format Code
pnpm format

# Lint Code
pnpm lint

# Type Check
pnpm type-check
```

#### Commit Messages

Verwende aussagekräftige Commit Messages:

```
feat: Add AI chat window with floating button
fix: Resolve mobile navigation z-index issue
docs: Update README with setup instructions
test: Add tests for tool execution
refactor: Simplify workflow engine logic
```

**Format:** `<type>: <subject>`

**Types:**
- `feat` — Neue Features
- `fix` — Bug Fixes
- `docs` — Dokumentation
- `test` — Tests
- `refactor` — Code Refactoring
- `perf` — Performance Improvements
- `chore` — Build, Dependencies, etc.

#### Pull Requests

1. **Branch erstellen:**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Änderungen committen:**
   ```bash
   git add .
   git commit -m "feat: Add your feature"
   ```

3. **Push zum Fork:**
   ```bash
   git push origin feature/your-feature
   ```

4. **Pull Request öffnen:**
   - Gib aussagekräftigen Titel
   - Beschreibe Änderungen
   - Referenziere Related Issues
   - Füge Screenshots/Videos hinzu (falls relevant)

**PR Template:**
```markdown
## Beschreibung
Kurze Beschreibung der Änderungen

## Related Issues
Fixes #123

## Änderungen
- [ ] Feature 1
- [ ] Feature 2

## Testing
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] Manual Testing

## Screenshots
(Falls relevant)
```

---

## Development Workflow

### Feature Development

1. **Issue erstellen/auswählen**
   ```bash
   # Diskutiere mit Maintainern
   ```

2. **Branch erstellen**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Implementieren**
   ```bash
   # Code schreiben
   # Tests schreiben
   # Code formatieren
   pnpm format
   ```

4. **Tests durchführen**
   ```bash
   pnpm test
   pnpm test:integration
   ```

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: Your feature"
   git push origin feature/your-feature
   ```

6. **Pull Request öffnen**
   - Beschreibe Änderungen
   - Verlinke Related Issues
   - Warte auf Review

### Code Review Process

- Mindestens 1 Maintainer Review erforderlich
- Alle Tests müssen bestanden sein
- Code Style muss eingehalten werden
- Keine Breaking Changes ohne Discussion

---

## Testing

### Unit Tests

```bash
# Alle Tests
pnpm test

# Spezifische Test-Datei
pnpm test server/tools/nmap.test.ts

# Watch Mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

### Test Structure

```typescript
import { describe, it, expect } from "vitest";

describe("Feature", () => {
  it("should do something", () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

### Integration Tests

```bash
pnpm test:integration
```

---

## Documentation

### Code Comments

```typescript
/**
 * Executes a tool with the given parameters
 * @param toolName - Name of the tool to execute
 * @param params - Tool parameters
 * @returns Execution result
 */
function executeTool(toolName: string, params: Record<string, any>) {
  // Implementation
}
```

### README Updates

- Update README.md für neue Features
- Füge Beispiele hinzu
- Dokumentiere Breaking Changes

### Wiki Updates

- Update WIKI.md für Dokumentation
- Füge neue Tool-Beschreibungen hinzu
- Dokumentiere neue Workflows

---

## Performance Guidelines

### Frontend
- Code Splitting für große Komponenten
- Lazy Loading für Routes
- Memoization für expensive computations
- Minimize Bundle Size

### Backend
- Database Query Optimization
- Caching für häufige Anfragen
- Connection Pooling
- Rate Limiting

---

## Security Guidelines

### API Security
- Input Validation
- SQL Injection Prevention
- XSS Protection
- CSRF Tokens

### Authentication
- Secure Password Hashing
- JWT Token Management
- Session Management
- Rate Limiting

### Data Protection
- Encrypt sensitive data
- Secure API Key Storage
- Audit Logging
- GDPR Compliance

---

## Release Process

### Version Numbering
Wir verwenden [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- `1.0.0` — Initial Release
- `1.1.0` — New Features
- `1.0.1` — Bug Fixes

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Git tag created
- [ ] Release notes written
- [ ] Deployed to production

---

## Getting Help

- **Questions:** [GitHub Discussions](https://github.com/yourusername/cybersecurity-dashboard/discussions)
- **Issues:** [GitHub Issues](https://github.com/yourusername/cybersecurity-dashboard/issues)
- **Email:** maintainers@example.com

---

## Danksagungen

Danke für deine Beiträge! 🙏

Jeder Beitrag, egal wie klein, ist wertvoll und trägt zum Projekt bei.

---

**Happy Contributing! 🚀**
