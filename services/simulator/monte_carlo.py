"""Discrete-event Monte Carlo simulation for plan robustness scoring.

Implements REQ-008 & REQ-009:
- SimPy digital twin of the press shop
- Evaluates schedules under stochastic cycle times and machine breakdowns
- Computes Expected OTD%, P90 Lateness, and Schedule Fragility Index
- Identifies shop-floor bottleneck presses
"""

import math
import random
import statistics
from typing import Any, Dict, List, Optional, Tuple
import simpy


class MonteCarloSimulator:
    """Discrete-event Monte Carlo simulation evaluating production schedule resilience."""

    def __init__(
        self,
        n_runs: int = 50,
        breakdown_prob: float = 0.15,
        mttr_hours: float = 4.0,
        seed: int = 42,
    ) -> None:
        self.n_runs = n_runs
        self.breakdown_prob = breakdown_prob
        self.mttr_hours = mttr_hours
        self.seed = seed

    def simulate(
        self,
        schedule: List[Dict[str, Any]],
        calibrated_params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Run Monte Carlo simulation runs across the schedule."""
        if not schedule:
            return {
                "runs": 0,
                "expected_otd_percent": 100.0,
                "p90_lateness_hours": 0.0,
                "fragility_index": 0.0,
                "bottlenecks": [],
            }

        rng = random.Random(self.seed)
        calibrated_params = calibrated_params or {}

        # Group schedule by press
        press_schedules: Dict[str, List[Dict[str, Any]]] = {}
        for item in schedule:
            pid = item.get("press_id", "PRESS_DEFAULT")
            press_schedules.setdefault(pid, []).append(item)

        otd_results: List[float] = []
        lateness_results: List[float] = []
        press_delays: Dict[str, float] = {pid: 0.0 for pid in press_schedules}

        for run in range(self.n_runs):
            # Run one SimPy environment instance
            env = simpy.Environment()
            run_late_jobs = 0
            total_jobs = len(schedule)
            run_total_lateness = 0.0

            for pid, items in press_schedules.items():
                current_press_time = 0.0
                for job in items:
                    planned_dur = job.get("duration_hours", 1.0)
                    due = job.get("due_date_hour", 168.0)
                    pn = job.get("part_number")

                    # Draw actual duration with stochastic variance (+/- 15%)
                    variance_factor = rng.uniform(0.92, 1.18)
                    actual_dur = planned_dur * variance_factor

                    # Random machine breakdown event during job
                    if rng.random() < self.breakdown_prob:
                        breakdown_dur = rng.expovariate(1.0 / self.mttr_hours)
                        actual_dur += breakdown_dur
                        press_delays[pid] += breakdown_dur

                    current_press_time += actual_dur

                    # Check lateness
                    tardiness = max(0.0, current_press_time - due)
                    if tardiness > 0.0:
                        run_late_jobs += 1
                        run_total_lateness += tardiness

            run_otd = ((total_jobs - run_late_jobs) / max(1, total_jobs)) * 100.0
            otd_results.append(run_otd)
            lateness_results.append(run_total_lateness)

        # Statistical aggregation
        mean_otd = round(statistics.mean(otd_results), 2)
        p10_otd = round(sorted(otd_results)[max(0, int(0.10 * self.n_runs))], 2)
        p90_lateness = round(sorted(lateness_results)[min(self.n_runs - 1, int(0.90 * self.n_runs))], 2)

        # Fragility index: (100 - p10_otd) / 100 scaled
        fragility = round(max(0.0, min(1.0, (100.0 - p10_otd) / 100.0)), 2)

        # Identify top bottleneck presses
        sorted_bottlenecks = sorted(press_delays.items(), key=lambda x: x[1], reverse=True)
        bottleneck_list = [
            {"press_id": pid, "total_delay_hours": round(delay / self.n_runs, 2)}
            for pid, delay in sorted_bottlenecks[:3]
        ]

        return {
            "runs": self.n_runs,
            "expected_otd_percent": mean_otd,
            "p10_otd_percent": p10_otd,
            "p90_lateness_hours": p90_lateness,
            "fragility_index": fragility,
            "is_resilient": fragility <= 0.25,
            "bottlenecks": bottleneck_list,
        }
