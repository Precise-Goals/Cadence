"use client";

import React, { createContext, useContext, useState } from "react";

const DEFAULT_PLANT = {
  id: "plant_te_01",
  name: "TE Connectivity — Press & Molding Facility 04",
  location: "Pune, India (Sector 12)",
  pressCount: 16,
  moldCount: 64,
  activePartNumbers: 320,
  shiftsPerDay: 3,
  hoursPerShift: 8,
  targetOtdPercent: 95.0,
  dataSource: "synthetic",
  createdAt: "2026-11-17T00:00:00Z",
};

const INITIAL_AUDIT_LOG = [
  {
    id: "aud_01",
    timestamp: "2026-11-17 02:40",
    user: "Marcus Vance",
    action: "Calibration Run #4 Completed",
    details: "Parameter drift detected on PN-1043: cycle time shifted from 12.0s to 14.6s (+21.7%).",
    status: "verified",
  },
  {
    id: "aud_02",
    timestamp: "2026-11-17 03:00",
    user: "Automated Solver (CP-SAT)",
    action: "Plan v1.4 Scheduled",
    details: "194 jobs scheduled across 16 presses. Feasible makespan 148.5h, projected OTD 96.2%.",
    status: "active",
  },
];

const PlantContext = createContext({
  plant: DEFAULT_PLANT,
  isOnboarded: true,
  completeOnboarding: (data) => {},
  activeTab: "dashboard",
  setActiveTab: (tab) => {},
  activePlanVersion: "v1.4",
  auditLog: INITIAL_AUDIT_LOG,
  pendingApproval: null,
  approvePendingPlan: () => {},
  rejectPendingPlan: () => {},
  triggerDisruption: (disruption) => {},
  activeDisruption: null,
  isSolving: false,
});

export function PlantProvider({ children }) {
  const [plant, setPlant] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_PLANT;
    try {
      const stored = localStorage.getItem("cadence_plant_profile");
      return stored ? JSON.parse(stored) : DEFAULT_PLANT;
    } catch {
      return DEFAULT_PLANT;
    }
  });

  const [isOnboarded, setIsOnboarded] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = localStorage.getItem("cadence_onboarded");
      return stored !== null ? stored === "true" : true;
    } catch {
      return true;
    }
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [activePlanVersion, setActivePlanVersion] = useState("v1.4");
  const [auditLog, setAuditLog] = useState(INITIAL_AUDIT_LOG);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [activeDisruption, setActiveDisruption] = useState(null);
  const [isSolving, setIsSolving] = useState(false);

  const completeOnboarding = (plantData) => {
    const updated = { ...DEFAULT_PLANT, ...plantData, id: "plant_" + Math.random().toString(36).substring(2, 7) };
    setPlant(updated);
    setIsOnboarded(true);
    try {
      localStorage.setItem("cadence_plant_profile", JSON.stringify(updated));
      localStorage.setItem("cadence_onboarded", "true");
    } catch {
      // ignore
    }

    // Add audit entry
    setAuditLog((prev) => [
      {
        id: "aud_" + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        user: "System",
        action: "Plant Profile Initialized",
        details: `Configured ${updated.name} with ${updated.pressCount} presses and ${updated.shiftsPerDay} shifts/day.`,
        status: "verified",
      },
      ...prev,
    ]);
  };

  const triggerDisruption = (disruption) => {
    setIsSolving(true);
    setActiveDisruption(disruption);

    // Simulate solver + robustness response after 1.2 seconds
    setTimeout(() => {
      setIsSolving(false);
      setPendingApproval({
        id: "prop_" + Math.random().toString(36).substring(2, 7),
        targetPlan: "v1.5-candidate",
        summary: `Disruption response for ${disruption.title}: Resequenced Press 04 jobs to Press 02 & Press 07.`,
        kpiDelta: {
          otdBefore: 96.2,
          otdAfter: 94.8,
          tardinessDeltaHours: "+4.2h",
          changeoverDeltaMin: "+45m",
          affectedJobsCount: 4,
        },
        bindingConstraints: [
          "Mold M-17 only compatible with Press 02 and Press 07",
          "Press 05 locked for scheduled PM on Shift 2",
          "SO-8812 priority locked to due date 2026-11-20",
        ],
        createdAt: new Date().toISOString(),
      });
    }, 1200);
  };

  const approvePendingPlan = () => {
    if (!pendingApproval) return;
    const newVersion = "v1.5 (Disruption Resolved)";
    setActivePlanVersion(newVersion);
    setAuditLog((prev) => [
      {
        id: "aud_" + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        user: "Human Planner (Approved)",
        action: `Plan ${newVersion} Ratified`,
        details: pendingApproval.summary,
        status: "active",
      },
      ...prev,
    ]);
    setPendingApproval(null);
  };

  const rejectPendingPlan = () => {
    if (!pendingApproval) return;
    setAuditLog((prev) => [
      {
        id: "aud_" + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        user: "Human Planner (Rejected)",
        action: "Candidate Plan Rejected",
        details: "Proposal rejected by planner. Maintaining active schedule v1.4.",
        status: "rejected",
      },
      ...prev,
    ]);
    setPendingApproval(null);
  };

  return (
    <PlantContext.Provider
      value={{
        plant,
        isOnboarded,
        completeOnboarding,
        activeTab,
        setActiveTab,
        activePlanVersion,
        auditLog,
        pendingApproval,
        approvePendingPlan,
        rejectPendingPlan,
        triggerDisruption,
        activeDisruption,
        isSolving,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
}

export function usePlant() {
  return useContext(PlantContext);
}
