import React, { useMemo, useState } from "react";

// ---- Configuration (revised concept) ----
// Job Type IS the analytical department
const JOB_TYPES = ["Microbiology", "AWT", "Environs", "Miscellaneous"]; // Misc last

// Job Category options depend on Job Type
const CATEGORY_BY_JOBTYPE = {
  Microbiology: ["Food", "Water"],
  AWT: ["Chemical","Corrosion","Regular AWT category placeholder"],
  Environs: ["IEQ","IAQ","Regular ENV category placeholder"],
  Miscellaneous: ["Miscellaneous"],
};

// Job Category → Sample Types (independent of job type)
const SAMPLE_TYPES_BY_CATEGORY = {
  Corrosion: ["Corrosion Analysis"],
  Chemical: ["Chemical Analysis"],
  Food: ["Food Swab", "Ingredients", "Beverages"],
  Water: ["CT", "Pool/SPA", "PW", "WF"],
  IEQ: ["CT", "Pool/SPA", "PW"],
  IAQ: ["CT", "Pool/SPA", "PW"],
  Miscellaneous: ["sample type placeholder"],
  "Regular ENV category placeholder": ["samples placeholder"],
    "Regular AWT category placeholder": ["samples placeholder"],
};

// Map job type letter prefix for lab code (configurable server-side later)
const PREFIX_MAP = {
  Microbiology: "M",
  AWT: "A",
  Environs: "E",
  Miscellaneous: "O", // per requirement
};

function pad4(n) {
  return n.toString().padStart(4, "0");
}

function currentYY() {
  const yy = new Date().getFullYear() % 100;
  return yy.toString().padStart(2, "0");
}

// NOTE: first dash after the letter removed per requirement
function buildLabNumber(jobType, seq, isProject) {
  if (!jobType) return "—";
  const prefix = PREFIX_MAP[jobType] ?? "?";
  const code = `${prefix}${currentYY()}-${pad4(seq)}`; // e.g., A25-0001
  return isProject ? `${code}-P` : code; // add -P if project
}

export default function JobRegistrationPrototype() {
  const [jobType, setJobType] = useState(null);
  const [category, setCategory] = useState(null);
  const [sampleType, setSampleType] = useState("");
  const [isProject, setIsProject] = useState(false); // restored
  const [isSubcontract, setIsSubcontract] = useState(false);

  // Category options driven by Job Type
  const categoryOptions = useMemo(() => (jobType ? CATEGORY_BY_JOBTYPE[jobType] ?? [] : []), [jobType]);

  // Sample type options driven by Category
  const sampleOptions = useMemo(() => (category ? (SAMPLE_TYPES_BY_CATEGORY[category] ?? ["sample type placeholder"]) : []), [category]);

  // Executing department is the Job Type (department)
  const executingDept = jobType;

  // Demo sequence: random 0–10, recalculated when key inputs change
  const demoSeq = useMemo(() => Math.floor(Math.random() * 11+1), [jobType, category, sampleType, isProject, isSubcontract]);

  const labNumber = useMemo(() => buildLabNumber(jobType, demoSeq, isProject), [jobType, demoSeq, isProject]);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Job Creation – Prototype</h1>
          <span className="text-sm text-slate-500">Department-driven categories; Project via checkbox</span>
        </header>

        {/* Form Card */}
        <div className="rounded-2xl bg-white shadow p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium">Job Type (Department)</label>
              <select
                className="mt-1 rounded-xl border border-slate-300 p-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={jobType ?? ""}
                onChange={(e) => { setJobType(e.target.value || null); setCategory(null); setSampleType(""); }}
              >
                <option value="">Select…</option>
                {JOB_TYPES.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Controls registration prefix & sequence (prefix configurable server‑side)</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium">Job Category</label>
              <select
                className="mt-1 rounded-xl border border-slate-300 p-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={category ?? ""}
                onChange={(e) => { setCategory(e.target.value || null); setSampleType(""); }}
                disabled={!jobType}
              >
                <option value="">{jobType ? "Select…" : "Select job type first…"}</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Options depend on the department</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium">Sample Type</label>
              <select
                className="mt-1 rounded-xl border border-slate-300 p-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={sampleType}
                onChange={(e) => setSampleType(e.target.value)}
                disabled={!jobType || !category}
              >
                <option value="">{!jobType ? "Select job type first…" : (!category ? "Select category first…" : (sampleOptions.length ? "Select…" : "No sample types configured"))}</option>
                {sampleOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Driven by job category</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={isProject} onChange={(e) => setIsProject(e.target.checked)} />
              <span className="text-sm">Treat as a project</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={isSubcontract} onChange={(e) => setIsSubcontract(e.target.checked)} />
              <span className="text-sm">Sub‑contracted work (A schedule level flag - selected by sample collector as part of the sample collection)</span>
            </label>
          </div>

          {/* System derivations / info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div className="text-sm text-slate-500">Executing Department</div>
              <div className="mt-1 text-lg font-semibold">{executingDept ?? "—"}</div>
              <div className="mt-2 text-xs text-slate-500">Derived from Job Type</div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div className="text-sm text-slate-500">Registration & Testing Privileges</div>
              <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                <li><strong>Registration</strong>: {jobType ?? "—"}</li>
                <li><strong>Testing</strong>: {executingDept ?? "—"}</li>
                {isProject && <li><strong>Workflow</strong> Project suffix <code>-P</code>  Project workflow: added to lab code. Require report update.</li>}
                {isSubcontract && <li><strong>Workflow</strong> Sub‑contract workflow: Require external report generation</li>}
                {!isProject && !isSubcontract && jobType=="Microbiology" && <li ><strong>Workflow</strong> Regular workflow is selected</li>}
                {!isProject && !isSubcontract &&category === "Regular ENV category placeholder" && <li ><strong>Workflow</strong> Regular workflow is selected</li>}
                {!isProject && !isSubcontract &&category === "Regular AWT category placeholder" && <li ><strong>Workflow</strong> Regular workflow is selected</li>}
                {!isProject && !isSubcontract &&(category === "Corrosion"||category === "Chemical") && <li ><strong>Workflow</strong> Corrosion workflow is selected</li>}
                {!isProject && !isSubcontract &&(category === "IEQ"||category === "IAQ") && <li ><strong>Workflow</strong> IAQ workflow is selected</li>}

              </ul>
            </div>
          </div>
        </div>

        {/* Output Card */}
        <div className="rounded-2xl bg-white shadow p-6">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-slate-500">Sample Registration Code</div>
            <div className="text-3xl font-extrabold tracking-wide">{labNumber}</div>
            <div className="text-xs text-slate-500">Format: <code>{"<first letter of Job Type><YY>-<4 digits>-<P if project>"}</code></div>
            <div className="text-xs text-slate-500">Demo sequence: <strong>{demoSeq}</strong> <span className="italic">(demo only)</span></div>
          </div>
        </div>

        {/* Dev helper: show config */}
        <details className="rounded-2xl bg-white shadow p-4">
          <summary className="cursor-pointer text-sm text-slate-600">Show config (edit to match lab policy)</summary>
          <pre className="mt-3 text-xs bg-slate-50 p-3 rounded-xl overflow-auto">{JSON.stringify({ JOB_TYPES, CATEGORY_BY_JOBTYPE, SAMPLE_TYPES_BY_CATEGORY, PREFIX_MAP }, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}
