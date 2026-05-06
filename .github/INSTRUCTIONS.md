# All-in-One Cybersecurity Dashboard - GitHub Copilot Instructions

## Project Context
This is a professional cybersecurity advisor dashboard for authorized OSINT, reconnaissance, penetration testing guidance, reporting, and configuration workflows. The project aggregates 35+ security tools into a unified forensics-style control room interface.

## Tech Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + tRPC
- Database: MySQL via Drizzle ORM
- Auth: JWT-based authentication
- Package Manager: pnpm
- Deployment: Docker, Docker Compose

## Project Goals
- Provide a comprehensive cybersecurity tool aggregator with live integrations
- Support security professionals with OSINT, pentesting, and reconnaissance workflows
- Maintain a forensic-style dark UI for professional use
- Include proper ethical disclaimers and authorization checks
- Support Docker-based deployment with full-stack containerization

## Code Quality Standards
- Always use TypeScript with strict typing (no 'any' unless absolutely necessary)
- Follow existing code style: Prettier formatting, ESLint rules
- Use meaningful variable and function names (camelCase for JS/TS)
- Keep components small and focused on single responsibility
- Add JSDoc comments for complex functions and exported APIs

## README Guidelines
- README.md is in German but provide English sections for international users
- Include badges: build status, coverage, license MIT, Docker support
- Include 'Nur fur autorisierte Nutzung' disclaimer at the top
- Document all environment variables with descriptions
- Provide multiple deployment options: Docker, Vercel, Netlify, VPS
- Include a project structure tree and quickstart guide
- Add learning resources section for security tools
- Include Security & Ethics section with responsible use guidelines

## Security Best Practices
- NEVER hardcode secrets, API keys, or credentials in source code
- Use environment variables for all sensitive configuration
- Validate all user input, especially in security tool parameters
- Sanitize any data that could be used for SSRF or command injection
- Ensure CORS is properly configured
- Review any code that handles authentication or authorization carefully
- Never expose .env files or sensitive config in commits
- Use parameterized queries for database operations

## PR Review Focus Areas
When reviewing pull requests, check for:
1. TypeScript type safety: No implicit any, proper interface definitions
2. tRPC type consistency: Router procedures properly typed end-to-end
3. Security: Input validation, no hardcoded secrets, no SQL injection vectors
4. Code style: Prettier formatting, no console.log in production code
5. Testing: New features should have corresponding tests
6. Documentation: README updated if features changed

## Commit Message Guidelines
- Use conventional commits: feat, fix, docs, style, refactor, test, chore
- Keep commit messages concise and descriptive
- Reference issues when applicable

## Testing
- All new features require unit or integration tests
- Test database operations with Drizzle test helpers
- Use Vitest for frontend and backend tests
- Maintain test coverage above 60 percent

## License
This project is licensed under the MIT License.
