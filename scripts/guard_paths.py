#!/usr/bin/env python3
"""Lane/path guard. Given a role and git diff --name-only, exit non-zero if any
file is outside the role's allow-list or the lane's ownership lock."""
import json, sys, yaml
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_role_paths(role_name):
    """Extract allowed paths from the role file."""
    role_file = ROOT / "harness" / "roles" / f"{role_name}.md"
    if not role_file.exists():
        return []
    text = role_file.read_text(encoding="utf-8")
    in_section = False
    paths = []
    for line in text.splitlines():
        if line.strip().lower().startswith("## allowed paths") or line.strip().lower().startswith("# allowed paths"):
            in_section = True
            continue
        if in_section and line.strip().startswith("#"):
            break
        if in_section and line.strip().startswith("- "):
            path = line.strip().lstrip("- ").strip("`").strip()
            if path:
                paths.append(path)
    return paths


def load_lane_locks(lane_name):
    """Load owned paths for a lane from locks/."""
    lock_file = ROOT / "harness" / "state" / "locks" / f"{lane_name}.json"
    if not lock_file.exists():
        return None  # No lock = no restriction beyond role
    data = json.loads(lock_file.read_text(encoding="utf-8"))
    return data.get("owns", [])


def path_matches(file_path, pattern):
    """Check if a file path matches an allow-list pattern (supports ** glob)."""
    if pattern.endswith("/**"):
        prefix = pattern[:-3]
        return file_path.startswith(prefix) or file_path == prefix.rstrip("/")
    if pattern.endswith("/*"):
        prefix = pattern[:-2]
        return file_path.startswith(prefix) and "/" not in file_path[len(prefix):]
    return file_path == pattern


def check(role, files, lane=None):
    """Return list of violations."""
    allowed = load_role_paths(role)
    if not allowed:
        return [f"no allow-list found for role '{role}'"]

    violations = []
    for f in files:
        if not any(path_matches(f, p) for p in allowed):
            violations.append(f"GUARD VIOLATION: {role} wrote to {f} (not in allow-list)")

    if lane:
        lock_paths = load_lane_locks(lane)
        if lock_paths is not None:
            for f in files:
                if not any(path_matches(f, p) for p in lock_paths):
                    violations.append(f"LANE VIOLATION: lane '{lane}' wrote to {f} (not in lock)")

    return violations


def main():
    if len(sys.argv) < 3:
        print("Usage: guard_paths.py <role> <file1> [file2 ...] [--lane <lane>]")
        return 1

    role = sys.argv[1]
    lane = None
    files = []
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == "--lane" and i + 1 < len(sys.argv):
            lane = sys.argv[i + 1]
            i += 2
        else:
            files.append(sys.argv[i])
            i += 1

    violations = check(role, files, lane)
    for v in violations:
        print(v)
    return 1 if violations else 0


if __name__ == "__main__":
    sys.exit(main())
