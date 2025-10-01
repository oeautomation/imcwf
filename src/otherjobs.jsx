import React, { useMemo, useState } from "react";

// ---- Configuration ----
const JOB_TYPES = ["Microbiology", "AWT", "Environs"]; // acquiring department (owner)
const JOB_CATEGORIES = ["Food", "Water", "Corrosion", "IAQ"]; // testing domain

// Which department executes which category (privilege + workflow)
const EXECUTION_MAP = {
  Food: ["Microbiology"],
  Water: ["Microbiology"],
  Corrosion: ["AWT"],
  IAQ: ["Environs"],
};

// Category → Sample Types
const SAMPLE_TYPES = {
  Water: ["CT", "Pool/SPA", "PW", "WF"],
  Food: ["Food", "Food Bar", "Sandwich"],
  Corrosion: [],
  IAQ: [],
};

// Map job type letter prefix for lab code
const PREFIX_MAP = {
  Microbiology: "M",
  AWT: "A",
  Environs: "E",
};

function pad4(n) {
  return n.toString().padStart(4, "0");
}

function currentYY() {
  const yy = new Date().getFullYear() % 100;
  return yy.toString().padStart(2, "0");
}

function buildLabNumber(jobType, seq, isProject) {
  if (!jobType) return "—";
  const prefix = PREFIX_MAP[jobType] ?? "?";
  const code = `${prefix}-${currentYY()}-${pad4(seq)}`;
  return isProject ? `${code}-P` : code;
}

export default function JobRegistrationPrototype() {
  const [jobType, setJobType] = useState(null);
  const [category, setCategory] = useState(null);
  const [sampleType, setSampleType] = useState("");
  const [isProject, setIsProject] = useState(false);
  const [isSubcontract, setIsSubcontract] = useState(false);

  const allowedExec = useMemo(() => (category ? EXECUTION_MAP[category] ?? [] : []), [category]);
  const executingDept = useMemo(() => (allowedExec.length ? allowedExec[0] : null), [allowedExec]);

  // Demo sequence: random 0–10, recalculated when key inputs change
  const demoSeq = useMemo(() => Math.floor(Math.random() * 11), [jobType, category, sampleType, isProject]);

  const labNumber = useMemo(() => buildLabNumber(jobType, demoSeq, isProject), [jobType, demoSeq, isProject]);

  const invalidMapping = !!category && allowedExec.length === 0;

  // Sample type options for selected category
  const sampleOptions = useMemo(() => (category ? (SAMPLE_TYPES[category] ?? []) : []), [category]);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Job Creation – Prototype Extract</h1>
          <span className="text-sm text-slate-500">Acquiring vs Executing departments </span>
        </header>

        {/* Form Card */}
        <div className="rounded-2xl bg-white shadow p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium">Job Type (Acquiring Department)</label>
              <select
                className="mt-1 rounded-xl border border-slate-300 p-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={jobType ?? ""}
                onChange={(e) => setJobType(e.target.value || null)}
              >
                <option value="">Select…</option>
                {JOB_TYPES.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Controls lab number prefix & sequence</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium">Job Category (Testing Domain)</label>
              <select
                className="mt-1 rounded-xl border border-slate-300 p-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={category ?? ""}
                onChange={(e) => { setCategory(e.target.value || null); setSampleType(""); }}
              >
                <option value="">Select…</option>
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Derives Executing Department & workflow</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium">Sample Type</label>
              <select
                className="mt-1 rounded-xl border border-slate-300 p-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={sampleType}
                onChange={(e) => setSampleType(e.target.value)}
                disabled={!category || sampleOptions.length === 0}
              >
                <option value="">{!category ? "Select a category first…" : (sampleOptions.length ? "Select…" : "No sample types configured")}</option>
                {sampleOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Options change by category (Water/Food shown)</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={isProject} onChange={(e) => setIsProject(e.target.checked)} />
              <span className="text-sm">Treat as a project</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={isSubcontract} onChange={(e) => setIsSubcontract(e.target.checked)} />
              <span className="text-sm">Sub‑contracted work</span>
            </label>
          </div>

          {/* System derivations / validation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div className="text-sm text-slate-500">Executing Department (derived from Category) - (section shown for demo purposes only)</div>
              <div className="mt-1 text-lg font-semibold">{executingDept ?? "—"}</div>
              <div className="mt-2 text-xs text-slate-500">Allowed: {category ? (allowedExec.length ? allowedExec.join(", ") : "None") : "—"}</div>
              {invalidMapping && (
                <div className="mt-3 text-sm text-rose-600">No executing department configured for this category. Please update EXECUTION_MAP.</div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div className="text-sm text-slate-500">Registration & Testing Privileges - (section shown for demo purposes only)</div>
              <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                <li><strong>Registration</strong>: {jobType ?? "—"}</li>
                <li><strong>Testing</strong>: {executingDept ?? "—"}</li>
                {isProject && 
                <li>Project suffix <code>-P</code> added to lab code. Sales item price is generated using bulk price book</li>}
                {isSubcontract && <li>Sub-contract workflow will allow the user to upload an external report (bypassing data entry)</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Output Card */}
        <div className="rounded-2xl bg-white shadow p-6">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-slate-500">Sample Registration Code (section shown for demo purposes only)</div>
            <div className="text-3xl font-extrabold tracking-wide">{labNumber}</div>
            <div className="text-xs text-slate-500">Format: <code>{"<first letter of Job Type>-<YY>-<4 digits>-<P if project>"}</code></div>
            <div className="text-xs text-slate-500">Demo sequence: <strong>{demoSeq}</strong> <span className="italic">(demo only)</span></div>
          </div>
        </div>

        {/* Dev helper: show config 
        <details className="rounded-2xl bg-white shadow p-4">
          <summary className="cursor-pointer text-sm text-slate-600">Show EXECUTION_MAP (edit to match lab policy)</summary>
          <pre className="mt-3 text-xs bg-slate-50 p-3 rounded-xl overflow-auto">{JSON.stringify(EXECUTION_MAP, null, 2)}</pre>
        </details>*/}
      </div>
    </div>
  );
}
