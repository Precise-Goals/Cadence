"""End-to-End integration test across the full Cadence planning pipeline.

Tests the complete vertical slice:
Generate Synthetic Plant → Data Quality Pipeline → Parameter Calibration & Drift →
OR-Tools CP-SAT Scheduling → SimPy Monte Carlo Robustness Scoring → Disruption Re-solve.
"""

import pytest
from services.synthetic_plant.generator import SyntheticPlantGenerator
from services.calibration.ingestion import DataQualityPipeline
from services.calibration.drift import ParameterCalibrator, DriftDetector
from services.optimizer.solver import ScheduleOptimizer
from services.simulator.monte_carlo import MonteCarloSimulator


def test_full_cadence_vertical_slice():
    # 1. Generate Synthetic Press Plant
    generator = SyntheticPlantGenerator(
        num_presses=6,
        num_molds=10,
        num_parts=15,
        num_jobs=18,
        horizon_hours=168.0,
        seed=101,
    )
    raw_plant = generator.generate(inject_defects=True)
    assert len(raw_plant["presses"]) == 6
    assert len(raw_plant["jobs"]) == 18

    # 2. Ingestion & Data Quality Cleaning
    dq_pipeline = DataQualityPipeline()
    cleaned_actuals, dq_report = dq_pipeline.process_records(raw_plant["historical_actuals"])
    assert dq_report.clean_records > 0
    assert dq_report.quality_score >= 80.0

    # 3. Calibration & Drift Detection
    calibrator = ParameterCalibrator(drift_threshold_percent=10.0)
    calibrated_store = calibrator.calibrate(cleaned_actuals)
    assert len(calibrated_store) > 0

    detector = DriftDetector(drift_threshold_percent=10.0)
    drift_report = detector.generate_report(calibrated_store)
    assert drift_report["total_parameters_evaluated"] > 0

    # 4. Constraint Optimization (Schedule Solve)
    optimizer = ScheduleOptimizer(time_limit_seconds=8.0)
    solve_result = optimizer.solve(
        plant_data=raw_plant,
        calibrated_params=calibrated_store,
    )
    assert solve_result["is_feasible"] is True
    assert len(solve_result["schedule"]) == 18
    assert solve_result["metrics"]["otd_percent"] >= 0.0

    # 5. SimPy Monte Carlo Robustness Simulation
    simulator = MonteCarloSimulator(n_runs=20, seed=42)
    sim_result = simulator.simulate(solve_result["schedule"])
    assert sim_result["runs"] == 20
    assert "expected_otd_percent" in sim_result
    assert "fragility_index" in sim_result

    # 6. Contingency Re-solve under Machine Breakdown (What-If)
    # Simulate Press 01 failing: remove from available plant
    disrupted_plant = dict(raw_plant)
    disrupted_plant["presses"] = [p for p in raw_plant["presses"] if p["id"] != "PRESS_01"]
    disrupted_molds = []
    for m in raw_plant["molds"]:
        m_copy = dict(m)
        m_copy["compatible_press_ids"] = [pid for pid in m["compatible_press_ids"] if pid != "PRESS_01"]
        disrupted_molds.append(m_copy)
    disrupted_plant["molds"] = disrupted_molds

    contingency_result = optimizer.solve(disrupted_plant, calibrated_params=calibrated_store)
    assert contingency_result["is_feasible"] is True
    # Ensure no jobs are placed on the disabled PRESS_01
    for job in contingency_result["schedule"]:
        assert job["press_id"] != "PRESS_01"
