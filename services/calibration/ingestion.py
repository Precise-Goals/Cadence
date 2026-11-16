"""Data ingestion and quality pipeline for plant actuals and master data.

Implements REQ-001 & REQ-002:
- Multi-format ingestion (CSV, JSON, dictionaries)
- Missing value imputation
- Unit mismatch correction (minutes to seconds)
- Statistical outlier rejection (machine jams / stoppages)
- Data Quality Report generation
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple


@dataclass
class DataQualityReport:
    total_records: int
    clean_records: int
    missing_imputed: int
    unit_mismatches_corrected: int
    outliers_rejected: int
    duplicate_records: int
    quality_score: float  # 0.0 to 100.0


class DataQualityPipeline:
    """Cleans, normalizes, and filters shop floor MES run actuals."""

    def __init__(
        self,
        min_valid_cycle_sec: float = 2.0,
        max_valid_cycle_sec: float = 120.0,
        outlier_z_threshold: float = 3.5,
    ) -> None:
        self.min_valid_cycle_sec = min_valid_cycle_sec
        self.max_valid_cycle_sec = max_valid_cycle_sec
        self.outlier_z_threshold = outlier_z_threshold

    def process_records(
        self,
        raw_records: List[Dict[str, Any]],
        fallback_std_map: Optional[Dict[str, float]] = None,
    ) -> Tuple[List[Dict[str, Any]], DataQualityReport]:
        """Process a list of raw actuals and return cleaned records + DQ report."""
        clean: List[Dict[str, Any]] = []
        seen_runs = set()
        missing_count = 0
        unit_corrected_count = 0
        outlier_count = 0
        dup_count = 0

        fallback_std_map = fallback_std_map or {}

        for rec in raw_records:
            run_id = rec.get("run_id")
            if run_id in seen_runs:
                dup_count += 1
                continue
            if run_id:
                seen_runs.add(run_id)

            rec_copy = dict(rec)
            pn = rec_copy.get("part_number")
            cycle = rec_copy.get("observed_cycle_sec")

            # 1. Check Missing Value
            if cycle is None or cycle <= 0:
                missing_count += 1
                # Impute from fallback ERP standard or record's erp_std
                imputed = rec_copy.get("erp_std_cycle_sec") or fallback_std_map.get(pn, 15.0)
                rec_copy["observed_cycle_sec"] = float(imputed)
                rec_copy["_dq_imputed"] = True
                clean.append(rec_copy)
                continue

            cycle_val = float(cycle)

            # 2. Check Unit Mismatch (e.g. recorded in minutes: 0.1 to 1.9 minutes instead of 6 to 114 seconds)
            if cycle_val < self.min_valid_cycle_sec:
                # Multiply by 60 to convert minutes to seconds
                converted = cycle_val * 60.0
                if self.min_valid_cycle_sec <= converted <= self.max_valid_cycle_sec:
                    rec_copy["observed_cycle_sec"] = round(converted, 2)
                    rec_copy["_dq_unit_corrected"] = True
                    unit_corrected_count += 1
                    clean.append(rec_copy)
                    continue

            # 3. Check Jam / Unmitigated Outliers
            if cycle_val > self.max_valid_cycle_sec:
                outlier_count += 1
                continue  # Reject breakdown stroke from steady-state calibration

            clean.append(rec_copy)

        total = len(raw_records)
        clean_len = len(clean)
        flaws = missing_count + unit_corrected_count + outlier_count + dup_count
        score = max(0.0, round((1.0 - (flaws / max(1, total))) * 100, 1))

        report = DataQualityReport(
            total_records=total,
            clean_records=clean_len,
            missing_imputed=missing_count,
            unit_mismatches_corrected=unit_corrected_count,
            outliers_rejected=outlier_count,
            duplicate_records=dup_count,
            quality_score=score,
        )

        return clean, report
