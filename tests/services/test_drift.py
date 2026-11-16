"""Unit tests for ParameterCalibrator and DriftDetector."""
import pytest
from services.calibration.drift import ParameterCalibrator, DriftDetector


def test_parameter_calibrator_fits_distributions():
    calibrator = ParameterCalibrator(drift_threshold_percent=10.0)
    actuals = [
        {"part_number": "PN-101", "press_id": "PRESS_01", "erp_std_cycle_sec": 10.0, "observed_cycle_sec": 10.2, "yield_percent": 99.0},
        {"part_number": "PN-101", "press_id": "PRESS_01", "erp_std_cycle_sec": 10.0, "observed_cycle_sec": 9.8, "yield_percent": 98.0},
        {"part_number": "PN-101", "press_id": "PRESS_01", "erp_std_cycle_sec": 10.0, "observed_cycle_sec": 10.0, "yield_percent": 98.5},
    ]

    store = calibrator.calibrate(actuals)
    assert "PN-101" in store
    param = store["PN-101"]
    assert param.sample_count == 3
    assert param.observed_mean_sec == 10.0
    assert param.observed_median_sec == 10.0
    assert not param.has_drift
    assert param.status == "ALIGNED"


def test_drift_detection_flags_drifted_parameters():
    calibrator = ParameterCalibrator(drift_threshold_percent=10.0)
    # ERP says 12.0s, reality is ~15.0s (+25% drift) with n=20 samples
    actuals = [
        {"part_number": "PN-1043", "press_id": "PRESS_04", "erp_std_cycle_sec": 12.0, "observed_cycle_sec": 15.0 + (i % 3) * 0.2}
        for i in range(25)
    ]

    store = calibrator.calibrate(actuals)
    detector = DriftDetector(drift_threshold_percent=10.0)
    report = detector.generate_report(store)

    assert report["total_parameters_evaluated"] == 1
    assert report["drift_count"] == 1
    item = report["drifted_items"][0]
    assert item["part_number"] == "PN-1043"
    assert item["drift_percent"] > 20.0
    assert item["status"] == "DRIFT_CRITICAL"
