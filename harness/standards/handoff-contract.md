<!-- generated-by: harness v1 | source: harness.md -->

# Handoff Contract Standard

## Overview

Every handoff between roles produces a **JSON file** that serves as the formal contract. The Orchestrator validates each handoff before the receiving role begins work. No implicit handoffs — if there is no file, there is no handoff.

## File Location & Naming

```
artifacts/<TASK-ID>/handoff-<from>-to-<to>.json
```

Examples:
- `artifacts/T-1042/handoff-po-to-designer.json`
- `artifacts/T-1042/handoff-tech-lead-to-builder-solver.json`
- `artifacts/T-1042/handoff-reviewer-to-qa.json`

## Required Fields

```json
{
  "task_id": "T-1042",
  "from": "tech-lead",
  "to": "builder-solver",
  "artifact": "03-plan.md",
  "status": "complete",
  "summary": "Solver plan defines CP-SAT model with capacity constraints, shift boundaries, and demand forecasting integration. Three modules scoped: model builder, constraint engine, solution formatter.",
  "inputs_consumed": [
    "artifacts/T-1042/01-task.md",
    "artifacts/T-1042/02-spec.md"
  ],
  "acceptance_refs": [
    "02-spec.md#AC-1",
    "02-spec.md#AC-2",
    "02-spec.md#AC-3"
  ],
  "open_questions": [],
  "assumptions": [
    "Shift durations are fixed at 8 hours",
    "Maximum concurrent workers per line is defined in config"
  ],
  "files_touched": [
    "services/solver/src/model.py",
    "services/solver/src/constraints.py",
    "services/solver/src/formatter.py"
  ],
  "checks_run": [
    { "check": "ruff", "result": "pass" },
    { "check": "pytest", "result": "pass", "coverage": "87%" }
  ],
  "next_expected_artifact": "04-tests.md"
}
```

### Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `task_id` | `string` | ✅ | Task identifier (e.g., `T-1042`). |
| `from` | `string` | ✅ | Role handing off (e.g., `tech-lead`, `builder-ui`, `reviewer`). |
| `to` | `string` | ✅ | Role receiving the handoff (e.g., `builder-solver`, `qa`, `librarian`). |
| `artifact` | `string` | ✅ | Path to the primary artifact produced by `from`. |
| `status` | `enum` | ✅ | One of: `complete`, `blocked`, `needs-info`. |
| `summary` | `string` | ✅ | What was done and what the receiver needs to know. **≤ 120 words**. |
| `inputs_consumed` | `string[]` | ✅ | List of artifacts/files used as inputs. |
| `acceptance_refs` | `string[]` | ✅ | References to acceptance criteria this handoff addresses. |
| `open_questions` | `string[]` | ✅ | Unresolved questions (may be empty `[]`). |
| `assumptions` | `string[]` | ✅ | Assumptions made during work (may be empty `[]`). |
| `files_touched` | `string[]` | ✅ | All files created or modified. |
| `checks_run` | `object[]` | ✅ | Checks executed with results. Empty only if role has no check obligations. |
| `next_expected_artifact` | `string` | ✅ | The artifact the receiving role is expected to produce next. |

## Orchestrator Validation

> [!IMPORTANT]
> The Orchestrator **rejects** a handoff if any of the following conditions are met:

| Rejection Condition | Detail |
|---------------------|--------|
| **Artifact missing** | The file referenced in `artifact` does not exist at the specified path. |
| **Status ≠ complete** | Only `complete` handoffs advance the pipeline. `blocked` and `needs-info` trigger escalation back to the sending role or to the Orchestrator for resolution. |
| **Acceptance refs invalid** | Any `acceptance_refs` entry does not match a defined AC in the spec artifact. |
| **Files outside allow-list** | Any path in `files_touched` falls outside the ownership map defined in `03-plan.md`. |
| **Checks empty for checking roles** | Roles that are required to run checks (Builders, Reviewer, Security, QA) must have a non-empty `checks_run` array. |

## Status Flow

```
complete ──→ Pipeline advances to next role
blocked ───→ Escalated to Orchestrator; pipeline pauses
needs-info → Returned to sender with open_questions highlighted
```

## Best Practices

- Write the summary as if the receiver has **no context** beyond the referenced artifacts.
- Keep `open_questions` honest — hiding unknowns causes downstream failures.
- `files_touched` must be **exhaustive** — unlisted file changes are rejected at merge.
- Run all applicable checks **before** writing the handoff file, not after.
