import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { PlantProvider } from "@/lib/plant-context";

export const metadata = {
  title: "Cadence — AI Production Planning & Capacity Optimization Copilot",
  description:
    "Self-calibrating parameters, constraint-feasible scheduling (OR-Tools CP-SAT), simulation-based robustness scoring (SimPy), and explainable what-if analysis for press-based manufacturing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full antialiased bg-[#06080f]">
      <body className="min-h-full flex flex-col bg-[#06080f] text-slate-100 font-sans selection:bg-sky-500/30 selection:text-sky-200">
        <AuthProvider>
          <PlantProvider>{children}</PlantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
