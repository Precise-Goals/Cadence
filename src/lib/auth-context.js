"use client";

import React, { createContext, useContext, useState } from "react";

/**
 * @typedef {"production_planner" | "plant_manager" | "supply_chain_planner" | "industrial_engineer"} UserRole
 * 
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {UserRole} role
 * @property {string} plantId
 */

const DEFAULT_USER = {
  id: "usr_planner_01",
  name: "Marcus Vance",
  email: "marcus.vance@plant.te.internal",
  role: "production_planner",
  plantId: "plant_te_01",
};

export const ROLE_LABELS = {
  production_planner: "Production Planner",
  plant_manager: "Plant Manager",
  supply_chain_planner: "Supply Chain Planner",
  industrial_engineer: "Industrial Engineer",
};

const AuthContext = createContext({
  user: DEFAULT_USER,
  isAuthenticated: true,
  login: (email, role) => {},
  signup: (name, email, role) => {},
  logout: () => {},
  switchRole: (role) => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_USER;
    try {
      const stored = localStorage.getItem("cadence_auth_user");
      return stored ? JSON.parse(stored) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!user);

  const login = (email, role = "production_planner") => {
    const newUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role,
      plantId: "plant_te_01",
    };
    setUser(newUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem("cadence_auth_user", JSON.stringify(newUser));
    } catch {
      // ignore
    }
  };

  const signup = (name, email, role) => {
    const newUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role,
      plantId: "plant_te_01",
    };
    setUser(newUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem("cadence_auth_user", JSON.stringify(newUser));
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem("cadence_auth_user");
    } catch {
      // ignore
    }
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    try {
      localStorage.setItem("cadence_auth_user", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
