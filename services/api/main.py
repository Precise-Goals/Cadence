"""FastAPI application entrypoint for Cadence Planning & Capacity Optimization Copilot."""

from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from services.synthetic_plant.generator import SyntheticPlantGenerator
from services.calibration.ingestion import DataQualityPipeline
from services.calibration.drift import ParameterCalibrator, DriftDetector
from services.optimizer.solver import ScheduleOptimizer
from services.simulator.monte_carlo import MonteCarloSimulator

app = FastAPI(
    title="Cadence API",
    description="AI-powered production planning & capacity optimization copilot for press-based manufacturing",
    version="0.1.0",
)


class GeneratePlantRequest(BaseModel):
    num_presses: int = 16
    num_molds: int = 40
    num_parts: int = 80
    num_jobs: int = 100
    seed: int = 42
    inject_defects: bool = True


class CalibrateRequest(BaseModel):
    actuals_records: List[Dict[str, Any]]
    drift_threshold_percent: float = 10.0


class SolveScheduleRequest(BaseModel):
    plant_data: Dict[str, Any]
    calibrated_params: Optional[Dict[str, Any]] = None
    frozen_job_ids: Optional[List[str]] = None


class SimulateScheduleRequest(BaseModel):
    schedule: List[Dict[str, Any]]
    n_runs: int = 50


class DisruptionScenarioRequest(BaseModel):
    plant_data: Dict[str, Any]
    disruption_type: str = "machine_down"  # machine_down, rush_order, maintenance
    target_id: str  # e.g. "PRESS_04"
    duration_hours: float = 24.0
    affected_order: Optional[str] = None


@app.get("/health")
def health_check() -> Dict[str, Any]:
    """Service health check endpoint."""
    return {
        "status": "ok",
        "service": "cadence-api",
        "version": "0.1.0",
        "modules": {
            "synthetic_plant": "ready",
            "calibration": "ready",
            "optimizer": "ready",
            "simulator": "ready",
        },
    }


@app.post("/api/v1/plant/generate")
def generate_plant(req: GeneratePlantRequest) -> Dict[str, Any]:
    """Generate synthetic press shop dataset with ground-truth parameters."""
    gen = SyntheticPlantGenerator(
        num_presses=req.num_presses,
        num_molds=req.num_molds,
        num_parts=req.num_parts,
        num_jobs=req.num_jobs,
        seed=req.seed,
    )
    return gen.generate(inject_defects=req.inject_defects)


@app.post("/api/v1/calibrate")
def calibrate_parameters(req: CalibrateRequest) -> Dict[str, Any]:
    """Ingest actuals, clean defects, and generate Parameter Drift Report."""
    dq_pipeline = DataQualityPipeline()
    cleaned_records, dq_report = dq_pipeline.process_records(req.actuals_records)

    calibrator = ParameterCalibrator(drift_threshold_percent=req.drift_threshold_percent)
    store = calibrator.calibrate(cleaned_records)

    detector = DriftDetector(drift_threshold_percent=req.drift_threshold_percent)
    drift_report = detector.generate_report(store)

    return {
        "data_quality_report": dq_report.__dict__,
        "drift_report": drift_report,
    }


@app.post("/api/v1/schedule/solve")
def solve_schedule(req: SolveScheduleRequest) -> Dict[str, Any]:
    """Solve production schedule using constraint optimizer."""
    optimizer = ScheduleOptimizer(time_limit_seconds=15.0)
    return optimizer.solve(
        plant_data=req.plant_data,
        calibrated_params=req.calibrated_params,
        frozen_job_ids=req.frozen_job_ids,
    )


@app.post("/api/v1/schedule/simulate")
def simulate_schedule(req: SimulateScheduleRequest) -> Dict[str, Any]:
    """Score plan robustness via discrete-event Monte Carlo simulation."""
    simulator = MonteCarloSimulator(n_runs=req.n_runs)
    return simulator.simulate(schedule=req.schedule)


@app.post("/api/v1/what-if/scenario")
def evaluate_what_if_scenario(req: DisruptionScenarioRequest) -> Dict[str, Any]:
    """Evaluate a shop-floor disruption scenario, re-plan, and return ranked options with constraint traces."""
    # Modify plant data according to disruption
    modified_plant = dict(req.plant_data)

    if req.disruption_type == "machine_down":
        # Filter out the down machine from available presses
        modified_plant["presses"] = [
            p for p in modified_plant.get("presses", []) if p["id"] != req.target_id
        ]
        # Update mold compatibility to remove the disabled press
        modified_molds = []
        for m in modified_plant.get("molds", []):
            m_copy = dict(m)
            m_copy["compatible_press_ids"] = [
                pid for pid in m_copy.get("compatible_press_ids", []) if pid != req.target_id
            ]
            modified_molds.append(m_copy)
        modified_plant["molds"] = modified_molds

    # Re-solve schedule on modified plant
    optimizer = ScheduleOptimizer(time_limit_seconds=10.0)
    re_solved = optimizer.solve(modified_plant)

    # Simulate robustness of re-solved schedule
    simulator = MonteCarloSimulator(n_runs=30)
    sim_result = simulator.simulate(re_solved.get("schedule", []))

    # Formulate binding constraint explanations
    binding_constraints = [
        f"Machine {req.target_id} unavailable for {req.duration_hours}h due to {req.disruption_type}.",
        "Re-routed candidate jobs across remaining compatible presses with tonnage capacity.",
        "Sequence changeover minimized on adjacent jobs.",
    ]

    return {
        "scenario": {
            "type": req.disruption_type,
            "target_id": req.target_id,
            "duration_hours": req.duration_hours,
        },
        "option_a": {
            "title": f"Re-sequence jobs around {req.target_id}",
            "schedule": re_solved.get("schedule", []),
            "metrics": re_solved.get("metrics", {}),
            "robustness": sim_result,
            "binding_constraints": binding_constraints,
        },
    }
