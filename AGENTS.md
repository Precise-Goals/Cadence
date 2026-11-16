# AGENTS.md — Cadence

> Map, not manual. Deep detail lives in linked files.

## What this is

**Cadence** — AI-powered production planning & capacity optimization copilot for press-based manufacturing. Self-calibrating parameters, constraint-feasible scheduling (OR-Tools CP-SAT), simulation-based robustness scoring (SimPy), and explainable what-if analysis via an agentic copilot.

Full plan: [docs/harness.md](docs/harness.md) · Problem: [docs/raw.md](docs/raw.md) · Operating manual: [docs/prompt.md](docs/prompt.md)

## Start here (every session)

1. Read this file
2. Check [harness/state/state.json](harness/state/state.json) — if present, resume from `current_stage`
3. Follow [docs/prompt.md](docs/prompt.md) §1 Boot Sequence

## Commands

| Purpose | Command |
|---|---|
| install (JS) | `bun install` |
| install (Python) | `uv sync` |
| dev (web) | `bun run dev` |
| dev (API) | `cd services/api && uv run uvicorn main:app --reload` |
| lint (JS) | `bun run lint` |
| lint (Python) | `uv run ruff check .` |
| format (JS) | `bunx prettier --write .` |
| format (Python) | `uv run ruff format .` |
| unit test (JS) | `bunx vitest run` |
| unit test (Python) | `uv run pytest services/ -x` |
| build | `bun run build` |
| harness self-test | `python scripts/check_harness.py && uv run pytest tests/harness/` |

## Layout

```
src/app/            → Next.js pages (dashboard, planner, chat, API routes)
src/components/     → React components (Gantt, KPI cards, chat UI)
src/lib/            → Client utilities, Zod schemas, API client
services/           → Python: optimizer/, simulator/, calibration/, synthetic_plant/, api/
eval/               → Baselines, scenarios, agent regression set
docs/               → Problem statement, plan, ADRs, memory
harness/            → Agents, roles, standards, workflows, state, artifacts
scripts/            → check_harness.py, guard_paths.py, breaker.py
tests/              → Harness tests + product tests
infra/              → Dockerfiles, Compose, CI config
```

## Roles

| Agent | Role File | Artifact |
|---|---|---|
| Orchestrator | [harness/roles/orchestrator.md](harness/roles/orchestrator.md) | state.json, logs |
| PO-Spec | [harness/roles/po-spec.md](harness/roles/po-spec.md) | 01-spec.md |
| Designer | [harness/roles/designer.md](harness/roles/designer.md) | 02-design.md |
| Tech Lead | [harness/roles/tech-lead.md](harness/roles/tech-lead.md) | 03-plan.md |
| Test Author | [harness/roles/test-author.md](harness/roles/test-author.md) | 04-tests.md |
| Builder | [harness/roles/builder.md](harness/roles/builder.md) | 05-build-*.md |
| Reviewer | [harness/roles/reviewer.md](harness/roles/reviewer.md) | 06-review.md |
| Security | [harness/roles/security.md](harness/roles/security.md) | 06b-security.md |
| QA | [harness/roles/qa.md](harness/roles/qa.md) | 07-qa.md |
| Scribe | [harness/roles/scribe.md](harness/roles/scribe.md) | 08-docs.md |
| Librarian | [harness/roles/librarian.md](harness/roles/librarian.md) | lessons, AGENTS.md |

## Rules (top 10)

1. Never improvise outside [docs/prompt.md](docs/prompt.md) — [harness/standards/coding.md](harness/standards/coding.md)
2. Tests first — red run before green — [harness/standards/testing.md](harness/standards/testing.md)
3. No LLM-generated numbers — all KPIs from solver/simulator/database
4. Stay in lane — write only to your role's allow-list — [scripts/guard_paths.py](scripts/guard_paths.py)
5. Conventional commits — [harness/standards/git.md](harness/standards/git.md)
6. Coverage ≥80% on changed lines — [harness/standards/testing.md](harness/standards/testing.md)
7. No `eslint-disable` or `# noqa` without issue reference
8. Every handoff needs a validated JSON — [harness/standards/handoff-contract.md](harness/standards/handoff-contract.md)
9. State on disk, not in context — [harness/state/state.json](harness/state/state.json) is the truth
10. Human approval for plan changes, deploys, and dependency additions

## Gates & breakers

See [docs/prompt.md](docs/prompt.md) §9. Budgets: [harness/state/budgets.json](harness/state/budgets.json).

## Memory map

| What | Where |
|---|---|
| Decisions | [docs/adr/](docs/adr/) |
| Lessons | [docs/memory/lessons.md](docs/memory/lessons.md) |
| Past tasks | [harness/artifacts/](harness/artifacts/) |
| Interview | [docs/memory/interview.md](docs/memory/interview.md) |
| Assumptions | [docs/memory/assumptions.md](docs/memory/assumptions.md) |
| Glossary | [docs/memory/glossary.md](docs/memory/glossary.md) |

## Do-not list

- Do not deploy (forbidden)
- Do not force-push to main
- Do not write outside your role's allow-list
- Do not add dependencies without approval
- Do not delete artifacts or logs
- Do not send factory data to external APIs in on-prem mode
- Do not let LLM generate KPI numbers
- Do not skip or weaken tests

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
