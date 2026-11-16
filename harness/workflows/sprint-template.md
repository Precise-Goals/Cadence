<!-- generated-by: harness v1 | source: harness.md -->

# Sprint Template

## Sprint Header

| Field | Value |
|-------|-------|
| **Sprint ID** | `S-XXXX` |
| **Sprint Goal** | _One sentence describing the sprint's primary outcome._ |
| **Start Date** | `YYYY-MM-DD` |
| **End Date** | `YYYY-MM-DD` |
| **Status** | `planned` \| `active` \| `completed` \| `cancelled` |

## Tasks

| Task ID | Title | Priority | Lanes | Status | Assignee |
|---------|-------|----------|-------|--------|----------|
| T-XXXX | _Short title_ | P0–P3 | _Lane count_ | `todo` \| `in-progress` \| `done` \| `blocked` | _Role/agent_ |

## Parallel Lanes

Define the parallel lanes for each task. Reference [parallel-lanes.md](./parallel-lanes.md) for rules.

| Task ID | Lane | Branch | Owner | Files Owned |
|---------|------|--------|-------|-------------|
| T-XXXX | `solver-engine` | `lane/T-XXXX-solver-engine` | Builder-Solver | `services/solver/src/` |
| T-XXXX | `api-routes` | `lane/T-XXXX-api-routes` | Builder-API | `app/api/` |
| T-XXXX | `ui-components` | `lane/T-XXXX-ui-components` | Builder-UI | `components/`, `app/(routes)/` |

## Exit Gate

The sprint is complete when:
- [ ] All tasks reach **Done** per [definition-of-done.md](../standards/definition-of-done.md).
- [ ] No unresolved blockers.
- [ ] `lessons.md` updated with sprint retrospective notes.
- [ ] `state.json` reflects final sprint status.

---

## Sprint Cycle

### Phase 1: Plan

1. **Orchestrator** receives task requests and creates `01-task.md` for each.
2. **Product Owner** writes `02-spec.md` with acceptance criteria.
3. **Designer** adds wireframes and UI specs to `02-spec.md`.
4. **Tech Lead** produces `03-plan.md` with:
   - Architecture decisions
   - Ownership map (file → lane assignments)
   - Dependency order
   - Risk assessment
5. **Test Author** writes `04-tests.md` and test stubs.

### Phase 2: Execute

6. **Builders** work in parallel lanes per `03-plan.md`.
   - Each lane: implement → pass G1 → handoff.
7. **Orchestrator** merges all lanes → G2.
8. **Reviewer**, **Security**, **Scribe** run in parallel → G3.
9. **QA** runs acceptance tests → G4.

### Phase 3: Review

10. **Librarian** archives artifacts, updates `lessons.md`.
11. All gates verified, task marked **Done**.

### Phase 4: Retro

12. Team reviews:
    - What went well?
    - What caused delays or rework?
    - What process improvements to adopt?
13. Update `lessons.md` and harness standards if needed.

---

## Default Sprint Plan

> [!NOTE]
> This is the default plan structure from the harness. Adapt task count and lane assignments to the sprint's scope.

```
Sprint S-XXXX: "<Sprint Goal>"

Day 1:    Plan (Phases 1)
          - Task definition, spec, design, planning, test authoring
          - Output: 01-task.md through 04-tests.md for all tasks

Day 2-N:  Execute (Phase 2)
          - Parallel builder lanes (max 5 concurrent)
          - G1 per lane → Merge → G2
          - Review ‖ Security ‖ Scribe → G3
          - QA → G4

Day N+1:  Review & Retro (Phases 3-4)
          - Librarian archives
          - Retrospective
          - Lessons captured
```
