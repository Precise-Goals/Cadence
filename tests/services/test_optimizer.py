"""Unit tests for OR-Tools CP-SAT ScheduleOptimizer."""
import pytest
from services.synthetic_plant.generator import SyntheticPlantGenerator
from services.optimizer.solver import ScheduleOptimizer


def test_optimizer_produces_feasible_schedule():
    gen = SyntheticPlantGenerator(num_presses=4, num_molds=8, num_parts=12, num_jobs=15, seed=42)
    plant_data = gen.generate(inject_defects=False)

    optimizer = ScheduleOptimizer(time_limit_seconds=10.0, num_workers=2)
    result = optimizer.solve(plant_data)

    assert result["is_feasible"] is True
    assert result["status"] in ("OPTIMAL", "FEASIBLE")
    assert len(result["schedule"]) == 15
    assert result["metrics"]["otd_percent"] >= 0.0


def test_optimizer_respects_mold_press_compatibility():
    gen = SyntheticPlantGenerator(num_presses=4, num_molds=6, num_parts=8, num_jobs=10, seed=101)
    plant_data = gen.generate(inject_defects=False)
    molds_map = {m["id"]: m for m in plant_data["molds"]}

    optimizer = ScheduleOptimizer(time_limit_seconds=5.0)
    result = optimizer.solve(plant_data)

    for item in result["schedule"]:
        mold = molds_map[item["mold_id"]]
        assert item["press_id"] in mold["compatible_press_ids"]


def test_no_overlap_on_any_press():
    gen = SyntheticPlantGenerator(num_presses=3, num_molds=5, num_parts=6, num_jobs=12, seed=77)
    plant_data = gen.generate(inject_defects=False)

    optimizer = ScheduleOptimizer(time_limit_seconds=5.0)
    result = optimizer.solve(plant_data)

    # Group schedule items by press
    press_jobs = {}
    for item in result["schedule"]:
        press_jobs.setdefault(item["press_id"], []).append(item)

    for press_id, items in press_jobs.items():
        sorted_items = sorted(items, key=lambda x: x["start_hour"])
        for i in range(len(sorted_items) - 1):
            curr_end = sorted_items[i]["end_hour"]
            next_start = sorted_items[i + 1]["start_hour"]
            assert curr_end <= next_start + 1e-4, f"Overlap on {press_id}: {sorted_items[i]} and {sorted_items[i+1]}"
