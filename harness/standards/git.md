<!-- generated-by: harness v1 | source: harness.md -->

# Git Standards

## Conventional Commits

Every commit message follows the format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type | Use When |
|------|----------|
| `feat` | Adding a new feature or user-facing capability |
| `fix` | Fixing a bug |
| `chore` | Maintenance, dependency updates, config changes |
| `docs` | Documentation only changes |
| `test` | Adding or updating tests (no production code change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |

### Scope

Scope identifies the affected area. Examples: `solver`, `api`, `ui`, `forecast`, `db`, `ci`, `harness`.

### Subject

- Imperative mood, lowercase, no period at the end.
- **≤ 72 characters** for the subject line.

### Body

- Explain **what** and **why**, not *how*.
- Wrap at 72 characters.
- Separate from subject with a blank line.

### Examples

```
feat(solver): add capacity constraint for multi-shift scheduling

The CP-SAT model now accounts for per-shift capacity limits when
generating production schedules. This prevents over-allocation during
peak demand periods.

Refs: T-1042
```

```
fix(api): return 422 for invalid date ranges in forecast endpoint

Previously the endpoint returned 500 when end_date < start_date.
Now it validates the range and returns a structured error response.

Fixes: T-1087
```

## One Logical Change Per Commit

Each commit represents **one** logical change. Do not mix unrelated changes (e.g., a feature + a formatting fix) in a single commit.

## Branch Naming

```
<type>/T-<XXXX>-<short-desc>
```

| Pattern | Example |
|---------|---------|
| Feature | `feat/T-1042-multi-shift-capacity` |
| Bug fix | `fix/T-1087-forecast-date-validation` |
| Parallel lane | `lane/T-1042-solver-engine` |

- Use kebab-case for `<short-desc>`.
- Always include the task ID.

## Merge Strategy

- **Squash merge** to `main`. The squash message follows conventional commit format.
- Feature branches are deleted after merge.

## Protected Branch: `main`

| Rule | Detail |
|------|--------|
| **No force push** | `git push --force` to `main` is blocked. |
| **PR required** | All changes to `main` go through a pull request. |
| **Self-merge allowed** | A PR may be self-merged if the **G3 gate** passes (lint + test + review + security). |
| **Linear history** | Squash merge keeps history linear and bisectable. |

## Commit Message Body: What and Why

> [!IMPORTANT]
> The commit body must explain **what** changed and **why** it changed. The code diff already shows *how* — do not repeat it in prose.

Good:
```
The optimizer previously ignored shift boundaries, allowing a single
worker to be scheduled across consecutive shifts. This caused fatigue
violations flagged by the constraint checker.
```

Bad:
```
Changed line 42 in solver.py to add an if-statement that checks
the shift_end variable.
```
