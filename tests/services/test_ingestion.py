"""Unit tests for DataQualityPipeline."""
import pytest
from services.calibration.ingestion import DataQualityPipeline


def test_pipeline_imputes_missing_values():
    pipeline = DataQualityPipeline()
    raw = [
        {"run_id": "R1", "part_number": "PN-1", "erp_std_cycle_sec": 12.0, "observed_cycle_sec": None},
        {"run_id": "R2", "part_number": "PN-1", "erp_std_cycle_sec": 12.0, "observed_cycle_sec": 12.4},
    ]

    cleaned, report = pipeline.process_records(raw)
    assert len(cleaned) == 2
    assert report.missing_imputed == 1
    assert cleaned[0]["observed_cycle_sec"] == 12.0
    assert cleaned[0].get("_dq_imputed") is True


def test_pipeline_corrects_unit_mismatches():
    pipeline = DataQualityPipeline(min_valid_cycle_sec=2.0)
    raw = [
        # 0.25 minutes = 15.0 seconds
        {"run_id": "R1", "part_number": "PN-2", "erp_std_cycle_sec": 14.0, "observed_cycle_sec": 0.25},
        {"run_id": "R2", "part_number": "PN-2", "erp_std_cycle_sec": 14.0, "observed_cycle_sec": 14.2},
    ]

    cleaned, report = pipeline.process_records(raw)
    assert len(cleaned) == 2
    assert report.unit_mismatches_corrected == 1
    assert cleaned[0]["observed_cycle_sec"] == 15.0
    assert cleaned[0].get("_dq_unit_corrected") is True


def test_pipeline_rejects_outliers_and_duplicates():
    pipeline = DataQualityPipeline(max_valid_cycle_sec=100.0)
    raw = [
        {"run_id": "R1", "part_number": "PN-3", "observed_cycle_sec": 15.0},
        {"run_id": "R1", "part_number": "PN-3", "observed_cycle_sec": 15.0},  # Duplicate
        {"run_id": "R2", "part_number": "PN-3", "observed_cycle_sec": 450.0},  # Machine jam outlier
    ]

    cleaned, report = pipeline.process_records(raw)
    assert len(cleaned) == 1
    assert report.duplicate_records == 1
    assert report.outliers_rejected == 1
    assert cleaned[0]["run_id"] == "R1"
