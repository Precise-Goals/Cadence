# Interview Log

## Round 1 — 2026-11-17

**Q1: Repo structure?**
A: Keep this directory as the web app root (no apps/web move), add Python services alongside (services/, scripts/) — flat hybrid monorepo with bun.

**Q2: Language/types?**
A: JSX + JSDoc + @ts-check on key files + Zod runtime validation. No TypeScript.

**Q3: Python package manager?**
A: uv (fast, lockfile, workspace support).

**Q4: Sprint length?**
A: As soon as possible (aggressive pace). Using 1-week sprints.

**Q5: Agent parallelism?**
A: 5 (aggressive).

## Derived from repo inspection

- Package manager (JS): bun 1.4.4
- Framework: Next.js 16.4.6 (App Router), React 19.3.0
- Styling: Tailwind CSS 4.3.3
- Linting: ESLint 9 + eslint-config-next
- GitHub remote: https://github.com/Precise-Goals/Cadence.git
- Current state: fresh create-next-app scaffold, single commit
