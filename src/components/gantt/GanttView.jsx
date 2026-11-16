"use client";

import React, { useState } from "react";
import { usePlant } from "@/lib/plant-context";
import { Clock, Filter, Eye, AlertCircle, Wrench, ChevronRight, CheckCircle2 } from "lucide-react";

export default function GanttView() {
  const { plant, activePlanVersion } = usePlant();
  const [selectedJob, setSelectedJob] = useState(null);

  // 16 press lines modeled after TE connector press shop
  const presses = Array.from({ length: plant?.pressCount || 16 }, (_, i) => {
    const id = `Press ${String(i + 1).padStart(2, "0")}`;
    const tonnage = i < 4 ? "120T" : i < 10 ? "250T" : i < 14 ? "400T" : "800T";
    return { id, tonnage };
  });

  // Sample scheduled jobs across the time horizon
  const jobsByPress = {
    "Press 01": [
      { id: "J-101", so: "SO-8812", pn: "PN-1043", mold: "M-14", start: 0, dur: 28, status: "running", priority: "high" },
      { id: "CO-1", type: "changeover", start: 28, dur: 3, moldChange: "M-14 → M-22" },
      { id: "J-102", so: "SO-8844", pn: "PN-1088", mold: "M-22", start: 31, dur: 40, status: "scheduled", priority: "med" },
    ],
    "Press 02": [
      { id: "J-103", so: "SO-8819", pn: "PN-2011", mold: "M-07", start: 0, dur: 36, status: "running", priority: "med" },
      { id: "J-104", so: "SO-8890", pn: "PN-2012", mold: "M-07", start: 36, dur: 30, status: "scheduled", priority: "med" },
    ],
    "Press 03": [
      { id: "J-105", so: "SO-8750", pn: "PN-3044", mold: "M-18", start: 0, dur: 50, status: "running", priority: "low" },
    ],
    "Press 04": [
      { id: "J-106", so: "SO-8812", pn: "PN-1043", mold: "M-17", start: 0, dur: 22, status: "alert", priority: "high", note: "Resequenced candidate" },
      { id: "PM-1", type: "pm", start: 22, dur: 12, note: "Scheduled Tooling PM" },
      { id: "J-107", so: "SO-8921", pn: "PN-4055", mold: "M-31", start: 34, dur: 45, status: "scheduled", priority: "med" },
    ],
    "Press 05": [
      { id: "J-108", so: "SO-8610", pn: "PN-1022", mold: "M-03", start: 0, dur: 60, status: "running", priority: "med" },
    ],
    "Press 06": [
      { id: "J-109", so: "SO-8902", pn: "PN-5012", mold: "M-09", start: 10, dur: 42, status: "scheduled", priority: "high" },
    ],
  };

  const getJobColor = (job) => {
    if (job.type === "changeover") return "bg-indigo-950/80 border-indigo-700/60 text-indigo-300";
    if (job.type === "pm") return "bg-amber-950/80 border-amber-700/60 text-amber-300";
    if (job.status === "alert") return "bg-rose-950/80 border-rose-600 text-rose-200 animate-pulse";
    if (job.priority === "high") return "bg-sky-950/90 border-sky-500 text-sky-200";
    return "bg-slate-900 border-slate-700 text-slate-300";
  };

  return (
    <div className="space-y-4 p-6">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#162035] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Press Shop Schedule Gantt</h2>
            <span className="rounded bg-sky-500/10 px-2 py-0.5 text-xs font-mono text-sky-400 border border-sky-500/30">
              {activePlanVersion}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Finite-capacity schedule optimized via OR-Tools CP-SAT with sequence-dependent setup matrix
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-sky-600 border border-sky-400"></span> Priority Job
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-slate-800 border border-slate-600"></span> Standard Batch
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-indigo-900 border border-indigo-600"></span> Changeover
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-amber-900 border border-amber-600"></span> Maintenance
          </span>
        </div>
      </div>

      {/* Main Gantt Grid Container */}
      <div className="rounded-xl border border-[#162035] bg-[#070b14] shadow-2xl overflow-hidden">
        {/* Timeline Header (7 Days / 168 Hours) */}
        <div className="flex border-b border-[#162035] bg-[#0a101f] text-[10px] font-mono text-slate-400 select-none">
          <div className="w-36 shrink-0 py-2.5 px-4 font-semibold text-slate-300 border-r border-[#162035]">
            PRESS LINE
          </div>
          <div className="flex-1 grid grid-cols-7 divide-x divide-[#162035] text-center">
            {["Mon (D1)", "Tue (D2)", "Wed (D3)", "Thu (D4)", "Fri (D5)", "Sat (D6)", "Sun (D7)"].map((day, i) => (
              <div key={i} className="py-2.5">
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Press Rows */}
        <div className="divide-y divide-[#131c2e] max-h-[580px] overflow-y-auto">
          {presses.slice(0, 10).map((press) => {
            const jobs = jobsByPress[press.id] || [
              { id: `J-${press.id}-1`, so: "SO-Auto", pn: "PN-Std", mold: "M-01", start: 0, dur: 48, status: "scheduled" },
            ];

            return (
              <div key={press.id} className="flex h-14 hover:bg-[#0b1222] transition-colors group">
                {/* Press Identity */}
                <div className="w-36 shrink-0 flex items-center justify-between px-4 border-r border-[#162035] bg-[#080d1a]">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{press.id}</span>
                    <span className="text-[10px] font-mono text-sky-400/80">{press.tonnage}</span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                </div>

                {/* Press Timeline Slot */}
                <div className="flex-1 relative flex items-center px-1">
                  {/* Subtle 24h Grid guidelines */}
                  <div className="absolute inset-0 grid grid-cols-7 divide-x divide-[#162035]/40 pointer-events-none" />

                  {/* Render Job Blocks */}
                  {jobs.map((job) => {
                    // scale 0 to 168 hours across 100% width
                    const left = `${(job.start / 168) * 100}%`;
                    const width = `${Math.max(4, (job.dur / 168) * 100)}%`;

                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        style={{ left, width }}
                        className={`absolute h-9 rounded-md border text-xs px-2 flex items-center justify-between cursor-pointer transition-transform hover:scale-[1.01] hover:z-20 shadow-sm ${getJobColor(
                          job
                        )}`}
                      >
                        <div className="truncate">
                          <span className="font-bold text-[11px] block truncate">
                            {job.type === "changeover"
                              ? "Setup"
                              : job.type === "pm"
                              ? "PM Service"
                              : `${job.pn}`}
                          </span>
                          <span className="text-[9px] font-mono opacity-80 block truncate">
                            {job.type === "changeover" ? job.moldChange : job.so || "Batch"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Job Drawer / Detail View */}
      {selectedJob && (
        <div className="rounded-xl border border-sky-500/40 bg-[#0a1224] p-4 shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-mono">
                {selectedJob.id} — {selectedJob.pn || "Changeover"}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Order: <span className="text-sky-300 font-mono">{selectedJob.so || "N/A"}</span> | Mold:{" "}
                <span className="text-sky-300 font-mono">{selectedJob.mold || "Matrix"}</span> | Duration:{" "}
                <span className="text-white font-mono">{selectedJob.dur} hours</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedJob.note && (
              <span className="text-xs text-amber-300 bg-amber-950/60 border border-amber-800/40 px-2 py-1 rounded">
                {selectedJob.note}
              </span>
            )}
            <button
              onClick={() => setSelectedJob(null)}
              className="rounded-lg border border-[#1e2d4a] px-3 py-1 text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
