"""Unit tests for SimPy MonteCarloSimulator."""
import pytest
from services.simulator.monte_carlo import MonteCarloSimulator


def test_simulator_computes_robustness_metrics():
    simulator = MonteCarloSimulator(n_runs=20, seed=42)

    # Simple schedule with 4 jobs
    schedule = [
        {"job_id": "J1", "press_id": "PRESS_01", "duration_hours": 10.0, "due_date_hour": 15.0},
        {"job_id": "J2", "press_id": "PRESS_01", "duration_hours": 8.0, "due_date_hour": 30.0},
        {"job_id": "J3", "press_id": "PRESS_02", "duration_hours": 12.0, "due_date_hour": 14.0},
        {"job_id": "J4", "press_id": "PRESS_02", "duration_hours": 6.0, "due_date_hour": 25.0},
    ]

    result = simulator.simulate(schedule)
    assert result["runs"] == 20
    assert 0.0 <= result["expected_otd_percent"] <= 100.0
    assert 0.0 <= result["fragility_index"] <= 1.0
    assert len(result["bottlenecks"]) <= 3


def test_simulator_handles_empty_schedule():
    simulator = MonteCarloSimulator(n_runs=5)
    result = simulator.simulate([])
    assert result["runs"] == 0
    assert result["expected_otd_percent"] == 100.0
