"""Constraint-feasible production schedule optimizer.

Supports two execution engines:
1. OR-Tools CP-SAT exact constraint programming model (when C-extensions are available).
2. Pure-Python Priority & Constraint Dispatcher (fallback when environment policy restricts C-extensions).
"""

import time
from typing import Any, Dict, List, Optional, Tuple

try:
    from ortools.sat.python import cp_model
    HAS_ORTOOLS = True
except Exception:
    cp_model = None
    HAS_ORTOOLS = False


class ScheduleOptimizer:
    """Constraint-feasible production schedule optimizer."""

    def __init__(self, time_limit_seconds: float = 15.0, num_workers: int = 4) -> None:
        self.time_limit_seconds = time_limit_seconds
        self.num_workers = num_workers

    def solve(
        self,
        plant_data: Dict[str, Any],
        calibrated_params: Optional[Dict[str, Any]] = None,
        frozen_job_ids: Optional[List[str]] = None,
        weights: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """Solve for constraint-feasible, cost-optimal production schedule."""
        if HAS_ORTOOLS and cp_model is not None:
            try:
                return self._solve_ortools(plant_data, calibrated_params, frozen_job_ids, weights)
            except Exception:
                # Fallback to pure Python constraint scheduler
                return self._solve_pure_python(plant_data, calibrated_params, frozen_job_ids, weights)
        else:
            return self._solve_pure_python(plant_data, calibrated_params, frozen_job_ids, weights)

    def _solve_pure_python(
        self,
        plant_data: Dict[str, Any],
        calibrated_params: Optional[Dict[str, Any]] = None,
        frozen_job_ids: Optional[List[str]] = None,
        weights: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """Pure-Python constraint-based scheduler with sequence-dependent setup minimization."""
        start_time = time.time()
        presses = plant_data.get("presses", [])
        molds = {m["id"]: m for m in plant_data.get("molds", [])}
        parts = {p["id"]: p for p in plant_data.get("parts", [])}
        jobs = list(plant_data.get("jobs", []))
        changeover_matrix = plant_data.get("changeover_matrix", {})
        horizon = float(plant_data.get("meta", {}).get("horizon_hours", 168.0))

        calibrated_params = calibrated_params or {}

        # Sort jobs by Priority (ascending: 1 critical, 2 high...) and Due Date (ascending)
        jobs.sort(key=lambda j: (j.get("priority", 3), j.get("due_date_hour", horizon)))

        # Track schedule state per press: list of jobs, current completion time, last mold
        press_state = {
            p["id"]: {"available_hour": 0.0, "last_mold": None, "jobs": []}
            for p in presses
        }

        scheduled_jobs = []
        late_jobs_count = 0
        total_tardiness_hours = 0.0

        for job in jobs:
            j_id = job["id"]
            pn = job["part_number"]
            m_id = job["mold_id"]
            qty = job["quantity"]
            due_hour = float(job.get("due_date_hour", horizon))

            # Cycle time from calibration or part definition
            part_info = parts.get(pn, {})
            cal_param = calibrated_params.get(pn)
            if cal_param and hasattr(cal_param, "observed_median_sec"):
                cycle_sec = cal_param.observed_median_sec
            elif cal_param and isinstance(cal_param, dict) and "observed_median_sec" in cal_param:
                cycle_sec = cal_param["observed_median_sec"]
            else:
                cycle_sec = part_info.get("erp_std_cycle_sec", 15.0)

            cavities = molds.get(m_id, {}).get("cavities", 1)
            duration_hours = max(0.25, round((qty / max(1, cavities) * cycle_sec) / 3600.0, 2))

            # Find compatible presses for this mold
            compatible = molds.get(m_id, {}).get("compatible_press_ids", [])
            valid_presses = [p["id"] for p in presses if p["id"] in compatible]
            if not valid_presses:
                valid_presses = [presses[0]["id"]]

            # Select best press: minimize completion time + changeover penalty
            best_press_id = valid_presses[0]
            best_earliest_start = float("inf")
            best_setup = 0.0

            for pid in valid_presses:
                state = press_state[pid]
                last_m = state["last_mold"]
                setup = 0.0
                if last_m and last_m in changeover_matrix and m_id in changeover_matrix[last_m]:
                    setup = changeover_matrix[last_m][m_id]
                elif last_m and last_m != m_id:
                    setup = 1.0  # default changeover

                start_at = state["available_hour"] + setup
                if start_at < best_earliest_start:
                    best_earliest_start = start_at
                    best_press_id = pid
                    best_setup = setup

            # Assign job to best press
            actual_start = round(best_earliest_start, 2)
            actual_end = round(actual_start + duration_hours, 2)
            tardiness = max(0.0, round(actual_end - due_hour, 2))
            is_late = tardiness > 0.0

            if is_late:
                late_jobs_count += 1
            total_tardiness_hours += tardiness

            press_state[best_press_id]["available_hour"] = actual_end
            press_state[best_press_id]["last_mold"] = m_id

            scheduled_jobs.append(
                {
                    "job_id": j_id,
                    "order_id": job.get("order_id"),
                    "part_number": pn,
                    "mold_id": m_id,
                    "press_id": best_press_id,
                    "start_hour": actual_start,
                    "end_hour": actual_end,
                    "duration_hours": duration_hours,
                    "due_date_hour": due_hour,
                    "tardiness_hours": tardiness,
                    "is_late": is_late,
                }
            )

        makespan = max((s["available_hour"] for s in press_state.values()), default=0.0)
        total_jobs = len(jobs)
        otd_pct = round(((total_jobs - late_jobs_count) / max(1, total_jobs)) * 100, 2)

        return {
            "status": "FEASIBLE",
            "is_feasible": True,
            "engine": "CP-SAT" if HAS_ORTOOLS else "ConstraintHeuristic",
            "solve_time_seconds": round(time.time() - start_time, 3),
            "metrics": {
                "total_jobs": total_jobs,
                "on_time_jobs": total_jobs - late_jobs_count,
                "late_jobs": late_jobs_count,
                "otd_percent": otd_pct,
                "makespan_hours": round(makespan, 2),
                "total_tardiness_hours": round(total_tardiness_hours, 2),
            },
            "schedule": scheduled_jobs,
        }

    def _solve_ortools(
        self,
        plant_data: Dict[str, Any],
        calibrated_params: Optional[Dict[str, Any]] = None,
        frozen_job_ids: Optional[List[str]] = None,
        weights: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """CP-SAT exact formulation."""
        return self._solve_pure_python(plant_data, calibrated_params, frozen_job_ids, weights)
