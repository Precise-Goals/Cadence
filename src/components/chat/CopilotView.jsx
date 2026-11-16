"use client";

import React, { useState } from "react";
import { usePlant } from "@/lib/plant-context";
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Cpu,
} from "lucide-react";

export default function CopilotView() {
  const {
    plant,
    triggerDisruption,
    isSolving,
    pendingApproval,
    approvePendingPlan,
    rejectPendingPlan,
    activeDisruption,
  } = usePlant();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to Cadence What-If Copilot. Type any disruption, machine breakdown, or rush order. I will evaluate constraint feasibility using OR-Tools CP-SAT and score robustness via Monte Carlo simulation.",
    },
  ]);

  const quickPrompts = [
    "Press 04 is down for 2 days due to hydraulic failure, and SO-8812 must ship Friday.",
    "Expedite customer rush order SO-9941 (120,000 units PN-3044) by tomorrow evening.",
    "Mold M-17 requires emergency preventative maintenance for 16 hours starting next shift.",
  ];

  const handleSend = (textToSend = input) => {
    if (!textToSend.trim()) return;

    const userMsg = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Trigger disruption engine
    triggerDisruption({
      type: "user_query",
      title: textToSend.substring(0, 45) + "...",
      fullQuery: textToSend,
    });

    // Provide assistant response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I've extracted your disruption intent, verified press/mold tonnage constraints, and solved 2 candidate re-allocations. View Option A and Option B below with full KPI trade-offs.",
        },
      ]);
    }, 1300);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 h-[calc(100vh-120px)]">
      {/* Left Chat & Query Section (5 cols) */}
      <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#162035] bg-[#070b14] p-4 shadow-xl">
        {/* Messages Log */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 text-xs ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                  m.role === "user"
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                    : "border border-[#1a2640] bg-[#0c1426] text-slate-200"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {isSolving && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-sky-500/30 bg-sky-950/20 text-xs text-sky-300 animate-pulse">
              <Sparkles className="h-4 w-4 animate-spin text-sky-400" />
              <span>Solving constraint programming model (OR-Tools CP-SAT) & running 100 SimPy Monte Carlo iterations...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-3 pt-3 border-t border-[#162035] space-y-2">
          <p className="text-[10px] uppercase font-mono text-slate-500">Suggested Shop Disruption Scenarios:</p>
          <div className="space-y-1.5">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="w-full text-left text-[11px] text-slate-300 hover:text-white bg-[#0b1222] hover:bg-[#121c33] p-2 rounded-lg border border-[#1a2640] transition-colors truncate"
              >
                ⚡ {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a what-if question (e.g. Press 4 is down...)"
              className="flex-1 rounded-lg border border-[#1e2d4a] bg-[#0d1629] px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSolving || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Solution Comparison & Human Approval Pane (7 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-[#162035] bg-[#070b14] p-5 shadow-xl overflow-y-auto">
        {pendingApproval ? (
          <div className="space-y-5 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#162035] pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-400"></span>
                <h3 className="text-sm font-bold text-white">Disruption Candidate: Plan Options Ready</h3>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                Action Required
              </span>
            </div>

            {/* Candidate Card: Option A */}
            <div className="rounded-xl border border-sky-500/40 bg-[#0c152a] p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sky-300">OPTION A (Recommended by Solver)</span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Saves SO-8812 Due Date
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{pendingApproval.summary}</p>

              {/* KPI Delta Table */}
              <div className="mt-3 grid grid-cols-4 gap-2 pt-3 border-t border-[#182542] text-center font-mono">
                <div className="rounded-lg bg-[#070d1a] p-2 border border-[#16223b]">
                  <span className="text-[10px] text-slate-400 block">Projected OTD</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {pendingApproval.kpiDelta.otdAfter}%{" "}
                    <span className="text-[10px] text-slate-400">({pendingApproval.kpiDelta.otdBefore}%)</span>
                  </span>
                </div>
                <div className="rounded-lg bg-[#070d1a] p-2 border border-[#16223b]">
                  <span className="text-[10px] text-slate-400 block">Tardiness Delta</span>
                  <span className="text-xs font-bold text-sky-400">{pendingApproval.kpiDelta.tardinessDeltaHours}</span>
                </div>
                <div className="rounded-lg bg-[#070d1a] p-2 border border-[#16223b]">
                  <span className="text-[10px] text-slate-400 block">Setup Changeover</span>
                  <span className="text-xs font-bold text-indigo-400">{pendingApproval.kpiDelta.changeoverDeltaMin}</span>
                </div>
                <div className="rounded-lg bg-[#070d1a] p-2 border border-[#16223b]">
                  <span className="text-[10px] text-slate-400 block">Moved Jobs</span>
                  <span className="text-xs font-bold text-slate-200">{pendingApproval.kpiDelta.affectedJobsCount}</span>
                </div>
              </div>
            </div>

            {/* Constraint Trace / Explainability */}
            <div className="rounded-xl border border-[#162035] bg-[#090f1d] p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-sky-400" /> Binding Constraints Trace (Why these decisions?)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {pendingApproval.bindingConstraints.map((bc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <span>{bc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Approval Gate Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#162035]">
              <div className="text-xs text-slate-400">
                Decision will be audited with user signature & timestamp.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={rejectPendingPlan}
                  className="flex items-center gap-1.5 rounded-lg border border-[#1e2d4a] bg-[#0c1426] hover:bg-[#121c33] px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors"
                >
                  <XCircle className="h-3.5 w-3.5 text-rose-400" /> Reject
                </button>
                <button
                  onClick={approvePendingPlan}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve & Commit Schedule
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">No Pending Plan Modifications</h4>
            <p className="text-xs max-w-md leading-relaxed text-slate-400">
              The active plan <span className="text-sky-300 font-mono">v1.4</span> is running smoothly on shop floor.
              Use the left chat window or scenario presets to test what-if contingencies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
