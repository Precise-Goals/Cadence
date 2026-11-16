<!-- generated-by: harness v1 | source: prompt.md §5.2 -->
# Sandbox Rules

## Allowed directories
- Repo root: `D:\Workspace\Projects\teaicup`
- Temp: `./tmp`, `./.next`, `./node_modules/.cache`
- Build output: `./.next`, `./dist`

## Allowed commands
Only commands from harness.md §8 plus read-only inspection:
- `ls`, `cat`, `head`, `tail`, `grep`, `rg`, `jq`, `wc`
- `git status`, `git diff`, `git log`, `git branch`
- `bun install`, `bun run dev|build|lint|test`, `bunx ...`
- `uv sync`, `uv run ...`
- `python scripts/check_harness.py`

## Forbidden
- No network except: registry.npmjs.org, pypi.org, github.com, openrouter.ai
- No `rm -rf` outside `./tmp` or build output
- No `sudo`
- No secrets in logs; redact `*_KEY`, `*_TOKEN`, `*_SECRET`
- Per-command timeout: 120s
- Per-session wall-clock budget: from budgets.json

## Logging
Every command + exit code → `harness/logs/events.jsonl`
