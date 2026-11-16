"use client";

import React, { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Database, RefreshCw, FileSpreadsheet } from "lucide-react";

export default function IngestionView() {
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      name: "MES_Actuals_PressShop_Nov2026.csv",
      size: "2.4 MB",
      records: 1240,
      status: "Validated",
      defectsFound: 0,
      timestamp: "Today, 02:15",
    },
    {
      name: "ERP_Standard_Routings_Extract.xlsx",
      size: "1.1 MB",
      records: 320,
      status: "Validated (Cleaned)",
      defectsFound: 3,
      timestamp: "Yesterday, 18:30",
    },
  ]);

  const handleSimulatedUpload = () => {
    const newFile = {
      name: `MES_Press_Run_Log_${Date.now().toString().slice(-4)}.csv`,
      size: "1.8 MB",
      records: 840,
      status: "Validated",
      defectsFound: 0,
      timestamp: "Just now",
    };
    setUploadedFiles((prev) => [newFile, ...prev]);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#162035] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Data Ingestion & Quality Pipeline</h2>
            <span className="rounded bg-sky-500/10 px-2 py-0.5 text-xs font-mono text-sky-400 border border-sky-500/30">
              Adapters
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Ingest ERP-style exports, MES shop floor actuals, and Excel sheets through schema validation pipelines
          </p>
        </div>

        <button
          onClick={handleSimulatedUpload}
          className="flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-lg shadow-sky-600/20"
        >
          <UploadCloud className="h-4 w-4" /> Upload Sample MES Log
        </button>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleSimulatedUpload();
        }}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          dragOver
            ? "border-sky-400 bg-sky-950/20"
            : "border-[#1e2d4a] bg-[#070b14] hover:border-sky-500/50 hover:bg-[#0a101f]"
        }`}
        onClick={handleSimulatedUpload}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-white">Drag & drop shop floor data or click to browse</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
          Supports CSV, Excel (.xlsx), and SAP/MES delimited files. Automates unit-mismatch normalization, outlier
          rejection, and duplicate deduplication.
        </p>
      </div>

      {/* Data Quality Checks Performed */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#162035] bg-[#090f1d] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Missing Value Imputation
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Bayesian shrinkage applied on sparse part records to prevent zero-duration faults.
          </p>
        </div>

        <div className="rounded-xl border border-[#162035] bg-[#090f1d] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Outlier / Jam Rejection
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Machine breakdown outliers separated from steady-state cycle time distributions.
          </p>
        </div>

        <div className="rounded-xl border border-[#162035] bg-[#090f1d] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Unit Normalization
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Auto-converts parts-per-minute, seconds-per-stroke, and hours into canonical seconds.
          </p>
        </div>
      </div>

      {/* Uploaded History Table */}
      <div className="rounded-xl border border-[#162035] bg-[#070b14] shadow-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#162035] bg-[#090f1d] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white">Ingested Data Records & Status</h3>
          <span className="text-[11px] text-slate-400 font-mono">2 Active Connectors</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#162035] text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-4">Dataset Name</th>
                <th className="py-2.5 px-4">Size</th>
                <th className="py-2.5 px-4">Records</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Ingested At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#131d33] text-slate-200">
              {uploadedFiles.map((f, i) => (
                <tr key={i} className="hover:bg-[#0b1222] transition-colors">
                  <td className="py-3 px-4 font-sans flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-sky-400 shrink-0" />
                    <span className="font-medium text-slate-200">{f.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{f.size}</td>
                  <td className="py-3 px-4 text-sky-300 font-bold">{f.records.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px]">
                      {f.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{f.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
