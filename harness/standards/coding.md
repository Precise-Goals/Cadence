<!-- generated-by: harness v1 | source: harness.md -->

# Coding Standards

## JavaScript / JSX

| Area | Standard |
|------|----------|
| **Type Safety** | Every `.js` / `.jsx` file starts with `// @ts-check`. Use JSDoc `@type`, `@param`, `@returns` for all exported functions and component props. |
| **Runtime Validation** | Validate all external inputs (API responses, form data, env vars) with **Zod** schemas. Never trust unvalidated data past a boundary. |
| **Linting** | ESLint 9 flat config (`eslint.config.js`). Zero warnings in CI. |
| **Formatting** | Prettier (defaults + `trailingComma: "all"`). Enforced via `lint-staged`. |
| **Component Naming** | PascalCase for React components (`ProductionSchedule.jsx`). |
| **File Naming** | kebab-case for all files and directories (`production-schedule.jsx`, `use-capacity.js`). |
| **Imports** | Absolute imports via `jsconfig.json` paths (e.g., `@/components/…`, `@/lib/…`). No `../../..` chains. |
| **No `any`** | `@type {any}` is forbidden. Use `@type {unknown}` and narrow, or define a proper type. |
| **No Blanket Disables** | `eslint-disable` requires a linked issue reference in a comment on the same line: `// eslint-disable-next-line rule-name -- see #1234`. |
| **Error Handling** | Always handle errors explicitly. No empty `catch` blocks. Use error boundaries for component trees. |

## Python

| Area | Standard |
|------|----------|
| **Version** | Python 3.11+. Use modern syntax (`match`, `type` aliases, `X \| Y` unions). |
| **Linting & Formatting** | **Ruff** for both linting and formatting. Zero warnings in CI. |
| **Validation** | **Pydantic v2** models for all API request/response schemas and configuration objects. |
| **Type Hints** | All function signatures must have type hints for parameters and return values. Use `typing` or `collections.abc` generics. |
| **Docstrings** | Google-style docstrings on all public functions, classes, and modules. |
| **No Blanket Noqa** | `# noqa` requires a linked issue reference: `# noqa: E501 -- see #1234`. |
| **Error Handling** | Use explicit exception types. Never bare `except:`. Log before re-raising when appropriate. |

## Both Languages

| Area | Standard |
|------|----------|
| **Meaningful Names** | Variables, functions, and classes must have descriptive, intention-revealing names. No single-letter names outside of trivial loop indices or lambdas. |
| **Small Functions** | Functions should be **< 50 lines** of logic (excluding docstrings/comments). If longer, extract helpers. |
| **No Commented-Out Code** | Dead code must be deleted, not commented out. Use version control to recover old code. |
| **Explicit Error Handling** | Every error path must be handled or explicitly propagated. No swallowed exceptions, no silent failures. Log actionable context with every error. |
| **Constants** | Magic numbers and strings must be named constants. |
| **Dependencies** | Justify every new dependency. Prefer standard library when the delta is small. |

## Enforcement

- **Pre-commit**: `lint-staged` runs ESLint, Prettier, Ruff on staged files.
- **CI (G0 gate)**: Full lint + type-check + format-check must pass before any other gate.
- **PR review**: Reviewers must flag violations; the definition of done requires zero new warnings.
