"use client";

import React, { useState } from "react";
import { useAuth, ROLE_LABELS } from "@/lib/auth-context";
import { Shield, KeyRound, User, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AuthModal({ isOpen, onClose }) {
  const { login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("planner.te@plant.internal");
  const [name, setName] = useState("Marcus Vance");
  const [role, setRole] = useState("production_planner");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      signup(name, email, role);
    } else {
      login(email, role);
    }
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1e2d4a] bg-[#090f1d] p-6 shadow-2xl shadow-sky-950/40">
        <div className="flex items-center gap-3 border-b border-[#162035] pb-4 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {isSignUp ? "Create Planner Account" : "Sign In to Cadence"}
            </h2>
            <p className="text-xs text-slate-400">Role-based plant planning copilot</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1629] pl-9 pr-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  placeholder="e.g. Marcus Vance"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1629] pl-9 pr-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                placeholder="planner@te.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Operating Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1629] px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
            >
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-lg shadow-sky-600/20"
            >
              {isSignUp ? "Create Account & Onboard" : "Access Workspace"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-slate-400 hover:text-sky-400 transition-colors"
            >
              {isSignUp ? "Already have an account? Sign In" : "Need to set up a new plant profile? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
