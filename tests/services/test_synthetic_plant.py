"""Unit tests for SyntheticPlantGenerator."""
import pytest
from services.synthetic_plant.generator import SyntheticPlantGenerator


def test_generator_deterministic_with_same_seed():
    gen1 = SyntheticPlantGenerator(num_presses=8, num_molds=15, num_parts=20, num_jobs=30, seed=123)
    gen2 = SyntheticPlantGenerator(num_presses=8, num_molds=15, num_parts=20, num_jobs=30, seed=123)

    data1 = gen1.generate(inject_defects=False)
    data2 = gen2.generate(inject_defects=False)

    assert data1["meta"] == data2["meta"]
    assert len(data1["presses"]) == len(data2["presses"])
    assert data1["parts"][0] == data2["parts"][0]
    assert data1["jobs"][0] == data2["jobs"][0]


def test_press_and_mold_compatibility():
    gen = SyntheticPlantGenerator(num_presses=12, num_molds=25, seed=42)
    data = gen.generate(inject_defects=False)

    presses = {p["id"]: p for p in data["presses"]}
    for mold in data["molds"]:
        assert len(mold["compatible_press_ids"]) >= 1
        for pid in mold["compatible_press_ids"]:
            assert pid in presses
            # Mold required tonnage must be <= press capacity
            assert presses[pid]["tonnage"] >= mold["required_tonnage"]


def test_changeover_matrix_properties():
    gen = SyntheticPlantGenerator(num_molds=10, seed=99)
    data = gen.generate(inject_defects=False)
    matrix = data["changeover_matrix"]

    for m1_id, row in matrix.items():
        assert row[m1_id] == 0.0  # Zero changeover for same mold
        for m2_id, setup_time in row.items():
            assert setup_time >= 0.0


def test_mes_actuals_and_defect_injection():
    gen = SyntheticPlantGenerator(num_presses=6, num_parts=10, seed=77)

    # Clean actuals
    clean_data = gen.generate(inject_defects=False)
    for rec in clean_data["historical_actuals"]:
        assert rec["observed_cycle_sec"] is not None
        assert rec["observed_cycle_sec"] > 0

    # Defective actuals
    gen_defective = SyntheticPlantGenerator(num_presses=6, num_parts=10, seed=77)
    dirty_data = gen_defective.generate(inject_defects=True)
    has_missing_or_outlier = any(
        r["observed_cycle_sec"] is None or r["observed_cycle_sec"] < 1.0 or r["observed_cycle_sec"] > 100.0
        for r in dirty_data["historical_actuals"]
    )
    assert has_missing_or_outlier, "Expected injected defects in historical runs"
