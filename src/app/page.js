"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePlant } from "@/lib/plant-context";
import Navbar from "@/components/layout/Navbar";
import ExecutiveDashboard from "@/components/dashboard/ExecutiveDashboard";
import GanttView from "@/components/gantt/GanttView";
import CopilotView from "@/components/chat/CopilotView";
import DriftView from "@/components/drift/DriftView";
import IngestionView from "@/components/drift/IngestionView";
import AuditView from "@/components/dashboard/AuditView";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import AuthModal from "@/components/auth/AuthModal";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { activeTab, isOnboarded } = usePlant();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#06080f] text-slate-100">
      {/* Top Navbar with Designed Tabs */}
      <Navbar />

      {/* Main Tab View Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {activeTab === "dashboard" && <ExecutiveDashboard />}
        {activeTab === "gantt" && <GanttView />}
        {activeTab === "copilot" && <CopilotView />}
        {activeTab === "drift" && <DriftView />}
        {activeTab === "data" && <IngestionView />}
        {activeTab === "approvals" && <AuditView />}
      </main>

      {/* Auth Modal (if user explicitly logs in/out or signs up) */}
      <AuthModal
        isOpen={showAuthModal || !isAuthenticated}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Onboarding Modal (if plant is not yet configured or user requests setup) */}
      <OnboardingModal
        isOpen={showOnboarding || !isOnboarded}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-[#162035] bg-[#070b14] py-3 px-6 text-center text-[11px] text-slate-500 font-mono">
        Cadence Copilot · High-Mix Press Planning · OR-Tools CP-SAT + SimPy · TE AI Cup 2027
      </footer>
    </div>
  );
}
