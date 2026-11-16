"use client";

import React, { useState } from "react";
import { useAuth, ROLE_LABELS } from "@/lib/auth-context";
import { usePlant } from "@/lib/plant-context";
import {
  LayoutDashboard,
  CalendarDays,
  Bot,
  Activity,
  UploadCloud,
  ShieldCheck,
  Cpu,
  User,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function Navbar() {
  const { user, switchRole, logout } = useAuth();
  const { plant, activeTab, setActiveTab, activePlanVersion, pendingApproval, isSolving } = usePlant();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const tabs = [
    { id: "dashboard", label: "Executive KPIs", icon: LayoutDashboard },
    { id: "gantt", label: "Schedule Gantt", icon: CalendarDays },
    { id: "copilot", label: "What-If Copilot", icon: Bot, badge: pendingApproval ? "Action" : null },
    { id: "drift", label: "Parameter Drift", icon: Activity },
    { id: "data", label: "Data Ingestion", icon: UploadCloud },
    { id: "approvals", label: "Audit & Approvals", icon: ShieldCheck, count: pendingApproval ? 1 : null },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#162035] bg-[#070b14]/90 backdrop-blur-md">
      {/* Top Banner: Context info */}
      <div className="flex h-14 items-center justify-between px-6 border-b border-[#111a2e]">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#0284c7] to-[#034078] shadow-md shadow-sky-500/20">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-white text-base">CADENCE</span>
              <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-sky-400 border border-sky-500/30">
                COPILOT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Press-Based Production Planning</p>
          </div>
        </div>

        {/* Center: Active Plant & Plan Status */}
        <div className="hidden lg:flex items-center gap-3 bg-[#0d1527] px-3.5 py-1.5 rounded-full border border-[#1e2d4a]">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[280px]">
            {plant?.name || "TE Connector Facility"}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
            Plan {activePlanVersion}
          </span>
          {isSolving && (
            <span className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
              <Sparkles className="h-3 w-3 animate-spin" /> Solving CP-SAT...
            </span>
          )}
        </div>

        {/* Right: User / Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 rounded-lg border border-[#1e2d4a] bg-[#0b1222] px-3 py-1.5 hover:bg-[#121c33] transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-900/60 text-sky-300 text-xs font-bold border border-sky-700/50">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-slate-200 leading-none">{user?.name || "Operator"}</p>
              <p className="text-[10px] text-sky-400 font-mono mt-0.5">{ROLE_LABELS[user?.role] || user?.role}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#1e2d4a] bg-[#0b1222] p-2 shadow-2xl shadow-black/80 z-50">
              <div className="px-3 py-2 border-b border-[#162035] mb-1">
                <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <p className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Switch Role View
                </p>
                {Object.entries(ROLE_LABELS).map(([roleKey, label]) => (
                  <button
                    key={roleKey}
                    onClick={() => {
                      switchRole(roleKey);
                      setUserMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-left transition-colors ${
                      user?.role === roleKey
                        ? "bg-sky-500/20 text-sky-300 font-medium"
                        : "text-slate-300 hover:bg-[#121c33]"
                    }`}
                  >
                    <span>{label}</span>
                    {user?.role === roleKey && <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-[#162035] pt-1 mt-1">
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar: Designed Navigation Tabs */}
      <div className="flex h-11 items-center px-6 overflow-x-auto gap-1 bg-[#060a12]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                isActive
                  ? "text-sky-300 bg-[#0e172e] border border-sky-500/40 shadow-sm shadow-sky-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#0b1120]"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-sky-400" : "text-slate-500"}`} />
              <span>{tab.label}</span>

              {tab.badge && (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 border border-amber-500/40 animate-pulse">
                  {tab.badge}
                </span>
              )}

              {tab.count && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {tab.count}
                </span>
              )}

              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]"></span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
