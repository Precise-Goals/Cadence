"""Synthetic plant generator producing presses, molds, parts, shifts, and historical actuals.

Models a TE Connectivity-style press and molding facility:
- Multi-tonnage presses (100T, 250T, 400T, 800T)
- Mold/tool compatibility constraints
- Part numbers with ERP standard vs true ground-truth cycle times
- Sequence-dependent changeover matrix
- Jobs with order quantities, due dates, priorities, and batch constraints
- Historical MES actual runs with configurable data quality defects
"""

import math
import random
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple


@dataclass
class Press:
    id: str
    name: str
    tonnage: int
    hourly_rate: float
    max_mold_tonnage: int


@dataclass
class Mold:
    id: str
    name: str
    required_tonnage: int
    compatible_press_ids: List[str]
    cavities: int


@dataclass
class PartNumber:
    id: str
    name: str
    mold_id: str
    erp_std_cycle_sec: float
    true_mean_cycle_sec: float
    true_std_cycle_sec: float
    material: str


@dataclass
class Job:
    id: str
    order_id: str
    part_number: str
    mold_id: str
    quantity: int
    due_date_hour: float
    priority: int  # 1 = critical, 2 = high, 3 = medium, 4 = low
    release_date_hour: float = 0.0


class SyntheticPlantGenerator:
    """Generates synthetic press-based manufacturing plants with realistic constraints."""

    def __init__(
        self,
        num_presses: int = 16,
        num_molds: int = 40,
        num_parts: int = 100,
        num_jobs: int = 120,
        horizon_hours: float = 168.0,  # 7 days
        seed: int = 42,
    ) -> None:
        self.num_presses = num_presses
        self.num_molds = num_molds
        self.num_parts = num_parts
        self.num_jobs = num_jobs
        self.horizon_hours = horizon_hours
        self.seed = seed
        self.rng = random.Random(seed)

    def generate(self, inject_defects: bool = True) -> Dict[str, Any]:
        """Generate complete plant dataset."""
        presses = self._generate_presses()
        molds = self._generate_molds(presses)
        parts = self._generate_parts(molds)
        changeover_matrix = self._generate_changeover_matrix(molds)
        jobs = self._generate_jobs(parts, molds)
        actuals = self._generate_mes_actuals(parts, presses, molds, inject_defects=inject_defects)

        return {
            "meta": {
                "plant_name": "TE Connector & Molding Facility",
                "horizon_hours": self.horizon_hours,
                "seed": self.seed,
                "press_count": len(presses),
                "mold_count": len(molds),
                "part_count": len(parts),
                "job_count": len(jobs),
            },
            "presses": [p.__dict__ for p in presses],
            "molds": [m.__dict__ for m in molds],
            "parts": [p.__dict__ for p in parts],
            "changeover_matrix": changeover_matrix,
            "jobs": [j.__dict__ for j in jobs],
            "historical_actuals": actuals,
        }

    def _generate_presses(self) -> List[Press]:
        presses = []
        tonnage_classes = [100, 250, 400, 800]
        rates = {100: 45.0, 250: 65.0, 400: 95.0, 800: 150.0}

        for i in range(1, self.num_presses + 1):
            tonnage = tonnage_classes[(i - 1) % len(tonnage_classes)]
            presses.append(
                Press(
                    id=f"PRESS_{i:02d}",
                    name=f"Press Line {i:02d} ({tonnage}T)",
                    tonnage=tonnage,
                    hourly_rate=rates[tonnage],
                    max_mold_tonnage=tonnage,
                )
            )
        return presses

    def _generate_molds(self, presses: List[Press]) -> List[Mold]:
        molds = []
        for i in range(1, self.num_molds + 1):
            # Assign mold tonnage requirement
            req_tonnage = self.rng.choice([100, 250, 400, 800])
            compatible = [p.id for p in presses if p.tonnage >= req_tonnage]
            if not compatible:
                compatible = [presses[-1].id]
            cavities = self.rng.choice([2, 4, 8, 16])
            molds.append(
                Mold(
                    id=f"M_{i:02d}",
                    name=f"Multi-Cavity Mold M_{i:02d}",
                    required_tonnage=req_tonnage,
                    compatible_press_ids=compatible,
                    cavities=cavities,
                )
            )
        return molds

    def _generate_parts(self, molds: List[Mold]) -> List[PartNumber]:
        parts = []
        materials = ["PBT-GF30", "PA66-GF25", "LCP", "PPS", "Brass-C26000"]
        for i in range(1, self.num_parts + 1):
            mold = self.rng.choice(molds)
            # Stale ERP cycle time (what ERP standard says)
            erp_sec = round(self.rng.uniform(6.0, 35.0), 1)

            # True shop-floor actuals: 20% of parts deliberately have positive drift (+15% to +35%)
            has_drift = self.rng.random() < 0.25
            if has_drift:
                drift_factor = self.rng.uniform(1.15, 1.40)
            else:
                drift_factor = self.rng.uniform(0.96, 1.04)

            true_mean = round(erp_sec * drift_factor, 2)
            true_std = round(true_mean * 0.12, 2)

            parts.append(
                PartNumber(
                    id=f"PN_{1000 + i}",
                    name=f"Connector Terminal PN-{1000 + i}",
                    mold_id=mold.id,
                    erp_std_cycle_sec=erp_sec,
                    true_mean_cycle_sec=true_mean,
                    true_std_cycle_sec=true_std,
                    material=self.rng.choice(materials),
                )
            )
        return parts

    def _generate_changeover_matrix(self, molds: List[Mold]) -> Dict[str, Dict[str, float]]:
        """Setup time in hours between mold changes (sequence-dependent)."""
        matrix: Dict[str, Dict[str, float]] = {}
        for m1 in molds:
            matrix[m1.id] = {}
            for m2 in molds:
                if m1.id == m2.id:
                    matrix[m1.id][m2.id] = 0.0  # same mold, no changeover
                elif m1.required_tonnage == m2.required_tonnage:
                    matrix[m1.id][m2.id] = round(self.rng.uniform(0.5, 1.2), 2)  # minor setup
                else:
                    matrix[m1.id][m2.id] = round(self.rng.uniform(1.5, 3.5), 2)  # major bolster adjustment
        return matrix

    def _generate_jobs(self, parts: List[PartNumber], molds: List[Mold]) -> List[Job]:
        jobs = []
        mold_map = {m.id: m for m in molds}

        for i in range(1, self.num_jobs + 1):
            part = self.rng.choice(parts)
            mold = mold_map[part.mold_id]

            # Realistic batch quantity
            qty = self.rng.choice([5000, 10000, 25000, 50000, 100000])

            # Due dates distributed across 7-day horizon (24h to 168h)
            due_hour = round(self.rng.uniform(24.0, self.horizon_hours + 24.0), 1)
            priority = self.rng.choice([1, 2, 2, 3, 3, 3, 4])

            jobs.append(
                Job(
                    id=f"JOB_{i:04d}",
                    order_id=f"SO_{8000 + i}",
                    part_number=part.id,
                    mold_id=mold.id,
                    quantity=qty,
                    due_date_hour=due_hour,
                    priority=priority,
                    release_date_hour=0.0,
                )
            )
        return jobs

    def _generate_mes_actuals(
        self,
        parts: List[PartNumber],
        presses: List[Press],
        molds: List[Mold],
        num_records: int = 800,
        inject_defects: bool = True,
    ) -> List[Dict[str, Any]]:
        """Generate historical MES actual run logs with realistic variance and noise."""
        actuals = []
        for i in range(1, num_records + 1):
            part = self.rng.choice(parts)
            press = self.rng.choice([p for p in presses if p.tonnage >= 100])

            # Draw actual cycle time from true lognormal distribution
            mu = math.log(part.true_mean_cycle_sec)
            sigma = part.true_std_cycle_sec / part.true_mean_cycle_sec
            obs_cycle = round(self.rng.lognormvariate(mu, sigma), 2)

            qty_produced = self.rng.choice([2000, 5000, 8000])
            scrap_count = int(qty_produced * self.rng.uniform(0.005, 0.035))

            rec = {
                "run_id": f"RUN_{i:06d}",
                "part_number": part.id,
                "press_id": press.id,
                "mold_id": part.mold_id,
                "erp_std_cycle_sec": part.erp_std_cycle_sec,
                "observed_cycle_sec": obs_cycle,
                "quantity_produced": qty_produced,
                "scrap_count": scrap_count,
                "yield_percent": round((1.0 - scrap_count / qty_produced) * 100, 2),
                "downtime_minutes": round(self.rng.expovariate(1 / 15.0), 1) if self.rng.random() < 0.25 else 0.0,
                "timestamp": f"2026-11-10T{self.rng.randint(0,23):02d}:{self.rng.randint(0,59):02d}:00Z",
            }

            # Inject controlled data quality defects for testing the DQ pipeline
            if inject_defects and self.rng.random() < 0.04:
                defect_type = self.rng.choice(["missing_cycle", "unit_mismatch", "outlier_jam"])
                if defect_type == "missing_cycle":
                    rec["observed_cycle_sec"] = None
                elif defect_type == "unit_mismatch":
                    rec["observed_cycle_sec"] = round(obs_cycle / 60.0, 4)  # Minutes instead of seconds
                elif defect_type == "outlier_jam":
                    rec["observed_cycle_sec"] = round(obs_cycle * 25.0, 1)  # Jammed stroke outlier

            actuals.append(rec)
        return actuals
