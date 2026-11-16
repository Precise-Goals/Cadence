"use client";

import React, { useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, RefreshCw, Filter } from "lucide-react";

export default function DriftView() {
  const [filterDriftOnly, setFilterDriftOnly] = useState(false);

  const parameters = [
    {
      pn: "PN-1043",
      press: "Press 04",
      mold: "M-14",
      erpStd: "12.0s",
      observedMedian: "14.6s",
      p90: "17.1s",
      sampleCount: 312,
      driftPercent: "+21.7%",
      hasDrift: true,
      confidence: "High",
      severity: "critical",
      note: "Cooling line degradation observed on press manifold",
    },
    {
      pn: "PN-2011",
      press: "Press 02",
      mold: "M-07",
      erpStd: "8.5s",
      observedMedian: "8.6s",
      p90: "9.1s",
      sampleCount: 840,
      driftPercent: "+1.2%",
      hasDrift: false,
      confidence: "Very High",
      severity: "healthy",
      note: "Parameters aligned with ERP standard master data",
    },
    {
      pn: "PN-3044",
      press: "Press 08",
      mold: "M-22",
      erpStd: "22.0s",
      observedMedian: "25.8s",
      p90: "29.4s",
      sampleCount: 154,
      driftPercent: "+17.3%",
      hasDrift: true,
      confidence: "Medium",
      severity: "warning",
      note: "Mold ejector pin friction reported in last 2 shifts",
    },
    {
      pn: "PN-4055",
      press: "Press 12",
      mold: "M-31",
      erpStd: "16.0s",
      observedMedian: "14.8s",
      p90: "16.0s",
      sampleCount: 420,
      driftPercent: "-7.5%",
      hasDrift: true,
      confidence: "High",
      severity: "info",
      note: "Higher operator efficiency with quick-clamping system",
    },
    {
      pn: "PN-5012",
      press: "Press 06",
      mold: "M-09",
      erpStd: "10.0s",
      observedMedian: "10.2s",
      p90: "11.0s",
      sampleCount: 512,
      driftPercent: "+2.0%",
      hasDrift: false,
      confidence: "High",
      severity: "healthy",
      note: "Within statistical tolerance limit",
    },
  ];

  const displayedParams = filterDriftOnly ? parameters.filter((p) => p.hasDrift) : parameters;

  return (
    <div className="space-y-6 p-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#162035] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Parameter Drift & Calibration Report</h2>
            <span className="rounded bg-sky-500/10 px-2 py-0.5 text-xs font-mono text-sky-400 border border-sky-500/30">
              Module 1: Calibrate
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Automated KS-test comparison between ERP master standard cycle times and observed MES shop floor actuals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={filterDriftOnly}
              onChange={(e) => setFilterDriftOnly(e.target.checked)}
              className="rounded border-[#1e2d4a] bg-[#0c1426] text-sky-500"
            />
            <span>Show Drifted Only</span>
          </label>
          <button className="flex items-center gap-1.5 rounded-lg border border-[#1e2d4a] bg-[#0c162b] hover:bg-[#121f3d] px-3.5 py-1.5 text-xs font-medium text-slate-200 transition-colors">
            <RefreshCw className="h-3.5 w-3.5 text-sky-400" /> Recalibrate Distributions
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#162035] bg-[#090f1d] p-4 shadow-lg">
          <span className="text-xs text-slate-400">Total Monitored Pairs</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">320 Parts</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Across 64 active mold matrices</span>
        </div>

        <div className="rounded-xl border border-rose-500/30 bg-[#120a14] p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-300">Drifted Parameters</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-1">14 Parameters</div>
          <span className="text-[11px] text-rose-400/80 mt-1 block">&gt; 10% deviation from ERP master data</span>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-[#08151a] p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-300">Calibration Accuracy</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">94.8%</div>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">MAPE reduced from 26.4% to 4.2%</span>
        </div>
      </div>

      {/* Drift Table */}
      <div className="rounded-xl border border-[#162035] bg-[#070b14] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#162035] bg-[#090f1d] text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Part / Machine / Mold</th>
                <th className="py-3 px-4">ERP Master Standard</th>
                <th className="py-3 px-4 text-sky-400">Observed Actual (Median)</th>
                <th className="py-3 px-4">P90 Tail</th>
                <th className="py-3 px-4">Sample Size (n)</th>
                <th className="py-3 px-4">Drift Delta</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#131d33] text-slate-200">
              {displayedParams.map((p, idx) => (
                <tr key={idx} className="hover:bg-[#0b1222] transition-colors">
                  <td className="py-3.5 px-4 font-sans">
                    <span className="font-bold text-slate-200 block">{p.pn}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {p.press} • {p.mold}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{p.erpStd}</td>
                  <td className="py-3.5 px-4 text-sky-300 font-bold">{p.observedMedian}</td>
                  <td className="py-3.5 px-4 text-slate-400">{p.p90}</td>
                  <td className="py-3.5 px-4 text-slate-300">{p.sampleCount} runs</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold ${
                        p.severity === "critical"
                          ? "text-rose-400"
                          : p.severity === "warning"
                          ? "text-amber-400"
                          : p.severity === "info"
                          ? "text-sky-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {p.driftPercent}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded bg-[#121c33] px-2 py-0.5 text-[10px] text-slate-300 border border-[#1e2d4a]">
                      {p.confidence}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    {p.hasDrift ? (
                      <span className="text-[11px] text-amber-300 bg-amber-950/60 px-2 py-1 rounded border border-amber-800/40 inline-block">
                        Calibrated in Solver
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-800/30 inline-block">
                        Aligned with ERP
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
