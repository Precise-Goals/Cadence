"use client";

import React from "react";
import { usePlant } from "@/lib/plant-context";
import { ShieldCheck, Clock, CheckCircle2, XCircle, FileText, User } from "lucide-react";

export default function AuditView() {
  const { auditLog } = usePlant();

  return (
    <div className="space-y-6 p-6">
      <div className="border-b border-[#162035] pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-white">Audit Log & Schedule Approvals</h2>
          <span className="rounded bg-sky-500/10 px-2 py-0.5 text-xs font-mono text-sky-400 border border-sky-500/30">
            Compliance & Traceability
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Immutable audit record of all CP-SAT optimizer solutions, manual overrides, and human planner ratifications
        </p>
      </div>

      <div className="rounded-xl border border-[#162035] bg-[#070b14] shadow-xl overflow-hidden">
        <div className="divide-y divide-[#131d33]">
          {auditLog.map((log) => (
            <div key={log.id} className="p-4 hover:bg-[#0b1222] transition-colors flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0 mt-0.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{log.action}</span>
                    <span className="text-[10px] font-mono text-slate-400">• {log.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{log.details}</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400 font-mono">
                    <User className="h-3 w-3 text-sky-400" />
                    <span>Actor: {log.user}</span>
                  </div>
                </div>
              </div>

              <div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                    log.status === "active"
                      ? "text-emerald-400 bg-emerald-950/60 border-emerald-800/40"
                      : log.status === "rejected"
                      ? "text-rose-400 bg-rose-950/60 border-rose-800/40"
                      : "text-sky-400 bg-sky-950/60 border-sky-800/40"
                  }`}
                >
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
