"use client";

import React from "react";
import { usePlant } from "@/lib/plant-context";
import {
  TrendingUp,
  Clock,
  Shuffle,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
} from "lucide-react";

export default function ExecutiveDashboard() {
  const { plant, activePlanVersion, setActiveTab, triggerDisruption } = usePlant();

  const kpis = [
    {
      title: "Projected OTD",
      value: "96.2%",
      target: "≥ 95.0%",
      delta: "+3.8% vs ERP baseline",
      positive: true,
      icon: TrendingUp,
      accent: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
    },
    {
      title: "SimPy Robustness Score",
      value: "92.4 / 100",
      target: "Monte Carlo P90",
      delta: "Survives 94% random delays",
      positive: true,
      icon: ShieldAlert,
      accent: "text-sky-400",
      border: "border-sky-500/30",
      bg: "bg-sky-500/10",
    },
    {
      title: "Changeover Loss",
      value: "8.4%",
      target: "Matrix-optimized",
      delta: "-5.8% vs FIFO dispatching",
      positive: true,
      icon: Shuffle,
      accent: "text-indigo-400",
      border: "border-indigo-500/30",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Average Tardiness",
      value: "1.2h",
      target: "Across 194 jobs",
      delta: "-18.4h manual reduction",
      positive: true,
      icon: Clock,
      accent: "text-azure-400",
      border: "border-sky-500/30",
      bg: "bg-sky-500/10",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Top Banner / Callout */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-[#1e2d4a] bg-gradient-to-r from-[#0b1326] via-[#0e1a38] to-[#0b1326] p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-ping"></span>
            <span className="text-xs uppercase font-mono tracking-widest text-sky-400">
              Active Optimization Model: OR-Tools CP-SAT + SimPy
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Production Rhythm & Capacity Health — {plant?.name}
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            All parameters calibrated from 1,240 actual MES runs. Stochastic simulation certifies plan feasibility
            under shop-floor machine variance and setup shifts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("copilot")}
            className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" /> Simulate What-If
          </button>
          <button
            onClick={() => setActiveTab("gantt")}
            className="flex items-center gap-2 rounded-xl border border-[#1e2d4a] bg-[#0c162b] hover:bg-[#121f3d] px-4 py-2 text-xs font-semibold text-slate-200 transition-colors"
          >
            View Gantt
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-xl border border-[#162035] bg-[#090f1d] p-5 shadow-lg hover:border-sky-500/40 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{kpi.title}</span>
                <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.border} border`}>
                  <Icon className={`h-4 w-4 ${kpi.accent}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-white tracking-tight font-mono">{kpi.value}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[11px] font-medium text-emerald-400 flex items-center">
                    <ArrowUpRight className="h-3 w-3" /> {kpi.delta}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#162035] text-[10px] text-slate-500 flex justify-between">
                  <span>Target constraint:</span>
                  <span className="text-slate-400 font-mono">{kpi.target}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Baseline vs Cadence Comparison Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-[#162035] bg-[#090f1d] p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#162035] pb-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Plan Comparison: Heuristic vs. Cadence Optimized</h3>
              <p className="text-xs text-slate-400">Evaluated over a 7-day rolling horizon with 194 discrete jobs</p>
            </div>
            <span className="text-[11px] font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
              Validated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#162035] text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3">ERP Heuristic (EDD/FIFO)</th>
                  <th className="py-2.5 px-3 text-sky-400">Cadence Calibrated (CP-SAT)</th>
                  <th className="py-2.5 px-3 text-right">Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#131d33] text-slate-200 font-mono">
                <tr>
                  <td className="py-3 px-3 font-sans font-medium text-slate-300">On-Time Delivery (OTD)</td>
                  <td className="py-3 px-3 text-slate-400">89.4%</td>
                  <td className="py-3 px-3 text-emerald-400 font-semibold">96.2%</td>
                  <td className="py-3 px-3 text-right text-emerald-400">+6.8%</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-sans font-medium text-slate-300">Total Changeover Time</td>
                  <td className="py-3 px-3 text-slate-400">38.5 hours</td>
                  <td className="py-3 px-3 text-sky-400 font-semibold">22.4 hours</td>
                  <td className="py-3 px-3 text-right text-sky-400">-16.1h (-41.8%)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-sans font-medium text-slate-300">P90 Tardiness under Breakdowns</td>
                  <td className="py-3 px-3 text-slate-400">28.4 hours</td>
                  <td className="py-3 px-3 text-sky-400 font-semibold">6.2 hours</td>
                  <td className="py-3 px-3 text-right text-sky-400">-22.2h</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-sans font-medium text-slate-300">Schedule Fragility (SimPy index)</td>
                  <td className="py-3 px-3 text-rose-400">High (0.78)</td>
                  <td className="py-3 px-3 text-emerald-400 font-semibold">Resilient (0.19)</td>
                  <td className="py-3 px-3 text-right text-emerald-400">4x more robust</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Disruption Test Panel */}
        <div className="rounded-xl border border-[#162035] bg-[#090f1d] p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Stress-Test Shop Floor</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inject real-world anomalies to test automated re-scheduling and constraint traces:
            </p>

            <div className="space-y-2 mt-4">
              <button
                onClick={() => {
                  triggerDisruption({
                    type: "machine_down",
                    title: "Press 04 Hydraulic Failure (24h)",
                    targetId: "PRESS_04",
                    durationHours: 24,
                  });
                  setActiveTab("copilot");
                }}
                className="w-full text-left p-3 rounded-lg border border-[#1e2d4a] bg-[#0b1326] hover:border-amber-500/50 hover:bg-[#101b36] transition-all text-xs"
              >
                <div className="font-semibold text-slate-200">💥 Press 04 Down for 24h</div>
                <div className="text-[11px] text-slate-400 mt-0.5">SO-8812 priority order re-allocated</div>
              </button>

              <button
                onClick={() => {
                  triggerDisruption({
                    type: "rush_order",
                    title: "Expedite SO-9941 (Customer Auto Tier 1)",
                    targetId: "SO_9941",
                    durationHours: 8,
                  });
                  setActiveTab("copilot");
                }}
                className="w-full text-left p-3 rounded-lg border border-[#1e2d4a] bg-[#0b1326] hover:border-sky-500/50 hover:bg-[#101b36] transition-all text-xs"
              >
                <div className="font-semibold text-slate-200">⚡ Rush Order SO-9941 (Friday Due)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Preempt non-critical batch jobs</div>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#162035] text-[11px] text-slate-500 flex items-center justify-between">
            <span>Human-in-the-loop:</span>
            <span className="text-sky-400 font-semibold">Approval Required</span>
          </div>
        </div>
      </div>
    </div>
  );
}
