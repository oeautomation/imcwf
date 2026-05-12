// AcquisitionRequestWizard.jsx
// Full regenerated UX prototype with:
// 1) Fixed 4-level approval matrix: Plant → Division → Group → Finance
// 2) Clear Budget Lock (Commitment) vs Actual Tracking (PO / GRN / Invoice)
// 3) Optional escalation approvers (additive only), e.g., Executive Committee for payback breach, Exception Approver for exceptions
//
// Drop into a Vite+React project and render <AcquisitionRequestWizard />.
// No backend calls yet—this is a UX prototype with rule-driven validation + console payload.

import React, { useMemo, useState } from "react";

const CAPEX_THRESHOLD = 50000; // configurable
const ROI_REQUIRED_THRESHOLD = 50000;
const MAX_PAYBACK_YEARS = 3;

// Fixed policy approval matrix (as per your requirement)
const BASE_APPROVAL_MATRIX = ["Plant", "Division", "Group", "Finance"];

const PURPOSES = [
  "Capacity Expansion",
  "Replacement",
  "Compliance / Safety",
  "Cost Reduction",
  "Quality Improvement",
];

const BENEFITS = [
  "Revenue increase",
  "Cost reduction",
  "Downtime reduction",
  "Compliance risk mitigation",
];

const MACHINE_CATEGORIES = ["Production", "Utilities", "Automation", "Quality/Inspection", "Other"];

const MACHINE_MODELS = [
  { id: "M-100", name: "Model 100 - Packaging Line", category: "Production", vendor: "Acme Machines" },
  { id: "M-210", name: "Model 210 - CNC Cutter", category: "Production", vendor: "Kappa Industrial" },
  { id: "M-330", name: "Model 330 - Vision Inspection", category: "Quality/Inspection", vendor: "OptiSense" },
  { id: "M-450", name: "Model 450 - HVAC Chiller", category: "Utilities", vendor: "CoolFlow" },
];

const VENDORS = ["Acme Machines", "Kappa Industrial", "OptiSense", "CoolFlow", "Other"];

const ORG_UNITS = ["Plant A - Production", "Plant A - Engineering", "Plant B - Production", "QA Department"];

const EXISTING_MACHINES = [
  { machineTwinId: "TW-00021", assetTag: "PL-A-001", model: "Model 100 - Packaging Line", plant: "Plant A" },
  { machineTwinId: "TW-00044", assetTag: "CNC-B-014", model: "Model 210 - CNC Cutter", plant: "Plant B" },
  { machineTwinId: "TW-00057", assetTag: "VIS-A-003", model: "Model 330 - Vision Inspection", plant: "Plant A" },
];

// Policy versions (prototype)
const CAPEX_POLICY_VERSION = "CAPEX-POL-2026.01";
const APPROVAL_MATRIX_VERSION = "APR-MTX-2026.01";

// Helpers
const money = (n, currency = "USD") =>
  Number.isFinite(n) ? new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n) : "—";

const clampNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function computeRoiPayback({ estCost, annualBenefit, annualOpCost }) {
  const netAnnual = Math.max(0, (annualBenefit ?? 0) - (annualOpCost ?? 0));
  const roi = estCost > 0 ? netAnnual / estCost : 0; // fraction
  const paybackYears = netAnnual > 0 ? estCost / netAnnual : Infinity;
  return { netAnnual, roi, paybackYears };
}

function buildApprovalPath({
  isCapex,
  paybackBreached,
  exceptionRequested,
}) {
  // Important: the base is fixed and additive (never substituted).
  // If non-CapEx, the base chain can be shorter (policy choice). Here we keep it simple:
  // - CapEx: Plant → Division → Group → Finance
  // - Non-CapEx: Plant → Division (example; configurable)
  const base = isCapex ? BASE_APPROVAL_MATRIX : ["Plant", "Division"];

  const extras = [];
  if (paybackBreached) extras.push("Executive Committee");
  if (exceptionRequested) extras.push("Exception Approver");

  // De-dupe, preserve order
  const path = [...base, ...extras].filter((a, i, arr) => arr.indexOf(a) === i);
  return path;
}

// Budget/Finance model:
// - Approved Budget (planned) = estimated cost at request stage
// - Committed (Locked) = 0 until approvals complete (in real system)
// - Actual Spent = derived from invoices (ERP truth)
// For prototype, allow adding milestones to simulate ERP integration.
const MILESTONE_TYPES = ["PO", "GRN", "INVOICE"];

function Badge({ children, tone = "neutral" }) {
  const styles = {
    neutral: { bg: "#eef2ff", fg: "#3730a3", bd: "#c7d2fe" },
    ok: { bg: "#ecfdf5", fg: "#065f46", bd: "#6ee7b7" },
    warn: { bg: "#fffbeb", fg: "#92400e", bd: "#fde68a" },
    bad: { bg: "#fef2f2", fg: "#991b1b", bd: "#fecaca" },
  }[tone];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 999,
        border: `1px solid ${styles.bd}`,
        background: styles.bg,
        color: styles.fg,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <label style={{ fontWeight: 800, fontSize: 13 }}>{label}</label>
        {hint ? <span style={{ fontSize: 12, color: "#6b7280" }}>{hint}</span> : null}
      </div>
      <div style={{ marginTop: 6 }}>{children}</div>
      {error ? <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>{error}</div> : null}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#e5e7eb", margin: "16px 0" }} />;
}

function StepPills({ steps, current }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
      {steps.map((s, i) => (
        <div
          key={s}
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 900,
            border: `1px solid ${i === current ? "#111827" : "#e5e7eb"}`,
            background: i === current ? "#111827" : "#fff",
            color: i === current ? "#fff" : "#111827",
          }}
        >
          {i + 1}. {s}
        </div>
      ))}
    </div>
  );
}

export default function AcquisitionRequestWizard() {
  const steps = [
    "Basic Info",
    "Machine",
    "Justification",
    "Financials",
    "CapEx & Budget",
    "Review & Submit",
  ];

  const [step, setStep] = useState(0);

  // Form state (prototype)
  const [form, setForm] = useState({
    // Screen 1
    title: "",
    requesterOrgUnit: ORG_UNITS[0],
    purpose: "",
    estCost: "",
    currency: "USD",

    // Screen 2
    category: "",
    modelId: "",
    vendor: "",
    quantity: 1,
    expectedDelivery: "",
    replacedMachineTwinId: "",

    // Screen 3
    businessJustification: "",
    benefits: [],
    capacityEvidenceRef: "",
    complianceRef: "",

    // Screen 4
    usefulLifeYears: 7,
    annualBenefit: "",
    annualOpCost: "",
    overrideAssumptions: false,
    overrideJustification: "",

    // Screen 5
    budgetRef: "",
    budgetAvailable: "",
    exceptionRequested: false,
    exceptionReason: "",

    // Integration milestones (simulate ERP sync)
    milestones: [
      // { type: "PO", ref: "PO-123", amount: 120000, date: "2026-02-10" }
    ],
  });

  const set = (patch) => setForm((p) => ({ ...p, ...patch }));

  const estCostNum = useMemo(() => clampNum(form.estCost), [form.estCost]);
  const annualBenefitNum = useMemo(() => clampNum(form.annualBenefit), [form.annualBenefit]);
  const annualOpCostNum = useMemo(() => clampNum(form.annualOpCost), [form.annualOpCost]);

  const isCapex = estCostNum >= CAPEX_THRESHOLD && estCostNum > 0;

  const { netAnnual, roi, paybackYears } = useMemo(
    () =>
      computeRoiPayback({
        estCost: estCostNum,
        annualBenefit: annualBenefitNum,
        annualOpCost: annualOpCostNum,
      }),
    [estCostNum, annualBenefitNum, annualOpCostNum]
  );

  const roiRequired = estCostNum >= ROI_REQUIRED_THRESHOLD;
  const paybackBreached = Number.isFinite(paybackYears) && paybackYears > MAX_PAYBACK_YEARS;

  const approvalPath = useMemo(
    () =>
      buildApprovalPath({
        isCapex,
        paybackBreached,
        exceptionRequested: form.exceptionRequested,
      }),
    [isCapex, paybackBreached, form.exceptionRequested]
  );

  const selectedModel = useMemo(() => MACHINE_MODELS.find((m) => m.id === form.modelId), [form.modelId]);

  // Finance rollups from milestones
  const milestoneTotals = useMemo(() => {
    const totals = { PO: 0, GRN: 0, INVOICE: 0 };
    for (const m of form.milestones) {
      if (!m?.type) continue;
      totals[m.type] += clampNum(m.amount);
    }
    return totals;
  }, [form.milestones]);

  // Prototype commitment lock behavior:
  // In real life, commitment is created/locked after approvals. Here we show what it would look like.
  const approvedBudgetPlanned = estCostNum; // planned at request time
  const committedLocked = 0; // would become approvedBudgetPlanned once fully approved
  const actualSpent = milestoneTotals.INVOICE;

  const errors = useMemo(() => {
    const e = {};

    // Step 1
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.purpose) e.purpose = "Purpose is required.";
    if (!estCostNum || estCostNum <= 0) e.estCost = "Estimated cost must be > 0.";

    // Step 2
    if (!form.category) e.category = "Machine category is required.";
    if (!form.modelId) e.modelId = "Machine model is required.";
    if (!form.vendor) e.vendor = "Vendor is required.";
    if (!form.quantity || form.quantity < 1) e.quantity = "Quantity must be at least 1.";
    if (form.purpose === "Replacement" && !form.replacedMachineTwinId)
      e.replacedMachineTwinId = "Replacement requires selecting the machine being replaced.";

    // Step 3
    if (!form.businessJustification.trim()) e.businessJustification = "Business justification is required.";
    if (!form.benefits.length) e.benefits = "Select at least one measurable benefit.";
    if (form.purpose === "Capacity Expansion" && !form.capacityEvidenceRef.trim())
      e.capacityEvidenceRef = "Capacity expansion requires an evidence reference (utilization/demand).";
    if (form.purpose === "Compliance / Safety" && !form.complianceRef.trim())
      e.complianceRef = "Compliance/Safety requires a regulatory/audit reference.";

    // Step 4
    if (roiRequired) {
      if (!annualBenefitNum || annualBenefitNum <= 0)
        e.annualBenefit = "Annual benefit is required for ROI evaluation.";
    }
    if (form.overrideAssumptions && !form.overrideJustification.trim())
      e.overrideJustification = "Override justification is required when assumptions are overridden.";

    // Step 5 (CapEx & Budget)
    if (isCapex) {
      if (!form.budgetRef.trim()) e.budgetRef = "Budget reference is required for CapEx.";
      const budgetAvailNum = clampNum(form.budgetAvailable);
      if (!budgetAvailNum || budgetAvailNum <= 0) e.budgetAvailable = "Budget available must be > 0.";
      if (budgetAvailNum > 0 && budgetAvailNum < estCostNum && !form.exceptionRequested)
        e.budgetAvailable = "Insufficient budget. Request an exception or adjust cost/budget.";
      if (form.exceptionRequested && !form.exceptionReason.trim())
        e.exceptionReason = "Exception reason is required when requesting an exception.";
    } else {
      // Even for non-CapEx you could optionally require budgetRef; keeping it optional.
      if (form.exceptionRequested && !form.exceptionReason.trim())
        e.exceptionReason = "Exception reason is required when requesting an exception.";
    }

    return e;
  }, [
    form,
    estCostNum,
    isCapex,
    roiRequired,
    annualBenefitNum,
  ]);

  const stepHasErrors = (s) => {
    const keysByStep = [
      ["title", "purpose", "estCost"],
      ["category", "modelId", "vendor", "quantity", "replacedMachineTwinId"],
      ["businessJustification", "benefits", "capacityEvidenceRef", "complianceRef"],
      ["annualBenefit", "overrideJustification"],
      ["budgetRef", "budgetAvailable", "exceptionReason"],
      [],
    ];
    const keys = keysByStep[s] || [];
    return keys.some((k) => Boolean(errors[k]));
  };

  const canNext = !stepHasErrors(step);
  const canSubmit = Object.keys(errors).length === 0;

  const next = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const policyApplied = useMemo(
    () => ({
      capexPolicyVersion: CAPEX_POLICY_VERSION,
      approvalMatrixVersion: APPROVAL_MATRIX_VERSION,
      approvalMatrixBase: BASE_APPROVAL_MATRIX,
    }),
    []
  );

  const onSubmit = () => {
    const payload = {
      acquisitionRequest: {
        title: form.title.trim(),
        requesterOrgUnit: form.requesterOrgUnit,
        purpose: form.purpose,
        estimatedCost: estCostNum,
        currency: form.currency,

        machine: {
          category: form.category,
          modelId: form.modelId,
          modelName: selectedModel?.name,
          vendor: form.vendor,
          quantity: form.quantity,
          expectedDelivery: form.expectedDelivery || null,
          replacedMachineTwinId: form.purpose === "Replacement" ? form.replacedMachineTwinId : null,
        },

        justification: {
          narrative: form.businessJustification.trim(),
          benefits: form.benefits,
          capacityEvidenceRef: form.purpose === "Capacity Expansion" ? form.capacityEvidenceRef.trim() : null,
          complianceRef: form.purpose === "Compliance / Safety" ? form.complianceRef.trim() : null,
        },

        financials: {
          usefulLifeYears: form.usefulLifeYears,
          annualBenefit: annualBenefitNum,
          annualOpCost: annualOpCostNum,
          netAnnual,
          roi,
          paybackYears,
          overrideAssumptions: form.overrideAssumptions,
          overrideJustification: form.overrideAssumptions ? form.overrideJustification.trim() : null,
        },

        governance: {
          isCapex,
          capexThreshold: CAPEX_THRESHOLD,
          roiRequiredThreshold: ROI_REQUIRED_THRESHOLD,
          maxPaybackYears: MAX_PAYBACK_YEARS,
          paybackBreached,
          policyApplied,
          approvalPath, // reflects Plant → Division → Group → Finance (plus any additive escalation)
          budgetRef: form.budgetRef.trim() || null,
          budgetAvailable: clampNum(form.budgetAvailable) || null,
          exceptionRequested: form.exceptionRequested,
          exceptionReason: form.exceptionRequested ? form.exceptionReason.trim() : null,
          // Budget lock vs actual tracking:
          budgetPlanned: approvedBudgetPlanned,
          committedLocked,
          actualSpent,
          milestones: form.milestones,
        },
      },
      eventsToEmit: ["AcquisitionSubmitted"],
    };

    alert("Submitted (prototype). Check console for payload.");
    console.log("AcquisitionRequest payload:", payload);
  };

  return (
    <div
      style={{
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
        padding: 18,
        maxWidth: 1040,
        margin: "0 auto",
        color: "#111827",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>New Acquisition Request</h2>
          <div style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>
            Regenerated prototype: <strong>fixed approval matrix</strong> + <strong>budget lock vs actual</strong>.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Badge tone={isCapex ? "warn" : "neutral"}>{isCapex ? "CapEx" : "Non-CapEx"}</Badge>
          <Badge tone="neutral">Approval: {isCapex ? "Plant→Division→Group→Finance" : "Plant→Division"}</Badge>
          {paybackBreached ? <Badge tone="warn">Payback Breach</Badge> : <Badge tone="ok">Payback OK</Badge>}
        </div>
      </header>

      <Divider />

      <StepPills steps={steps} current={step} />

      <div style={{ display: "grid", gridTemplateColumns: "1.65fr 1fr", gap: 16 }}>
        {/* Main */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, background: "#fff" }}>
          {step === 0 && (
            <div>
              <h3 style={{ marginTop: 0 }}>1) Basic Request Info</h3>

              <Field label="Request Title" error={errors.title}>
                <input
                  value={form.title}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder="e.g., Replace aging CNC cutter for Line B"
                  style={inputStyle}
                />
              </Field>

              <Field label="Requesting Department" hint="Auto from user profile (prototype)">
                <select
                  value={form.requesterOrgUnit}
                  onChange={(e) => set({ requesterOrgUnit: e.target.value })}
                  style={inputStyle}
                >
                  {ORG_UNITS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Acquisition Purpose" error={errors.purpose} hint="Mandatory">
                <select value={form.purpose} onChange={(e) => set({ purpose: e.target.value })} style={inputStyle}>
                  <option value="">Select purpose…</option>
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12 }}>
                <Field label="Estimated Cost" error={errors.estCost} hint="Triggers CapEx controls">
                  <input
                    value={form.estCost}
                    onChange={(e) => set({ estCost: e.target.value.replace(/[^\d.]/g, "") })}
                    placeholder="e.g., 120000"
                    style={inputStyle}
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Currency">
                  <select value={form.currency} onChange={(e) => set({ currency: e.target.value })} style={inputStyle}>
                    <option value="USD">USD</option>
                    <option value="AUD">AUD</option>
                    <option value="LKR">LKR</option>
                    <option value="EUR">EUR</option>
                  </select>
                </Field>
              </div>

              {isCapex ? (
                <div style={infoBox("warn")}>
                  <strong>CapEx governance applies.</strong> Approval matrix is{" "}
                  <strong>Plant → Division → Group → Finance</strong>. Budget reference is mandatory.
                </div>
              ) : (
                <div style={infoBox("neutral")}>
                  This request is below the CapEx threshold. A lighter approval path applies (prototype: Plant → Division).
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 style={{ marginTop: 0 }}>2) Machine Definition</h3>

              <Field label="Machine Category" error={errors.category}>
                <select value={form.category} onChange={(e) => set({ category: e.target.value })} style={inputStyle}>
                  <option value="">Select category…</option>
                  {MACHINE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Machine Model" error={errors.modelId} hint="From catalog (prototype list)">
                <select
                  value={form.modelId}
                  onChange={(e) => {
                    const modelId = e.target.value;
                    const m = MACHINE_MODELS.find((x) => x.id === modelId);
                    set({ modelId, vendor: m?.vendor ?? form.vendor, category: m?.category ?? form.category });
                  }}
                  style={inputStyle}
                >
                  <option value="">Select model…</option>
                  {MACHINE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Vendor" error={errors.vendor}>
                <select value={form.vendor} onChange={(e) => set({ vendor: e.target.value })} style={inputStyle}>
                  <option value="">Select vendor…</option>
                  {VENDORS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 12 }}>
                <Field label="Quantity" error={errors.quantity}>
                  <input
                    value={form.quantity}
                    onChange={(e) => set({ quantity: Math.max(1, Number(e.target.value || 1)) })}
                    type="number"
                    min={1}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Expected Delivery Date" hint="Optional">
                  <input
                    value={form.expectedDelivery}
                    onChange={(e) => set({ expectedDelivery: e.target.value })}
                    type="date"
                    style={inputStyle}
                  />
                </Field>
              </div>

              {form.purpose === "Replacement" && (
                <Field label="Machine Being Replaced" error={errors.replacedMachineTwinId} hint="Mandatory for replacement">
                  <select
                    value={form.replacedMachineTwinId}
                    onChange={(e) => set({ replacedMachineTwinId: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">Search/select existing machine…</option>
                    {EXISTING_MACHINES.map((x) => (
                      <option key={x.machineTwinId} value={x.machineTwinId}>
                        {x.assetTag} — {x.model} ({x.plant})
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              <div style={infoBox("neutral")}>
                <strong>Digital Twin note:</strong> On submission, a MachineTwin is created (REQUESTED). It cannot become
                operational until receipt → inspection → commissioning gates complete.
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ marginTop: 0 }}>3) Business Justification</h3>

              <Field label="Business Justification" error={errors.businessJustification} hint="Mandatory">
                <textarea
                  value={form.businessJustification}
                  onChange={(e) => set({ businessJustification: e.target.value })}
                  placeholder="Describe the business need, impact, and why this acquisition is justified."
                  style={{ ...inputStyle, height: 110, resize: "vertical" }}
                />
              </Field>

              <Field label="Expected Benefits" error={errors.benefits} hint="Select at least one">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {BENEFITS.map((b) => (
                    <label key={b} style={checkLabelStyle}>
                      <input
                        type="checkbox"
                        checked={form.benefits.includes(b)}
                        onChange={(e) => {
                          const nextBenefits = e.target.checked
                            ? [...form.benefits, b]
                            : form.benefits.filter((x) => x !== b);
                          set({ benefits: nextBenefits });
                        }}
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </Field>

              {form.purpose === "Capacity Expansion" && (
                <Field label="Capacity Evidence Reference" error={errors.capacityEvidenceRef} hint="e.g., utilization report link">
                  <input
                    value={form.capacityEvidenceRef}
                    onChange={(e) => set({ capacityEvidenceRef: e.target.value })}
                    placeholder="Paste link / reference ID to utilization or demand forecast evidence"
                    style={inputStyle}
                  />
                </Field>
              )}

              {form.purpose === "Compliance / Safety" && (
                <Field label="Regulatory / Audit Reference" error={errors.complianceRef} hint="e.g., audit finding ID">
                  <input
                    value={form.complianceRef}
                    onChange={(e) => set({ complianceRef: e.target.value })}
                    placeholder="Reference ID / policy / audit finding that mandates this acquisition"
                    style={inputStyle}
                  />
                </Field>
              )}

              <div style={infoBox("neutral")}>
                Tip: Keep justification comparable across requests (what changes, why now, measurable impact).
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ marginTop: 0 }}>4) Financial Evaluation</h3>

              <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12 }}>
                <Field label="Useful Life (years)" hint="Policy default (editable)">
                  <input
                    value={form.usefulLifeYears}
                    onChange={(e) => set({ usefulLifeYears: Math.max(1, Number(e.target.value || 1)) })}
                    type="number"
                    min={1}
                    style={inputStyle}
                  />
                </Field>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label style={checkLabelStyle}>
                    <input
                      type="checkbox"
                      checked={form.overrideAssumptions}
                      onChange={(e) => set({ overrideAssumptions: e.target.checked })}
                    />
                    <span>Override standard financial assumptions</span>
                  </label>
                  {form.overrideAssumptions ? <Badge tone="warn">Justification Required</Badge> : null}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field
                  label="Annual Benefit"
                  error={errors.annualBenefit}
                  hint={roiRequired ? "Required (ROI evaluation applies)" : "Optional"}
                >
                  <input
                    value={form.annualBenefit}
                    onChange={(e) => set({ annualBenefit: e.target.value.replace(/[^\d.]/g, "") })}
                    placeholder="e.g., 60000"
                    style={inputStyle}
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Annual Operating Cost" hint="Optional">
                  <input
                    value={form.annualOpCost}
                    onChange={(e) => set({ annualOpCost: e.target.value.replace(/[^\d.]/g, "") })}
                    placeholder="e.g., 8000"
                    style={inputStyle}
                    inputMode="decimal"
                  />
                </Field>
              </div>

              {form.overrideAssumptions && (
                <Field label="Override Justification" error={errors.overrideJustification} hint="Mandatory when overriding">
                  <textarea
                    value={form.overrideJustification}
                    onChange={(e) => set({ overrideJustification: e.target.value })}
                    placeholder="Explain why standard assumptions do not apply."
                    style={{ ...inputStyle, height: 80, resize: "vertical" }}
                  />
                </Field>
              )}

              <Divider />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <KpiCard label="Net Annual Benefit" value={money(netAnnual, form.currency)} tone={netAnnual > 0 ? "ok" : "warn"} />
                <KpiCard label="ROI" value={Number.isFinite(roi) ? `${(roi * 100).toFixed(1)}%` : "—"} tone="neutral" />
                <KpiCard
                  label="Payback Period"
                  value={Number.isFinite(paybackYears) ? `${paybackYears.toFixed(2)} yrs` : "∞"}
                  tone={paybackBreached ? "warn" : "ok"}
                />
              </div>

              {paybackBreached && (
                <div style={infoBox("warn")}>
                  <strong>Payback exceeds policy threshold.</strong> Escalation approver is added (does not replace the base
                  matrix).
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 style={{ marginTop: 0 }}>5) CapEx & Budget</h3>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <Badge tone="neutral">CapEx Policy: {CAPEX_POLICY_VERSION}</Badge>
                <Badge tone="neutral">Approval Matrix: {APPROVAL_MATRIX_VERSION}</Badge>
              </div>

              <Divider />

              <h4 style={{ margin: "0 0 10px 0" }}>Approval Workflow</h4>

              <div style={infoBox("neutral")}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Base Approval Matrix (Policy)</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(isCapex ? BASE_APPROVAL_MATRIX : ["Plant", "Division"]).map((a) => (
                    <Badge key={a} tone={a === "Finance" ? "warn" : "neutral"}>{a}</Badge>
                  ))}
                </div>

                <div style={{ marginTop: 10, fontWeight: 900 }}>Effective Approval Path (Base + Add-ons)</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  {approvalPath.map((a) => (
                    <Badge
                      key={a}
                      tone={
                        a === "Finance" ? "warn" : a === "Executive Committee" || a === "Exception Approver" ? "warn" : "neutral"
                      }
                    >
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>

              <Divider />

              <h4 style={{ margin: "0 0 10px 0" }}>Budget Lock vs Actual Tracking</h4>

              <div style={infoBox("neutral")}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <KpiCard
                    label="Approved Budget (Planned)"
                    value={money(approvedBudgetPlanned, form.currency)}
                    tone={approvedBudgetPlanned > 0 ? "neutral" : "warn"}
                  />
                  <KpiCard
                    label="Committed (Locked)"
                    value={money(committedLocked, form.currency)}
                    tone="neutral"
                  />
                  <KpiCard
                    label="Actual Spent (Invoices)"
                    value={money(actualSpent, form.currency)}
                    tone={actualSpent > 0 ? "ok" : "neutral"}
                  />
                </div>

                <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.5, color: "#374151" }}>
                  <strong>Budget lock (commitment)</strong> is a reservation created after approvals (typically at approval / PO stage).
                  <br />
                  <strong>Actual tracking</strong> reflects ERP milestones: <strong>PO</strong> (commitment confirmed), <strong>GRN</strong>
                  (received), <strong>Invoice</strong> (actual spend).
                </div>
              </div>

              <Divider />

              {isCapex ? (
                <>
                  <div style={infoBox("warn")}>
                    <strong>CapEx controls:</strong> Budget reference and budget availability are mandatory. Finance approval is part of the base matrix.
                  </div>

                  <Field label="Budget Reference" error={errors.budgetRef} hint="ERP budget line / internal ref">
                    <input
                      value={form.budgetRef}
                      onChange={(e) => set({ budgetRef: e.target.value })}
                      placeholder="e.g., SAP-BUD-2026-PLANTA-001"
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Budget Available" error={errors.budgetAvailable} hint="Amount currently available">
                    <input
                      value={form.budgetAvailable}
                      onChange={(e) => set({ budgetAvailable: e.target.value.replace(/[^\d.]/g, "") })}
                      placeholder="e.g., 200000"
                      style={inputStyle}
                      inputMode="decimal"
                    />
                  </Field>

                  <Divider />

                  <label style={checkLabelStyle}>
                    <input
                      type="checkbox"
                      checked={form.exceptionRequested}
                      onChange={(e) => set({ exceptionRequested: e.target.checked })}
                    />
                    <span>Request an exception</span>
                  </label>

                  {form.exceptionRequested && (
                    <Field label="Exception Reason" error={errors.exceptionReason} hint="Mandatory for exception workflow">
                      <textarea
                        value={form.exceptionReason}
                        onChange={(e) => set({ exceptionReason: e.target.value })}
                        placeholder="Explain why an exception is required (e.g., insufficient budget but compliance deadline)."
                        style={{ ...inputStyle, height: 90, resize: "vertical" }}
                      />
                    </Field>
                  )}

                  {clampNum(form.budgetAvailable) > 0 &&
                    clampNum(form.budgetAvailable) < estCostNum &&
                    !form.exceptionRequested && (
                      <div style={infoBox("warn")}>
                        <strong>Budget shortfall.</strong> Request an exception or adjust the request.
                      </div>
                    )}

                  <Divider />

                  <h4 style={{ margin: "0 0 10px 0" }}>ERP Milestones (PO / GRN / Invoice) – Prototype</h4>
                  <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 8 }}>
                    In production, this section is read-only and synced from ERP. Here you can add rows to simulate integration.
                  </div>

                  <MilestonesTable
                    currency={form.currency}
                    milestones={form.milestones}
                    onChange={(milestones) => set({ milestones })}
                  />
                </>
              ) : (
                <>
                  <div style={infoBox("neutral")}>
                    Budget reference is optional because this request is below the CapEx threshold (prototype policy).
                  </div>

                  <Divider />

                  <h4 style={{ margin: "0 0 10px 0" }}>ERP Milestones (PO / GRN / Invoice) – Prototype</h4>
                  <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 8 }}>
                    Optional for non-CapEx in this prototype. In production, synced from ERP.
                  </div>

                  <MilestonesTable
                    currency={form.currency}
                    milestones={form.milestones}
                    onChange={(milestones) => set({ milestones })}
                  />
                </>
              )}
            </div>
          )}

          {step === 5 && (
            <div>
              <h3 style={{ marginTop: 0 }}>6) Review & Submit</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <SummaryCard title="Request Overview">
                  <SummaryRow k="Title" v={form.title || "—"} />
                  <SummaryRow k="Department" v={form.requesterOrgUnit} />
                  <SummaryRow k="Purpose" v={form.purpose || "—"} />
                  <SummaryRow k="Estimated Cost" v={money(estCostNum, form.currency)} />
                  <SummaryRow k="CapEx" v={isCapex ? "Yes" : "No"} />
                </SummaryCard>

                <SummaryCard title="Machine Summary">
                  <SummaryRow k="Category" v={form.category || "—"} />
                  <SummaryRow k="Model" v={selectedModel?.name || "—"} />
                  <SummaryRow k="Vendor" v={form.vendor || "—"} />
                  <SummaryRow k="Quantity" v={String(form.quantity)} />
                  <SummaryRow k="Delivery" v={form.expectedDelivery || "—"} />
                  {form.purpose === "Replacement" ? (
                    <SummaryRow k="Replaces" v={form.replacedMachineTwinId || "—"} />
                  ) : null}
                </SummaryCard>

                <SummaryCard title="Financial Summary">
                  <SummaryRow k="Net Annual Benefit" v={money(netAnnual, form.currency)} />
                  <SummaryRow k="ROI" v={Number.isFinite(roi) ? `${(roi * 100).toFixed(1)}%` : "—"} />
                  <SummaryRow k="Payback" v={Number.isFinite(paybackYears) ? `${paybackYears.toFixed(2)} yrs` : "∞"} />
                  <SummaryRow k="Payback Breach" v={paybackBreached ? "Yes" : "No"} />
                </SummaryCard>

                <SummaryCard title="Governance & Budget">
                  <SummaryRow k="CapEx Policy Version" v={CAPEX_POLICY_VERSION} />
                  <SummaryRow k="Approval Matrix Version" v={APPROVAL_MATRIX_VERSION} />
                  <SummaryRow k="Base Matrix" v={(isCapex ? BASE_APPROVAL_MATRIX : ["Plant", "Division"]).join(" → ")} />
                  <SummaryRow k="Effective Path" v={approvalPath.join(" → ")} />
                  {isCapex ? <SummaryRow k="Budget Ref" v={form.budgetRef || "—"} /> : null}
                  {isCapex ? (
                    <SummaryRow k="Budget Available" v={money(clampNum(form.budgetAvailable), form.currency)} />
                  ) : null}
                  <SummaryRow k="Exception Requested" v={form.exceptionRequested ? "Yes" : "No"} />
                  <SummaryRow k="Planned Budget" v={money(approvedBudgetPlanned, form.currency)} />
                  <SummaryRow k="Committed (Locked)" v={money(committedLocked, form.currency)} />
                  <SummaryRow k="Actual Spent (Invoices)" v={money(actualSpent, form.currency)} />
                </SummaryCard>
              </div>

              <Divider />

              {!canSubmit ? (
                <div style={infoBox("bad")}>
                  <strong>Cannot submit.</strong> Fix validation issues in earlier steps.
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    Missing / invalid:{" "}
                    {Object.keys(errors)
                      .slice(0, 8)
                      .join(", ")}
                    {Object.keys(errors).length > 8 ? "…" : ""}
                  </div>
                </div>
              ) : (
                <div style={infoBox("ok")}>
                  Ready to submit. On submit, the request is locked into the approval workflow and an audit event is created.
                </div>
              )}
            </div>
          )}

          <Divider />

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <button onClick={prev} disabled={step === 0} style={btnStyle(step === 0 ? "disabled" : "secondary")}>
              Back
            </button>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  alert("Draft saved (prototype). Check console.");
                  console.log("Draft state:", form);
                }}
                style={btnStyle("secondary")}
              >
                Save Draft
              </button>

              {step < steps.length - 1 ? (
                <button onClick={next} disabled={!canNext} style={btnStyle(!canNext ? "disabled" : "primary")}>
                  Next
                </button>
              ) : (
                <button onClick={onSubmit} disabled={!canSubmit} style={btnStyle(!canSubmit ? "disabled" : "primary")}>
                  Submit for Approval
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, background: "#fff" }}>
          <h4 style={{ marginTop: 0 }}>Policy Preview</h4>

          <div style={{ display: "grid", gap: 10 }}>
            <MiniRow
              label="CapEx Threshold"
              value={`≥ ${money(CAPEX_THRESHOLD, form.currency)}`}
              badgeTone="neutral"
            />
            <MiniRow
              label="Classification"
              value={isCapex ? "CapEx" : "Non-CapEx"}
              badgeTone={isCapex ? "warn" : "neutral"}
            />
            <MiniRow
              label="Base Approval Matrix"
              value={(isCapex ? BASE_APPROVAL_MATRIX : ["Plant", "Division"]).join(" → ")}
              badgeTone="neutral"
            />
            <MiniRow
              label="Effective Approval Path"
              value={approvalPath.join(" → ")}
              badgeTone="neutral"
            />
            <MiniRow
              label="Budget Lock vs Actual"
              value="Commitment ≠ Invoice Spend"
              badgeTone="neutral"
            />
            <MiniRow
              label="Payback"
              value={Number.isFinite(paybackYears) ? `${paybackYears.toFixed(2)} yrs` : "∞"}
              badgeTone={paybackBreached ? "warn" : "ok"}
            />
          </div>

          <Divider />

          <h4 style={{ margin: "0 0 8px 0" }}>Rule Notes</h4>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#374151", fontSize: 13, lineHeight: 1.5 }}>
            <li>CapEx: approvals follow Plant → Division → Group → Finance</li>
            <li>Escalations are additive (do not replace base)</li>
            <li>Replacement requires selecting the replaced MachineTwin</li>
            <li>Capacity Expansion requires evidence reference</li>
            <li>Compliance/Safety requires regulatory reference</li>
            <li>Insufficient budget requires exception request</li>
            <li>Actual spend is driven by Invoice milestones (ERP truth)</li>
          </ul>

          <Divider />

          <h4 style={{ margin: "0 0 8px 0" }}>Dev Hook</h4>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            Wire submit to:
            <div style={{ marginTop: 6, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
              POST /acquisitions
            </div>
            Milestones would come from ERP via integration:
            <div style={{ marginTop: 6, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
              GET /acquisitions/{`{id}`}/milestones
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Components

function KpiCard({ label, value, tone }) {
  const t = tone || "neutral";
  const bg =
    t === "ok" ? "#ecfdf5" : t === "warn" ? "#fffbeb" : t === "bad" ? "#fef2f2" : "#f9fafb";
  const bd =
    t === "ok" ? "#6ee7b7" : t === "warn" ? "#fde68a" : t === "bad" ? "#fecaca" : "#e5e7eb";

  return (
    <div style={{ border: `1px solid ${bd}`, background: bg, borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 800 }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 18, fontWeight: 950 }}>{value}</div>
    </div>
  );
}

function SummaryCard({ title, children }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" }}>
      <div style={{ fontWeight: 950, marginBottom: 10 }}>{title}</div>
      <div style={{ display: "grid", gap: 8 }}>{children}</div>
    </div>
  );
}

function SummaryRow({ k, v }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: 10, fontSize: 13 }}>
      <div style={{ color: "#6b7280", fontWeight: 800 }}>{k}</div>
      <div style={{ fontWeight: 800 }}>{v}</div>
    </div>
  );
}

function MiniRow({ label, value, badgeTone = "neutral" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
      <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 900 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#111827", overflow: "hidden", textOverflow: "ellipsis" }}>
          {value}
        </div>
        <Badge tone={badgeTone}>{badgeTone === "neutral" ? "Info" : badgeTone.toUpperCase()}</Badge>
      </div>
    </div>
  );
}

function MilestonesTable({ currency, milestones, onChange }) {
  const [draft, setDraft] = useState({ type: "PO", ref: "", amount: "", date: "" });

  const add = () => {
    const next = [
      ...milestones,
      {
        type: draft.type,
        ref: draft.ref.trim(),
        amount: clampNum(draft.amount),
        date: draft.date || null,
      },
    ].filter((m) => m.type && m.ref);
    onChange(next);
    setDraft({ type: "PO", ref: "", amount: "", date: "" });
  };

  const removeAt = (idx) => {
    const next = milestones.filter((_, i) => i !== idx);
    onChange(next);
  };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: 12, background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontWeight: 900 }}>
        Milestones
      </div>

      <div style={{ padding: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 160px 160px 120px", gap: 8, alignItems: "end" }}>
          <div>
            <div style={smallLabel}>Type</div>
            <select
              value={draft.type}
              onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value }))}
              style={inputStyle}
            >
              {MILESTONE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <div style={smallLabel}>Reference</div>
            <input
              value={draft.ref}
              onChange={(e) => setDraft((p) => ({ ...p, ref: e.target.value }))}
              placeholder="e.g., PO-10293 / GRN-33 / INV-883"
              style={inputStyle}
            />
          </div>

          <div>
            <div style={smallLabel}>Amount</div>
            <input
              value={draft.amount}
              onChange={(e) => setDraft((p) => ({ ...p, amount: e.target.value.replace(/[^\d.]/g, "") }))}
              placeholder="e.g., 120000"
              style={inputStyle}
              inputMode="decimal"
            />
          </div>

          <div>
            <div style={smallLabel}>Date</div>
            <input
              value={draft.date}
              onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))}
              type="date"
              style={inputStyle}
            />
          </div>

          <button onClick={add} style={btnStyle("primary")}>Add</button>
        </div>

        <Divider />

        {milestones.length === 0 ? (
          <div style={{ color: "#6b7280", fontSize: 13 }}>No milestones added (prototype).</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {milestones.map((m, idx) => (
              <div
                key={`${m.type}-${m.ref}-${idx}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr 160px 160px 120px",
                  gap: 8,
                  alignItems: "center",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <Badge tone={m.type === "INVOICE" ? "ok" : "neutral"}>{m.type}</Badge>
                <div style={{ fontWeight: 900 }}>{m.ref}</div>
                <div style={{ fontWeight: 900 }}>{money(clampNum(m.amount), currency)}</div>
                <div style={{ color: "#6b7280", fontWeight: 800 }}>{m.date || "—"}</div>
                <button onClick={() => removeAt(idx)} style={btnStyle("secondary")}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Styles

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none",
  fontSize: 13,
};

const checkLabelStyle = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  fontSize: 13,
  fontWeight: 800,
};

const smallLabel = {
  fontSize: 12,
  color: "#6b7280",
  fontWeight: 900,
  marginBottom: 6,
};

function infoBox(tone) {
  const map = {
    neutral: { bg: "#f9fafb", bd: "#e5e7eb", fg: "#111827" },
    ok: { bg: "#ecfdf5", bd: "#6ee7b7", fg: "#065f46" },
    warn: { bg: "#fffbeb", bd: "#fde68a", fg: "#92400e" },
    bad: { bg: "#fef2f2", bd: "#fecaca", fg: "#991b1b" },
  }[tone];
  return {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${map.bd}`,
    background: map.bg,
    color: map.fg,
    fontSize: 13,
    lineHeight: 1.45,
  };
}

function btnStyle(kind) {
  const base = {
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 950,
    fontSize: 13,
    border: "1px solid transparent",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
  const styles = {
    primary: { background: "#111827", color: "#fff" },
    secondary: { background: "#fff", color: "#111827", border: "1px solid #e5e7eb" },
    disabled: { background: "#e5e7eb", color: "#6b7280", cursor: "not-allowed" },
  }[kind];
  return { ...base, ...styles };
}
