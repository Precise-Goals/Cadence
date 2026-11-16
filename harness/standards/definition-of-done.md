<!-- generated-by: harness v1 | source: harness.md -->

# Definition of Done

A task is **Done** when every item in this checklist is satisfied. No exceptions, no partial credit.

## Checklist

### 1. Artifacts Complete

- [ ] Artifacts **01 through 08** exist in `artifacts/<TASK-ID>/`.
- [ ] Every handoff between roles is validated per [handoff-contract.md](./handoff-contract.md).

### 2. Gates Pass with Evidence

| Gate | What It Checks | Evidence |
|------|----------------|----------|
| **G0** | Lint, format, type-check (both JS and Python) | CI log link |
| **G1** | Per-lane unit + integration tests pass | CI log link per lane |
| **G2** | Merged integration tests pass on combined code | CI log link |
| **G3** | Review (0 BLOCKER/MAJOR) + Security (0 high/critical) | Review comment links, security scan report |
| **G4** | QA acceptance — every AC verified | QA report with per-AC pass/fail |

- [ ] All gates **G0–G4** pass.
- [ ] Evidence (log links, reports) is recorded in `state.json`.

### 3. Acceptance Criteria Covered

- [ ] Every acceptance criterion (AC) in `02-spec.md` has **≥ 1 passing test** or documented evidence of manual verification.
- [ ] No AC is left unaddressed.

### 4. Code Quality

- [ ] **Zero** new lint or type-check warnings introduced.
- [ ] **No skipped tests** (unless quarantined with an issue reference per [testing.md](./testing.md)).
- [ ] Test coverage on changed lines **≥ 80%**.

### 5. Review & Security

- [ ] Reviewer found **0 BLOCKER** and **0 MAJOR** issues (or all were resolved before merge).
- [ ] Security scan shows **0 high-severity** and **0 critical-severity** findings.

### 6. Guard Clean

- [ ] No budget breaker tripped (token, time, loop, or error budgets from `budgets.json`).
- [ ] Escalation log is clean or all escalations are resolved.

### 7. Metadata Updated

- [ ] `state.json` reflects final status, timestamps, and gate evidence.
- [ ] `logs/` directory contains all role execution logs.
- [ ] `lessons.md` is updated with any learnings or process improvements discovered during the task.

### 8. Documentation

- [ ] `AGENTS.md` is accurate and reflects any new conventions or file-structure changes.
- [ ] README or relevant docs updated if user-facing behavior changed.

### 9. Git Hygiene

- [ ] All commits follow [git.md](./git.md) conventions.
- [ ] Branch squash-merged to `main`.
- [ ] Feature branch deleted after merge.

## Enforcement

> [!WARNING]
> The Orchestrator will not mark a task as Done until every item above is checked. The Librarian performs a final sweep to confirm completeness before archival.

If any item cannot be satisfied, the task status is set to `blocked` with a documented reason, and the Orchestrator escalates for resolution.
