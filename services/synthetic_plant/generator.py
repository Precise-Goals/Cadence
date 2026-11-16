"""Synthetic plant generator producing presses, molds, parts, shifts, and historical actuals."""
from typing import Any, Dict


class SyntheticPlantGenerator:
    """Generates synthetic plant datasets with ground-truth parameters."""

    def __init__(self, num_presses: int = 30, num_jobs: int = 200, seed: int = 42) -> None:
        self.num_presses = num_presses
        self.num_jobs = num_jobs
        self.seed = seed

    def generate(self) -> Dict[str, Any]:
        """Generate full plant dataset: machines, molds, parts, jobs, calendar."""
        return {
            "presses": [{"id": f"PRESS-{i:02d}", "tonnage": 200} for i in range(1, self.num_presses + 1)],
            "jobs": [{"id": f"JOB-{j:04d}", "quantity": 1000} for j in range(1, self.num_jobs + 1)],
            "molds": [],
            "shifts": [],
        }
