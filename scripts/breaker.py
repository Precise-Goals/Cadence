#!/usr/bin/env python3
"""Circuit breaker. Checks budgets and trip conditions."""
import hashlib, json, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_state():
    p = ROOT / "harness" / "state" / "state.json"
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return {}


def load_budgets():
    p = ROOT / "harness" / "state" / "budgets.json"
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return {}


def failure_signature(failing_tests, error_text):
    """Hash of failing test names + error text for identical-failure detection."""
    content = "|".join(sorted(failing_tests)) + "||" + error_text.strip()
    return hashlib.sha256(content.encode()).hexdigest()[:16]


def check_stage_retries(state, budgets):
    """Trip if same stage failed > max_stage_retries."""
    attempts = state.get("attempts", {})
    stage = state.get("current_stage", "")
    max_retries = budgets.get("max_stage_retries", 3)
    count = attempts.get(stage, 0)
    if count > max_retries:
        return f"Stage '{stage}' failed {count} times (max {max_retries})"
    return None


def check_identical_failures(failures_log, budgets):
    """Trip if same failure signature repeated max_identical_failures times."""
    max_identical = budgets.get("max_identical_failures", 2)
    # Parse signatures from failures.log.md
    p = ROOT / "harness" / "logs" / "failures.log.md"
    if not p.exists():
        return None
    text = p.read_text(encoding="utf-8")
    sigs = {}
    for line in text.splitlines():
        if "signature=" in line:
            sig = line.split("signature=")[1].split()[0].strip()
            sigs[sig] = sigs.get(sig, 0) + 1
    for sig, count in sigs.items():
        if count >= max_identical:
            return f"Identical failure signature {sig} repeated {count} times (max {max_identical})"
    return None


def check_diff_size(diff_lines, diff_files, budgets):
    """Trip if diff exceeds size limits."""
    max_lines = budgets.get("max_diff_lines_per_lane", 400)
    max_files = budgets.get("max_files_per_lane", 15)
    if diff_lines > max_lines:
        return f"Diff has {diff_lines} lines (max {max_lines}) — probable scope creep"
    if diff_files > max_files:
        return f"Diff touches {diff_files} files (max {max_files}) — probable scope creep"
    return None


def check_no_progress(state, budgets):
    """Trip if last N iterations did not reduce failing test count."""
    window = budgets.get("no_progress_window", 3)
    # This would need to track test counts across iterations in state
    # For now, check if attempts exceed window without stage advancement
    attempts = state.get("attempts", {})
    stage = state.get("current_stage", "")
    if attempts.get(stage, 0) >= window:
        last_gate = state.get("last_gate", {})
        if last_gate.get("status") == "fail":
            return f"No progress: {window} iterations without advancing past '{stage}'"
    return None


def trip(state, reason):
    """Set breaker to tripped and update state."""
    state["breaker"] = {"tripped": True, "reason": reason}
    state_path = ROOT / "harness" / "state" / "state.json"
    state_path.write_text(json.dumps(state, indent=2), encoding="utf-8")

    # Log to failures
    failures_path = ROOT / "harness" / "logs" / "failures.log.md"
    with open(failures_path, "a", encoding="utf-8") as f:
        f.write(f"\n### BREAKER TRIPPED\n- Reason: {reason}\n- Stage: {state.get('current_stage')}\n- Task: {state.get('task_id')}\n\n")


def main():
    state = load_state()
    budgets = load_budgets()

    if state.get("breaker", {}).get("tripped"):
        print(f"BREAKER ALREADY TRIPPED: {state['breaker'].get('reason')}")
        return 1

    # Run checks
    checks = [
        check_stage_retries(state, budgets),
        check_identical_failures(None, budgets),
        check_no_progress(state, budgets),
    ]

    # Check diff size if provided as args
    if len(sys.argv) >= 3:
        try:
            diff_lines = int(sys.argv[1])
            diff_files = int(sys.argv[2])
            checks.append(check_diff_size(diff_lines, diff_files, budgets))
        except ValueError:
            pass

    for result in checks:
        if result:
            trip(state, result)
            print(f"BREAKER TRIPPED: {result}")
            return 1

    print("BREAKER OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
