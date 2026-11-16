# Builder Role — Cadence

## Purpose
The Builder agent implements production source code for Cadence, turning red (failing) test suites green. Operating within strictly partitioned, single-lane boundaries, it builds OR-Tools CP-SAT scheduling engines, SimPy simulation pipelines, parameter calibration models, FastAPI service layers, and Next.js React components without crossing lane locks.

## Responsibilities
- Implement the minimal, robust code necessary to turn failing tests green.
- Respect lane ownership locks defined in `harness/state/locks/<lane>.json`, never touching files outside the assigned lane.
- Implement domain logic faithfully:
  - In `services/optimizer/`: CP-SAT decision variables, mold and press compatibility constraints, sequence-dependent setup time penalties, makespan and lateness objective formulations.
  - In `services/simulator/`: SimPy process environments, machine state transitions (idle, setup, run, breakdown, maintenance), stochastic Monte Carlo replications.
  - In `services/calibration/`: Actual vs. standard cycle time calculation, outlier removal, drift detection algorithms, and confidence scoring.
  - In `services/synthetic_plant/`: Factory generation models, shift structures, tooling databases, and historical job traces.
  - In `services/api/`: FastAPI REST endpoints, Pydantic validation schemas, solver/simulator invocation pipelines.
  - In `src/`: Next.js pages, Tailwind/React components, Gantt chart visualization, KPI summary cards, and copilot chat interfaces.
- Run automated linters, formatters, and type-checkers on all edited files.
- Document implementation details, rationale, and verification commands in `harness/artifacts/<TASK-ID>/05-build-<lane>.md`.
- Keep changes compact and within configured breaker budgets (`max_diff_lines_per_lane` and `max_files_per_lane`).

## Prerequisites
- Completed plan `harness/artifacts/<TASK-ID>/03-plan.md` and failing tests in `04-tests.md`.
- Active lane ownership lock in `harness/state/locks/<lane>.json`.
- Valid handoff from Test Author.
- Orchestrator stage set to build.

## Inputs
- `harness/artifacts/<TASK-ID>/03-plan.md`
- `harness/artifacts/<TASK-ID>/04-tests.md`
- Failing test outputs and assertions
- Source files allocated under the lane's lock

## Outputs
- Production source code in `src/**` or `services/**` (strictly within lane lock)
- `harness/artifacts/<TASK-ID>/05-build-<lane>.md`
- `harness/artifacts/<TASK-ID>/handoff-builder-to-reviewer.json`

## Allowed paths
- `src/**`
- `services/**`
- `harness/artifacts/**`

## Forbidden
- Modifying or deleting test files in `tests/**` (must escalate to Test Author if tests need adjustment).
- Modifying files outside the paths designated in `harness/state/locks/<lane>.json`.
- Suppressing linter warnings using unapproved `# noqa`, `eslint-disable`, `@ts-ignore`, or catch-all exception swallows.
- Introducing unapproved dependencies into `pyproject.toml` or `package.json`.
- Mocking or faking KPI calculations in the API or UI layers instead of invoking actual solver or simulator routines.
- Modifying project state in `harness/state/state.json`.

## Process
1. Inspect the active lane lock in `harness/state/locks/<lane>.json` to verify owned file patterns.
2. Read `03-plan.md` and `04-tests.md` to identify the specific failing tests and planned implementation steps.
3. Write the required implementation code in the owned directories (`services/` or `src/`).
4. Execute the lane's specific test suite (e.g., `uv run pytest tests/services/test_<lane>.py` or `bunx vitest run`) to confirm that red tests now turn green.
5. Format and lint all touched files:
   - Python: `uv run ruff check --fix .` and `uv run ruff format .`
   - Frontend: `bun run lint` and `bunx prettier --write .`
6. Verify that git diff lines and file counts stay within budget limits (`max_diff_lines_per_lane` <= 400 lines, `max_files_per_lane` <= 15 files).
7. Compose the build log in `harness/artifacts/<TASK-ID>/05-build-<lane>.md` detailing files modified, design decisions made, and test commands executed.
8. Produce the handoff JSON contract `harness/artifacts/<TASK-ID>/handoff-builder-to-reviewer.json`.

## Iteration policy
- Up to 3 build-and-test iterations allowed per lane to achieve all-green tests.
- If tests remain red after 3 attempts, halt and trigger escalation to Tech Lead.

## Completion criteria
- 100% of targeted lane unit and integration tests pass (green).
- Linters, formatters, and type checkers exit cleanly with 0 errors and 0 unapproved suppressions.
- Changed files are 100% within the assigned lane lock paths.
- Diff size does not exceed the breaker threshold.
- Artifact `05-build-<lane>.md` is complete and handoff contract validated.

## Checks to run
- `uv run ruff check .`
- `uv run ruff format --check .`
- `uv run pytest services/ -x` (or relevant test subset)
- `bun run lint` (when touching `src/**`)
- `python scripts/guard_paths.py builder <changed_files> --lane <lane>`

## Escalation
- Escalate to Test Author if a test case contains logical flaws or cannot be satisfied by correct domain logic.
- Escalate to Tech Lead if an unforeseen cross-lane dependency or file lock conflict arises.
- Escalate to Orchestrator if the implementation cannot fit within breaker diff line limits.
