"""Unit tests for FastAPI endpoints."""
import pytest
from services.api.main import (
    health_check,
    generate_plant,
    calibrate_parameters,
    evaluate_what_if_scenario,
    GeneratePlantRequest,
    CalibrateRequest,
    DisruptionScenarioRequest,
)


def test_health_check_endpoint():
    data = health_check()
    assert data["status"] == "ok"
    assert data["modules"]["optimizer"] == "ready"


def test_generate_plant_endpoint():
    req = GeneratePlantRequest(
        num_presses=4,
        num_molds=6,
        num_parts=8,
        num_jobs=10,
        seed=42,
        inject_defects=False,
    )
    data = generate_plant(req)
    assert len(data["presses"]) == 4
    assert len(data["jobs"]) == 10


def test_calibrate_endpoint():
    req = CalibrateRequest(
        actuals_records=[
            {"part_number": "PN-101", "press_id": "P1", "erp_std_cycle_sec": 10.0, "observed_cycle_sec": 12.5},
            {"part_number": "PN-101", "press_id": "P1", "erp_std_cycle_sec": 10.0, "observed_cycle_sec": 12.6},
        ],
        drift_threshold_percent=10.0,
    )
    data = calibrate_parameters(req)
    assert "data_quality_report" in data
    assert "drift_report" in data
    assert data["data_quality_report"]["total_records"] == 2


def test_what_if_scenario_endpoint():
    gen_req = GeneratePlantRequest(
        num_presses=4, num_molds=6, num_parts=8, num_jobs=10, seed=42
    )
    plant_data = generate_plant(gen_req)

    scenario_req = DisruptionScenarioRequest(
        plant_data=plant_data,
        disruption_type="machine_down",
        target_id="PRESS_01",
        duration_hours=24.0,
    )
    data = evaluate_what_if_scenario(scenario_req)
    assert "option_a" in data
    assert len(data["option_a"]["schedule"]) > 0
    # PRESS_01 must not be in schedule since it was down
    for job in data["option_a"]["schedule"]:
        assert job["press_id"] != "PRESS_01"
