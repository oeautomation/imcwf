import React, { useMemo, useState } from "react";

/**
 * Machine Management – Product Deployment (Excel Sheet 3: "Deployement")
 *
 * Prototype scope (as per sheet intent):
 *  1) Receiving & inspection workflows (Automation / Standard / Rental)
 *  2) Unique machine ID + serial number governance + tagging to Line|Plant|Division|Location
 *  3) Ownership classification (Owned / Internal Rental / 3rd-party Rental) + rental essentials
 *
 * Controls implemented (as per sheet controls):
 *  - Prevent activation without completed inspection + approval
 *  - Block rejected machines from deployment
 *  - Prevent duplicate serial numbers
 *  - Prevent readiness/activation if mandatory fields are empty
 *  - Time-stamped approvals + user accountability
 *
 * ⚠️ Assumptions (highlighted in UI):
 *  - This module creates a Machine/Asset master record (not only references an upstream master).
 *  - Inspection checklist templates are configurable by category; prototype uses defaults.
 *  - “Connect to Ruber 2.0” is represented as a link status (no real API wiring in prototype).
 *  - Serial uniqueness is validated against the in-memory registry here; production must enforce DB uniqueness.
 */

const TABS = ["Receive", "Inspect", "Identity & Tags", "Ownership", "Summary"];

const OWNERSHIP_TYPES = ["Owned", "Internal Rental", "3rd-party Rental"];
const INSPECTION_WORKFLOWS = ["Automation", "Standard", "Rental"];
const MACHINE_CATEGORIES = ["Cutter", "Mixer", "Conveyor", "Packaging", "Other"];
const RECEIVING_REF_TYPES = ["PO", "GRN", "Invoice", "Transfer Note"];

const DEFAULT_CHECKLIST_BY_CATEGORY = {
  Cutter: ["Guarding in place", "Emergency stop works", "Blade condition OK", "Noise/vibration within limits"],
  Mixer: ["Safety lid works", "Motor runs smooth", "No leakage", "RPM within spec"],
  Conveyor: ["Belt alignment OK", "Sensors functioning", "Emergency stop works", "No abnormal wear"],
  Packaging: ["Interlocks OK", "Calibration done", "Reject mechanism OK", "No jams on trial run"],
  Other: ["Visual inspection OK", "Safety check OK", "Functional test OK", "Documentation received"],
};

function nowISO() {
  return new Date().toISOString();
}

function dateOnly(iso) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function shortId(prefix = "MCH") {
  const n = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `${prefix}-${n}`;
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs border rounded-full ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-2">
        <label className="text-sm font-medium text-slate-800">
          {label} {required ? <span className="text-red-600">*</span> : null}
        </label>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="text-base font-semibold text-slate-900">{title}</div>
            <button
              className="px-3 py-1.5 rounded-xl border bg-white hover:bg-slate-50 text-sm"
              onClick={onClose}
              aria-label="Close"
            >
              Close
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function MachineDeploymentPrototype() {
  // in-memory registry (prototype) used for serial uniqueness and list view
  const [registry, setRegistry] = useState([
    { machineId: "MCH-AB12CD34", serialNumber: "SN-10001", plant: "Plant A", division: "Division 1", location: "Stores", status: "Active" },
  ]);

  const [tab, setTab] = useState(TABS[0]);

  // modals
  const [movementOpen, setMovementOpen] = useState(false);

  const [machine, setMachine] = useState({
    // Receiving
    receivingRefType: "PO",
    receivingRefNo: "",
    receivedDate: dateOnly(nowISO()),
    machineCategory: "Cutter",
    machineDescription: "",
    // Identity
    machineId: shortId("MCH"),
    serialNumber: "",
    // Tagging
    tagType: "QR",
    tagId: "",
    line: "",
    plant: "",
    division: "",
    location: "",
    // Inspection
    inspectionWorkflow: "Standard",
    inspectionOutcome: "Pending", // Pending/Accepted/Rejected/Quarantine
    inspectionChecklist: DEFAULT_CHECKLIST_BY_CATEGORY["Cutter"].map((t) => ({ text: t, done: false })),
    inspectionRemarks: "",
    evidence: [], // {name, type, addedAt}
    approvals: [], // {role, user, decision, at}
    // Ownership
    ownershipType: "Owned",
    thirdPartyVendor: "",
    contractNo: "",
    contractStart: "",
    contractEnd: "",
    internalRentalRate: "",
    ownershipHistory: [], // {from,to,effectiveDate,notes}
    ruber20LinkStatus: "Not Linked",
    // Movement History (prototype)
    movementHistory: [
      // { from, to, effectiveDate, user, reason }
    ],
    // Status
    status: "Draft", // Draft / Ready / Active / Blocked
  });

  const assumptions = [
    "A machine master record is created within this module (not only referenced).",
    "Inspection checklists are configurable by machine category; this prototype uses default items.",
    "“Ruber 2.0” integration is represented as a link status field only (no real integration logic).",
    "Serial uniqueness is checked against this in-memory registry; production must enforce DB uniqueness.",
  ];

  // --- Derived validations ---
  const duplicateSerial = useMemo(() => {
    const sn = (machine.serialNumber || "").trim().toUpperCase();
    if (!sn) return false;
    return registry.some((r) => (r.serialNumber || "").trim().toUpperCase() === sn);
  }, [machine.serialNumber, registry]);

  const mandatoryMissing = useMemo(() => {
    // Minimal required set based on sheet controls in this prototype
    const requiredFields = [machine.receivingRefNo, machine.serialNumber, machine.plant, machine.division, machine.location];
    return requiredFields.some((v) => !String(v || "").trim());
  }, [machine.receivingRefNo, machine.serialNumber, machine.plant, machine.division, machine.location]);

  const inspectionComplete = useMemo(() => machine.inspectionChecklist.every((c) => c.done), [machine.inspectionChecklist]);

  const hasApproval = useMemo(() => machine.approvals.some((a) => a.decision === "Approved"), [machine.approvals]);

  const hasRejectionApproval = useMemo(() => machine.approvals.some((a) => a.decision === "Rejected"), [machine.approvals]);

  const isRejectedOrQuarantine = useMemo(
    () => ["Rejected", "Quarantine"].includes(machine.inspectionOutcome),
    [machine.inspectionOutcome]
  );

  const canMarkReady = useMemo(() => {
    if (mandatoryMissing) return false;
    if (duplicateSerial) return false;
    if (!inspectionComplete) return false;
    if (!hasApproval) return false;
    if (hasRejectionApproval) return false;
    if (isRejectedOrQuarantine) return false;
    return true;
  }, [mandatoryMissing, duplicateSerial, inspectionComplete, hasApproval, hasRejectionApproval, isRejectedOrQuarantine]);

  const blockers = useMemo(() => {
    const reasons = [];
    if (mandatoryMissing) reasons.push("Mandatory fields are missing (Receiving Ref, Serial No, Plant, Division, Location).");
    if (duplicateSerial) reasons.push("Duplicate serial number detected (must be unique).");
    if (!inspectionComplete) reasons.push("Inspection checklist is incomplete.");
    if (!hasApproval) reasons.push("Inspection approval not recorded (needs time-stamped approval).");
    if (hasRejectionApproval) reasons.push("A rejection approval exists → blocked from deployment.");
    if (isRejectedOrQuarantine) reasons.push("Machine is Rejected/Quarantine → blocked from deployment.");
    return reasons;
  }, [mandatoryMissing, duplicateSerial, inspectionComplete, hasApproval, hasRejectionApproval, isRejectedOrQuarantine]);

  // --- Mutators ---
  function update(partial) {
    setMachine((m) => ({ ...m, ...partial }));
  }

  function setCategory(cat) {
    update({
      machineCategory: cat,
      inspectionChecklist: (DEFAULT_CHECKLIST_BY_CATEGORY[cat] || DEFAULT_CHECKLIST_BY_CATEGORY.Other).map((t) => ({ text: t, done: false })),
    });
  }

  function addEvidence(fileName, type = "Document") {
    update({ evidence: [...machine.evidence, { name: fileName, type, addedAt: nowISO() }] });
  }

  function addApproval(role, user, decision) {
    update({ approvals: [...machine.approvals, { role, user, decision, at: nowISO() }] });
  }

  function markReady() {
    if (!canMarkReady) {
      update({ status: "Blocked" });
      return;
    }
    update({ status: "Ready" });
  }

  function activate() {
    if (machine.status !== "Ready") {
      update({ status: "Blocked" });
      return;
    }

    update({ status: "Active" });

    setRegistry((r) => [
      ...r,
      {
        machineId: machine.machineId,
        serialNumber: machine.serialNumber.trim(),
        plant: machine.plant,
        division: machine.division,
        location: machine.location,
        status: "Active",
      },
    ]);
  }

  function saveDraft() {
    // Prototype behavior: just console log (replace with API in real implementation)
    // eslint-disable-next-line no-console
    console.log("Draft payload:", machine);
    alert("Draft saved (prototype). Check console for payload.");
  }

  function addMovement(fromLoc, toLoc, effectiveDate, reason) {
    update({
      movementHistory: [
        ...machine.movementHistory,
        {
          from: fromLoc || "—",
          to: toLoc || "—",
          effectiveDate: effectiveDate || dateOnly(nowISO()),
          user: "current.user", // prototype placeholder
          reason: reason || "—",
        },
      ],
    });
  }

  function resetDraft() {
    setMachine({
      receivingRefType: "PO",
      receivingRefNo: "",
      receivedDate: dateOnly(nowISO()),
      machineCategory: "Cutter",
      machineDescription: "",
      machineId: shortId("MCH"),
      serialNumber: "",
      tagType: "QR",
      tagId: "",
      line: "",
      plant: "",
      division: "",
      location: "",
      inspectionWorkflow: "Standard",
      inspectionOutcome: "Pending",
      inspectionChecklist: DEFAULT_CHECKLIST_BY_CATEGORY["Cutter"].map((t) => ({ text: t, done: false })),
      inspectionRemarks: "",
      evidence: [],
      approvals: [],
      ownershipType: "Owned",
      thirdPartyVendor: "",
      contractNo: "",
      contractStart: "",
      contractEnd: "",
      internalRentalRate: "",
      ownershipHistory: [],
      ruber20LinkStatus: "Not Linked",
      movementHistory: [],
      status: "Draft",
    });
    setTab(TABS[0]);
  }

  const statusTone =
    machine.status === "Active" ? "green" : machine.status === "Blocked" ? "red" : machine.status === "Ready" ? "blue" : "slate";

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">Machine Deployment – UX Prototype</h1>
            <p className="text-sm text-slate-600">
              Based on Excel Sheet 3: <span className="font-medium">“Deployement”</span>{" "}
              <span className="text-slate-500">(sheet label retained as-is)</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone}>Status: {machine.status}</Badge>

            <button className="px-3 py-2 rounded-xl border bg-white shadow-sm hover:bg-slate-50 text-sm" onClick={saveDraft}>
              Save Draft (prototype)
            </button>

            <button
              className="px-3 py-2 rounded-xl border bg-white shadow-sm hover:bg-slate-50 text-sm"
              onClick={resetDraft}
              title="Start a fresh deployment record"
            >
              New Draft
            </button>
          </div>
        </header>

        {/* Assumptions banner */}
        <div className="border rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Badge tone="amber">ASSUMPTIONS</Badge>
            </div>
            <div className="text-sm text-slate-700 space-y-1">
              {assumptions.map((a, idx) => (
                <div key={idx}>• {a}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 rounded-xl text-sm border shadow-sm ${
                tab === t ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50 border-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: tab content */}
          <div className="lg:col-span-2 border rounded-2xl bg-white p-5 shadow-sm space-y-5">
            {tab === "Receive" && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">1) Receiving Transaction</h2>
                  <Badge tone="blue">Workflow: {machine.inspectionWorkflow}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Receiving Reference Type" hint="Linked to PO / GRN / Invoice / Transfer note" required>
                    <select
                      className="w-full border rounded-xl px-3 py-2"
                      value={machine.receivingRefType}
                      onChange={(e) => update({ receivingRefType: e.target.value })}
                    >
                      {RECEIVING_REF_TYPES.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Receiving Reference No" required>
                    <input
                      className="w-full border rounded-xl px-3 py-2"
                      value={machine.receivingRefNo}
                      onChange={(e) => update({ receivingRefNo: e.target.value })}
                      placeholder="e.g., PO-2026-00123"
                    />
                  </Field>

                  <Field label="Received Date" required>
                    <input
                      type="date"
                      className="w-full border rounded-xl px-3 py-2"
                      value={machine.receivedDate}
                      onChange={(e) => update({ receivedDate: e.target.value })}
                    />
                  </Field>

                  <Field label="Inspection Workflow" hint="Automation / Standard / Rental" required>
                    <select
                      className="w-full border rounded-xl px-3 py-2"
                      value={machine.inspectionWorkflow}
                      onChange={(e) => update({ inspectionWorkflow: e.target.value })}
                    >
                      {INSPECTION_WORKFLOWS.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Machine Category" hint="Drives digital inspection checklist" required>
                    <select className="w-full border rounded-xl px-3 py-2" value={machine.machineCategory} onChange={(e) => setCategory(e.target.value)}>
                      {MACHINE_CATEGORIES.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Machine Description">
                    <input
                      className="w-full border rounded-xl px-3 py-2"
                      value={machine.machineDescription}
                      onChange={(e) => update({ machineDescription: e.target.value })}
                      placeholder="Short description (optional)"
                    />
                  </Field>
                </div>

                <div className="border rounded-2xl p-4 bg-slate-50">
                  <div className="text-sm font-medium text-slate-800 mb-1">Controls (from sheet)</div>
                  <ul className="text-sm text-slate-700 list-disc ml-5 space-y-1">
                    <li>Activation requires completed inspection and approval.</li>
                    <li>Mandatory fields must be present before readiness/activation.</li>
                    <li>Duplicate serial numbers are blocked.</li>
                  </ul>
                </div>
              </>
            )}

            {tab === "Inspect" && (
              <>
                <h2 className="text-lg font-semibold text-slate-900">1) Inspection Checklist & Outcome</h2>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={inspectionComplete ? "green" : "amber"}>Checklist: {inspectionComplete ? "Complete" : "Incomplete"}</Badge>
                  <Badge
                    tone={
                      machine.inspectionOutcome === "Accepted"
                        ? "green"
                        : machine.inspectionOutcome === "Rejected"
                        ? "red"
                        : machine.inspectionOutcome === "Quarantine"
                        ? "amber"
                        : "slate"
                    }
                  >
                    Outcome: {machine.inspectionOutcome}
                  </Badge>
                  <Badge tone={hasApproval ? "green" : "amber"}>Approvals: {hasApproval ? "Recorded" : "Missing"}</Badge>
                  <Badge tone={hasRejectionApproval ? "red" : "slate"}>Rejection: {hasRejectionApproval ? "Yes" : "No"}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Inspection Outcome" required>
                    <select className="w-full border rounded-xl px-3 py-2" value={machine.inspectionOutcome} onChange={(e) => update({ inspectionOutcome: e.target.value })}>
                      {["Pending", "Accepted", "Rejected", "Quarantine"].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Inspection Remarks">
                    <input
                      className="w-full border rounded-xl px-3 py-2"
                      value={machine.inspectionRemarks}
                      onChange={(e) => update({ inspectionRemarks: e.target.value })}
                      placeholder="Notes, deviations, observations"
                    />
                  </Field>
                </div>

                <div className="border rounded-2xl p-4">
                  <div className="text-sm font-medium text-slate-800 mb-3">
                    Digital Checklist (category: <span className="font-semibold">{machine.machineCategory}</span>)
                  </div>
                  <div className="space-y-2">
                    {machine.inspectionChecklist.map((item, idx) => (
                      <label key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={item.done}
                          onChange={(e) => {
                            const next = [...machine.inspectionChecklist];
                            next[idx] = { ...next[idx], done: e.target.checked };
                            update({ inspectionChecklist: next });
                          }}
                        />
                        <span>{item.text}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Evidence */}
                  <div className="border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-slate-800">Evidence Capture</div>
                      <div className="text-xs text-slate-500">(photos/documents)</div>
                    </div>

                    <div className="flex gap-2">
                      <button className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm" onClick={() => addEvidence(`Photo_${Date.now()}.jpg`, "Photo")}>
                        + Add Photo
                      </button>
                      <button className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm" onClick={() => addEvidence(`Doc_${Date.now()}.pdf`, "Document")}>
                        + Add Document
                      </button>
                    </div>

                    <div className="mt-3 space-y-2">
                      {machine.evidence.length === 0 ? (
                        <div className="text-sm text-slate-500">No evidence captured yet.</div>
                      ) : (
                        machine.evidence.map((e, i) => (
                          <div key={i} className="flex items-center justify-between text-sm border rounded-xl px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Badge tone="blue">{e.type}</Badge>
                              <span className="text-slate-800">{e.name}</span>
                            </div>
                            <span className="text-xs text-slate-500">{dateOnly(e.addedAt)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Approvals */}
                  <div className="border rounded-2xl p-4">
                    <div className="text-sm font-medium text-slate-800 mb-2">Role-based Approvals</div>
                    <div className="text-xs text-slate-500 mb-3">Time-stamped approvals with user accountability</div>

                    <div className="grid grid-cols-1 gap-2">
                      <button className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm text-left" onClick={() => addApproval("Stores", "stores.user", "Approved")}>
                        + Add Stores Approval (Approved)
                      </button>
                      <button className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm text-left" onClick={() => addApproval("Engineering", "eng.user", "Approved")}>
                        + Add Engineering Approval (Approved)
                      </button>
                      <button className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm text-left" onClick={() => addApproval("Quality", "qa.user", "Approved")}>
                        + Add Quality Approval (Approved)
                      </button>
                      <button className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm text-left" onClick={() => addApproval("Finance", "fin.user", "Approved")}>
                        + Add Finance Approval (Approved)
                      </button>
                      <button className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm text-left" onClick={() => addApproval("Quality", "qa.user", "Rejected")}>
                        + Add Quality Approval (Rejected)
                      </button>
                    </div>

                    <div className="mt-3 space-y-2">
                      {machine.approvals.length === 0 ? (
                        <div className="text-sm text-slate-500">No approvals recorded.</div>
                      ) : (
                        machine.approvals.map((a, i) => (
                          <div key={i} className="text-sm border rounded-xl px-3 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge tone={a.decision === "Approved" ? "green" : "red"}>{a.decision}</Badge>
                              <span className="text-slate-800">{a.role}</span>
                              <span className="text-slate-500">({a.user})</span>
                            </div>
                            <span className="text-xs text-slate-500">{a.at}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === "Identity & Tags" && (
              <>
                <h2 className="text-lg font-semibold text-slate-900">2) Unique ID, Serial Governance & Tagging</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Machine ID" hint="System-generated unique Machine ID" required>
                    <div className="flex gap-2">
                      <input className="w-full border rounded-xl px-3 py-2" value={machine.machineId} readOnly />
                      <button
                        className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm"
                        onClick={() => update({ machineId: shortId("MCH") })}
                        title="Regenerate ID (prototype)"
                      >
                        Regenerate
                      </button>
                    </div>
                  </Field>

                  <Field label="Serial Number" hint="Unique across machine registry" required>
                    <input
                      className={`w-full border rounded-xl px-3 py-2 ${duplicateSerial ? "border-red-400 bg-red-50" : ""}`}
                      value={machine.serialNumber}
                      onChange={(e) => update({ serialNumber: e.target.value })}
                      placeholder="e.g., SN-10023"
                    />
                    {duplicateSerial ? (
                      <div className="text-xs text-red-700 mt-1">Duplicate serial number found in registry → must be unique.</div>
                    ) : (
                      <div className="text-xs text-slate-500 mt-1">⚠️ Prototype check only; production uniqueness enforced in backend DB.</div>
                    )}
                  </Field>

                  <Field label="Tag Type" hint="Barcode / QR / NFC tag registration">
                    <select className="w-full border rounded-xl px-3 py-2" value={machine.tagType} onChange={(e) => update({ tagType: e.target.value })}>
                      {["Barcode", "QR", "NFC"].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Tag ID" hint="Value encoded in tag">
                    <input className="w-full border rounded-xl px-3 py-2" value={machine.tagId} onChange={(e) => update({ tagId: e.target.value })} placeholder="e.g., QR-PLANT-A-0001" />
                  </Field>
                </div>

                <div className="border rounded-2xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="text-sm font-medium text-slate-800">Tagging to Line | Plant | Division | Location</div>
                    <button className="px-3 py-1.5 rounded-xl border bg-white hover:bg-slate-50 text-sm" onClick={() => setMovementOpen(true)}>
                      View / Add Movement History
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Line">
                      <input className="w-full border rounded-xl px-3 py-2" value={machine.line} onChange={(e) => update({ line: e.target.value })} placeholder="e.g., Line 3" />
                    </Field>
                    <Field label="Plant" required>
                      <input className="w-full border rounded-xl px-3 py-2" value={machine.plant} onChange={(e) => update({ plant: e.target.value })} placeholder="e.g., Plant A" />
                    </Field>
                    <Field label="Division" required>
                      <input className="w-full border rounded-xl px-3 py-2" value={machine.division} onChange={(e) => update({ division: e.target.value })} placeholder="e.g., Division 1" />
                    </Field>
                    <Field label="Location" required>
                      <input className="w-full border rounded-xl px-3 py-2" value={machine.location} onChange={(e) => update({ location: e.target.value })} placeholder="e.g., Stores / Floor 2 / Bay 5" />
                    </Field>
                  </div>

                  {mandatoryMissing ? (
                    <div className="mt-3 text-sm text-red-700">Mandatory fields missing → readiness/activation will be blocked.</div>
                  ) : (
                    <div className="mt-3 text-sm text-green-700">Mandatory tagging fields look good.</div>
                  )}
                </div>

                <div className="border rounded-2xl p-4 bg-slate-50">
                  <div className="text-sm font-medium text-slate-800 mb-1">Controls (from sheet)</div>
                  <ul className="text-sm text-slate-700 list-disc ml-5 space-y-1">
                    <li>Duplicate machine identifiers prevented (serial uniqueness enforced in prototype).</li>
                    <li>Movement history with effective dates (implemented via modal log).</li>
                    <li>Serial correction approval (⚠️ assumed governance rule; not modeled in this prototype).</li>
                  </ul>
                </div>
              </>
            )}

            {tab === "Ownership" && (
              <>
                <h2 className="text-lg font-semibold text-slate-900">3) Ownership Classification & Rental Tracking</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Ownership Type" required>
                    <select className="w-full border rounded-xl px-3 py-2" value={machine.ownershipType} onChange={(e) => update({ ownershipType: e.target.value })}>
                      {OWNERSHIP_TYPES.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Ownership Change Tracking" hint="Effective dates (prototype)">
                    <button
                      className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm"
                      onClick={() =>
                        update({
                          ownershipHistory: [
                            ...machine.ownershipHistory,
                            { from: machine.ownershipType, to: machine.ownershipType, effectiveDate: dateOnly(nowISO()), notes: "Ownership recorded" },
                          ],
                        })
                      }
                    >
                      Add Ownership History Entry
                    </button>
                  </Field>
                </div>

                {machine.ownershipType === "3rd-party Rental" && (
                  <div className="border rounded-2xl p-4 space-y-4">
                    <div className="text-sm font-medium text-slate-800">3rd-party Rental Contract</div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Vendor / Lessor" required>
                        <input className="w-full border rounded-xl px-3 py-2" value={machine.thirdPartyVendor} onChange={(e) => update({ thirdPartyVendor: e.target.value })} placeholder="Vendor name" />
                      </Field>

                      <Field label="Contract No" required>
                        <input className="w-full border rounded-xl px-3 py-2" value={machine.contractNo} onChange={(e) => update({ contractNo: e.target.value })} placeholder="e.g., RENT-2026-0007" />
                      </Field>

                      <Field label="Contract Start" required>
                        <input type="date" className="w-full border rounded-xl px-3 py-2" value={machine.contractStart} onChange={(e) => update({ contractStart: e.target.value })} />
                      </Field>

                      <Field label="Contract End" required>
                        <input type="date" className="w-full border rounded-xl px-3 py-2" value={machine.contractEnd} onChange={(e) => update({ contractEnd: e.target.value })} />
                      </Field>

                      <Field label="Ruber 2.0 Link Status" hint="(sheet says: Connect to Ruber 2.0)">
                        <select className="w-full border rounded-xl px-3 py-2" value={machine.ruber20LinkStatus} onChange={(e) => update({ ruber20LinkStatus: e.target.value })}>
                          {["Not Linked", "Linked", "Sync Error"].map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                )}

                {machine.ownershipType === "Internal Rental" && (
                  <div className="border rounded-2xl p-4 space-y-3">
                    <div className="text-sm font-medium text-slate-800">Internal Rental Rate & Transfer</div>
                    <Field label="Internal Rental Rate" hint="Per day/week/month (as per org policy)">
                      <input className="w-full border rounded-xl px-3 py-2" value={machine.internalRentalRate} onChange={(e) => update({ internalRentalRate: e.target.value })} placeholder="e.g., LKR 15,000 / day" />
                    </Field>
                  </div>
                )}

                <div className="border rounded-2xl p-4">
                  <div className="text-sm font-medium text-slate-800 mb-2">Ownership History (effective dates)</div>
                  {machine.ownershipHistory.length === 0 ? (
                    <div className="text-sm text-slate-500">No ownership changes recorded.</div>
                  ) : (
                    <div className="space-y-2">
                      {machine.ownershipHistory.map((h, i) => (
                        <div key={i} className="text-sm border rounded-xl px-3 py-2 flex items-center justify-between">
                          <div className="text-slate-800">
                            {h.from} → {h.to} <span className="text-slate-500">({h.notes})</span>
                          </div>
                          <div className="text-xs text-slate-500">Effective: {h.effectiveDate}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {tab === "Summary" && (
              <>
                <h2 className="text-lg font-semibold text-slate-900">Deployment Summary & Activation</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-2xl p-4">
                    <div className="text-sm font-medium text-slate-800 mb-2">Identity</div>
                    <div className="text-sm text-slate-700 space-y-1">
                      <div>
                        <span className="text-slate-500">Machine ID:</span> {machine.machineId}
                      </div>
                      <div>
                        <span className="text-slate-500">Serial No:</span>{" "}
                        {machine.serialNumber || <span className="text-red-600">Missing</span>}
                      </div>
                      <div>
                        <span className="text-slate-500">Tag:</span> {machine.tagType} / {machine.tagId || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-2xl p-4">
                    <div className="text-sm font-medium text-slate-800 mb-2">Receiving</div>
                    <div className="text-sm text-slate-700 space-y-1">
                      <div>
                        <span className="text-slate-500">Ref:</span> {machine.receivingRefType} /{" "}
                        {machine.receivingRefNo || <span className="text-red-600">Missing</span>}
                      </div>
                      <div>
                        <span className="text-slate-500">Date:</span> {machine.receivedDate || "—"}
                      </div>
                      <div>
                        <span className="text-slate-500">Workflow:</span> {machine.inspectionWorkflow}
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-2xl p-4">
                    <div className="text-sm font-medium text-slate-800 mb-2">Tagging</div>
                    <div className="text-sm text-slate-700 space-y-1">
                      <div>
                        <span className="text-slate-500">Line:</span> {machine.line || "—"}
                      </div>
                      <div>
                        <span className="text-slate-500">Plant:</span>{" "}
                        {machine.plant || <span className="text-red-600">Missing</span>}
                      </div>
                      <div>
                        <span className="text-slate-500">Division:</span>{" "}
                        {machine.division || <span className="text-red-600">Missing</span>}
                      </div>
                      <div>
                        <span className="text-slate-500">Location:</span>{" "}
                        {machine.location || <span className="text-red-600">Missing</span>}
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-2xl p-4">
                    <div className="text-sm font-medium text-slate-800 mb-2">Inspection</div>
                    <div className="text-sm text-slate-700 space-y-1">
                      <div>
                        <span className="text-slate-500">Outcome:</span> {machine.inspectionOutcome}
                      </div>
                      <div>
                        <span className="text-slate-500">Checklist:</span> {inspectionComplete ? "Complete" : "Incomplete"}
                      </div>
                      <div>
                        <span className="text-slate-500">Approvals:</span> {machine.approvals.length}
                      </div>
                      <div>
                        <span className="text-slate-500">Evidence:</span> {machine.evidence.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proactive blockers */}
                {!canMarkReady ? (
                  <div className="border rounded-2xl p-4 mt-2 bg-red-50 border-red-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-red-800">Cannot mark Ready yet</div>
                        <ul className="text-sm text-red-700 list-disc ml-5 mt-2 space-y-1">
                          {blockers.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                      <Badge tone="red">BLOCKED</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-2xl p-4 mt-2 bg-green-50 border-green-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-green-800">All readiness controls satisfied</div>
                        <div className="text-sm text-green-700 mt-1">This record can be marked Ready and then Activated (handover).</div>
                      </div>
                      <Badge tone="green">READY OK</Badge>
                    </div>
                  </div>
                )}

                <div className="border rounded-2xl p-4 bg-slate-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-900">Activation Gate (Controls)</div>
                      <div className="text-sm text-slate-700">
                        System prevents activation without completed inspection + approval; rejected/quarantine blocks deployment; duplicate serial blocks.
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm" onClick={markReady}>
                        Mark Ready
                      </button>
                      <button
                        className="px-3 py-2 rounded-xl border text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:border-slate-300"
                        onClick={activate}
                        disabled={machine.status !== "Ready"}
                        title={machine.status !== "Ready" ? "Must be Ready to Activate" : "Activate (handover into operations)"}
                      >
                        Activate (Handover)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-slate-800">Location Movement History (effective dates)</div>
                    <button className="px-3 py-1.5 rounded-xl border bg-white hover:bg-slate-50 text-sm" onClick={() => setMovementOpen(true)}>
                      View / Add
                    </button>
                  </div>

                  {machine.movementHistory.length === 0 ? (
                    <div className="text-sm text-slate-500 mt-2">No movement recorded in this draft.</div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {machine.movementHistory.map((m, i) => (
                        <div key={i} className="text-sm border rounded-xl px-3 py-2 flex items-center justify-between">
                          <div className="text-slate-800">
                            {m.from} → {m.to} <span className="text-slate-500">({m.reason})</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {m.effectiveDate} • {m.user}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right: registry + quick rules */}
          <div className="border rounded-2xl bg-white p-5 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-900">Machine Registry (Prototype)</h3>
              <p className="text-sm text-slate-600">
                Used to enforce <span className="font-medium">serial uniqueness</span> and show activated machines.
              </p>
            </div>

            <div className="border rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 bg-slate-100 text-xs font-medium text-slate-700 px-3 py-2">
                <div className="col-span-5">Machine ID</div>
                <div className="col-span-4">Serial</div>
                <div className="col-span-3">Status</div>
              </div>
              <div className="divide-y">
                {registry.map((r, i) => (
                  <div key={i} className="grid grid-cols-12 px-3 py-2 text-sm">
                    <div className="col-span-5 text-slate-800">{r.machineId}</div>
                    <div className="col-span-4 text-slate-700">{r.serialNumber}</div>
                    <div className="col-span-3">
                      <Badge tone={r.status === "Active" ? "green" : "slate"}>{r.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-2xl p-4 bg-slate-50">
              <div className="text-sm font-medium text-slate-800 mb-2">Controls enforced in prototype</div>
              <ul className="text-sm text-slate-700 list-disc ml-5 space-y-1">
                <li>Cannot Activate unless checklist complete + approved.</li>
                <li>Rejected/Quarantine outcome blocks deployment.</li>
                <li>Rejection approval blocks deployment.</li>
                <li>Duplicate serial number blocked.</li>
                <li>Mandatory fields must be present.</li>
              </ul>
            </div>

            <div className="border rounded-2xl p-4">
              <div className="text-sm font-medium text-slate-800 mb-2">Quick nav tip</div>
              <div className="text-sm text-slate-600">
                Start with <span className="font-medium">Receive</span> → complete <span className="font-medium">Inspect</span> → fill{" "}
                <span className="font-medium">Identity & Tags</span> → optionally set <span className="font-medium">Ownership</span> → activate in{" "}
                <span className="font-medium">Summary</span>.
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Prototype-only: in production, serial uniqueness and activation gating must also be enforced in backend services + database constraints.
            </div>
          </div>
        </div>
      </div>

      {/* Movement History Modal */}
      <Modal
        open={movementOpen}
        title="Location Movement History (effective dates) – Prototype"
        onClose={() => setMovementOpen(false)}
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-700">
            Captures from/to location, effective date, user, and reason. This satisfies the sheet requirement for movement history tracking.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="From Location" hint="Leave blank for initial placement">
              <input className="w-full border rounded-xl px-3 py-2" placeholder="e.g., Stores" id="fromLoc" />
            </Field>
            <Field label="To Location" hint="New location" required>
              <input className="w-full border rounded-xl px-3 py-2" placeholder="e.g., Line 3 / Bay 5" id="toLoc" />
            </Field>
            <Field label="Effective Date" required>
              <input type="date" className="w-full border rounded-xl px-3 py-2" defaultValue={dateOnly(nowISO())} id="effDate" />
            </Field>
            <Field label="Reason" hint="Optional">
              <input className="w-full border rounded-xl px-3 py-2" placeholder="e.g., Production demand change" id="reason" />
            </Field>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-xl border bg-slate-900 text-white hover:bg-slate-800 text-sm"
              onClick={() => {
                // read inputs (prototype-only; no ref/form lib)
                const fromLoc = document.getElementById("fromLoc")?.value;
                const toLoc = document.getElementById("toLoc")?.value;
                const effDate = document.getElementById("effDate")?.value;
                const reason = document.getElementById("reason")?.value;

                if (!String(toLoc || "").trim()) {
                  alert("To Location is required.");
                  return;
                }
                addMovement(fromLoc, toLoc, effDate, reason);

                // clear (keep date)
                if (document.getElementById("fromLoc")) document.getElementById("fromLoc").value = "";
                if (document.getElementById("toLoc")) document.getElementById("toLoc").value = "";
                if (document.getElementById("reason")) document.getElementById("reason").value = "";
              }}
            >
              Add Movement Entry
            </button>

            <button className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm" onClick={() => setMovementOpen(false)}>
              Done
            </button>
          </div>

          <div className="border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-100 text-xs font-medium text-slate-700 px-3 py-2">
              <div className="col-span-4">From</div>
              <div className="col-span-4">To</div>
              <div className="col-span-2">Effective</div>
              <div className="col-span-2">User</div>
            </div>
            <div className="divide-y">
              {machine.movementHistory.length === 0 ? (
                <div className="px-3 py-3 text-sm text-slate-500">No movement entries yet.</div>
              ) : (
                machine.movementHistory.map((m, i) => (
                  <div key={i} className="grid grid-cols-12 px-3 py-2 text-sm">
                    <div className="col-span-4 text-slate-700">{m.from}</div>
                    <div className="col-span-4 text-slate-800">{m.to}</div>
                    <div className="col-span-2 text-slate-600">{m.effectiveDate}</div>
                    <div className="col-span-2 text-slate-600">{m.user}</div>
                    <div className="col-span-12 text-xs text-slate-500 mt-1">Reason: {m.reason}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-xs text-slate-500">
            ⚠️ Prototype note: this modal uses DOM lookups for simplicity. Production implementation should use controlled inputs or a form library.
          </div>
        </div>
      </Modal>
    </div>
  );
}
