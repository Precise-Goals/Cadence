<!-- generated-by: harness v1 | source: harness.md -->

# Testing Standards

## Test Pyramid

```
        ╱  E2E  ╲          ← Few: critical user journeys only
       ╱─────────╲
      ╱Integration╲        ← Some: API contracts, DB queries, service boundaries
     ╱─────────────╲
    ╱     Unit      ╲      ← Many: pure logic, validators, helpers, models
   ╱─────────────────╲
```

- **Unit tests** form the foundation — fast, numerous, isolated.
- **Integration tests** verify boundaries (API routes, database, inter-service).
- **E2E tests** cover critical user journeys only; keep the count minimal.

## Tests-First

Every implementation follows a red-green-refactor cycle:

1. **Red** — Write a failing test that captures the requirement.
2. **Green** — Write the minimum code to make it pass.
3. **Refactor** — Clean up while keeping the test green.

The red run must be logged or evidenced before the implementation commit.

## Unit Test Rules

| Rule | Detail |
|------|--------|
| **Fast** | Each unit test completes in **< 1 second**. |
| **Hermetic** | No filesystem, network, or database access. Mock external dependencies at the boundary. |
| **Deterministic** | Seed random generators, freeze time (`freezegun` / `vi.useFakeTimers`), no network calls. Tests must produce the same result on every run. |
| **Isolated** | No shared mutable state between tests. Each test sets up and tears down its own fixtures. |

## Naming Convention

```
test_<unit>_<behavior>
```

Examples:
- `test_schedule_optimizer_respects_capacity_constraints`
- `test_demand_forecast_handles_empty_history`
- `test_parse_order_rejects_negative_quantity`

For JavaScript (vitest `describe`/`it`):
```js
describe("ScheduleOptimizer", () => {
  it("respects capacity constraints", () => { … });
});
```

## Coverage

- **Floor**: **80%** line coverage on changed files (enforced in CI via diff-coverage).
- Coverage is measured per PR, not globally. New code must meet the floor.
- Coverage reports are generated and attached to PR comments.

## Frameworks

| Language | Framework | Runner |
|----------|-----------|--------|
| JavaScript | **vitest** | `bun run test` |
| Python | **pytest** | `uv run pytest` |

## Mock Rules

- **Never mock the unit under test.** Mocks are only for external dependencies and boundaries.
- Prefer fakes and stubs over mocks when possible.
- Assert on behavior, not on implementation details.

## Forbidden Practices

> [!CAUTION]
> Any of the following will cause an automatic gate failure.

| Practice | Why It's Banned |
|----------|-----------------|
| Deleting or skipping tests to make CI green | Hides regressions. |
| Weakening assertions (e.g., `.toBeTruthy()` replacing `.toEqual(expected)`) | Reduces confidence. |
| Blind snapshot updates (`-u` without reviewing diff) | Masks unintended changes. |
| Catch-and-swallow in tests (`try { … } catch { }`) | Silences real failures. |
| Retry-until-green loops in tests | Masks flakiness, not a fix. |
| `@pytest.mark.skip` / `it.skip` without issue ref | Must link to a tracking issue. |

## Flaky Tests

- A test that fails non-deterministically is **quarantined immediately** (moved to a `quarantine/` directory or tagged `@flaky`).
- Quarantined tests do not block CI but are tracked as bugs.
- **Fix deadline**: within the current sprint. If not fixed, the owning lane escalates to Tech Lead.
- Root-cause analysis is required before un-quarantining.
