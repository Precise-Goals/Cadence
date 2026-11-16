"use client";

import React, { useState } from "react";
import { usePlant } from "@/lib/plant-context";
import { Factory, Settings2, Sliders, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

export default function OnboardingModal({ isOpen, onClose }) {
  const { completeOnboarding, plant } = usePlant();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: plant?.name || "TE Connectivity — Press Plant 04",
    location: plant?.location || "Pune Industrial Corridor (Molding & Stamping)",
    pressCount: plant?.pressCount || 16,
    moldCount: plant?.moldCount || 64,
    shiftsPerDay: plant?.shiftsPerDay || 3,
    hoursPerShift: plant?.hoursPerShift || 8,
    targetOtdPercent: plant?.targetOtdPercent || 95.0,
    dataSource: plant?.dataSource || "synthetic",
  });

  if (!isOpen) return null;

  const handleFinish = () => {
    completeOnboarding(formData);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#1e2d4a] bg-[#090f1d] p-6 shadow-2xl shadow-sky-950/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#162035] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Facility Onboarding</h2>
              <p className="text-xs text-slate-400">Step {step} of 3: Setup your press plant parameters</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 w-6 rounded-full transition-all ${
                  step === s ? "bg-sky-400" : step > s ? "bg-sky-700" : "bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Plant Identity */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Facility Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1629] px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Plant Location / Line Group</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1629] px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div className="rounded-lg border border-[#162035] bg-[#070c17] p-3 text-xs text-slate-400 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
              <span>
                Cadence initializes the CP-SAT solver and SimPy Monte Carlo model calibrated specifically to your
                press tonnage classes and changeover constraints.
              </span>
            </div>
          </div>
        )}

        {/* Step 2: Capacity & Shifts */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Active Presses</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.pressCount}
                  onChange={(e) => setFormData({ ...formData, pressCount: parseInt(e.target.value) || 16 })}
                  className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1629] px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none font-mono"
                />
                <span className="text-[10px] text-slate-500">100T – 800T press lines</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Molds / Dies in Matrix</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={formData.moldCount}
                  onChange={(e) => setFormData({ ...formData, moldCount: parseInt(e.target.value) || 64 })}
                  className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1629] px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none font-mono"
                />
                <span className="text-[10px] text-slate-500">Tool compatibility mapping</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Shifts Per Day</label>
                <select
                  value={formData.shiftsPerDay}
                  onChange={(e) => setFormData({ ...formData, shiftsPerDay: parseInt(e.target.value) || 3 })}
                  className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1629] px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value={1}>1 Shift (8h Day)</option>
                  <option value={2}>2 Shifts (16h Operating)</option>
                  <option value={3}>3 Shifts (24/7 Continuous)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target OTD Threshold</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="70"
                    max="100"
                    step="0.5"
                    value={formData.targetOtdPercent}
                    onChange={(e) => setFormData({ ...formData, targetOtdPercent: parseFloat(e.target.value) || 95.0 })}
                    className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1629] px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none font-mono"
                  />
                  <span className="text-xs text-slate-400 font-mono">%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Data Source */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">Choose initial data foundation:</p>
            <div className="space-y-2">
              {[
                {
                  id: "synthetic",
                  title: "Synthetic Plant Generator (Benchmark)",
                  desc: "Pre-loads a realistic 16-press shop with stochastic cycle times, changeovers, and deliberate ERP parameter drift to test calibration.",
                },
                {
                  id: "csv_upload",
                  title: "Upload MES / ERP Export (CSV)",
                  desc: "Import your plant's actual part routings, standard cycle times, and order backlog.",
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setFormData({ ...formData, dataSource: opt.id })}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                    formData.dataSource === opt.id
                      ? "border-sky-500 bg-sky-950/30 text-white"
                      : "border-[#1e2d4a] bg-[#0b1222] text-slate-300 hover:bg-[#101a30]"
                  }`}
                >
                  <input
                    type="radio"
                    name="dataSource"
                    checked={formData.dataSource === opt.id}
                    onChange={() => {}}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-xs font-semibold">{opt.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-[#162035] pt-4 mt-6">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 rounded-lg border border-[#1e2d4a] px-3.5 py-1.5 text-xs text-slate-300 hover:bg-[#121c33]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors"
            >
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-sky-500/20"
            >
              <CheckCircle2 className="h-4 w-4" /> Initialize Cadence Engine
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
