import React, { useMemo, useState } from "react";

// Single-file, dependency-free JSX
// UX restyled to match the provided screenshot (clean cards, subtle borders, rounded controls)
// – No external UI libs, all inline styles
// – Component behavior unchanged

// ---- Constants ----
const JOB_CODE = "CBR10-001";
const SAMPLING_METHODS = ["S1", "S2", "S3", "S4", "S9", "S10"];
const CT_REASONS = ["System is not running", "Other"]; // when status=No for CT
const UNUSED_COUPONS = {
  mildSteel: ["MS-001", "MS-002", "MS-003", "MS-004"],
  copper: ["CU-101", "CU-102", "CU-103"],
};

// ---- Helpers ----
function formatAuDateTime(d) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(d);
}

function makeInitialRows() {
  return [
    { id: "L1", index: 1, label: "Cooling Tower 1", locationType: "non", sampleType: "CT", samplingMethod: "", status: "", comments: "" },
    { id: "L2", index: 2, label: "Cooling Tower 2", locationType: "non", sampleType: "CT", samplingMethod: "", status: "", comments: "" },
    { id: "L3", index: 3, label: "Potable Water – Lobby", locationType: "non", sampleType: "CT", samplingMethod: "", status: "", comments: "" },
    { id: "L4", index: 4, label: "Chiller Loop 1 – Coupon Rack", locationType: "corrosion", sampleType: "Corrosion", samplingMethod: "", status: "", phase: "installation", requiresAdditionalData: true, corrosionData: {}, corrosionMaterial: "mildSteel" },
    { id: "L5", index: 5, label: "Chiller Loop 2 – Coupon Rack", locationType: "corrosion", sampleType: "Corrosion", samplingMethod: "", status: "", phase: "installation", requiresAdditionalData: true, corrosionData: {}, corrosionMaterial: "copper" },
  ];
}

// Pure validation for tests & UI
function validateRows(rows, subcontracted) {
  const errs = [];
  if (subcontracted) return errs;
  for (const r of rows) {
    if (!r.samplingMethod) errs.push(`Row ${r.index}: Sampling Method is required.`);
    if (!r.sampleType) errs.push(`Row ${r.index}: Sample Type is required.`);

    if (!r.status) {
      const label = r.locationType === "corrosion" && r.phase === "installation" ? "Installed" : "Collected";
      errs.push(`Row ${r.index}: ${label}? must be selected.`);
    }

    if (r.status === "No" && !r.reason) {
      errs.push(`Row ${r.index}: Reason is required when status is No.`);
    }

    if (r.locationType === "corrosion" && r.phase === "installation") {
      const ms = r.corrosionData && r.corrosionData.mildSteel;
      const cu = r.corrosionData && r.corrosionData.copper;
      if (r.requiresAdditionalData && r.status === "Yes") {
        const needs = r.corrosionMaterial === "mildSteel" ? !ms : !cu;
        if (needs) {
          errs.push(`Row ${r.index}: Add Data is required (select a ${r.corrosionMaterial === "mildSteel" ? "Mild Steel" : "Copper"} coupon).`);
        }
      }
    }
  }
  return errs;
}

// ---- Styles (inline) ----
const COLOR = {
  bg: "#F6F8FB",
  card: "#FFFFFF",
  border: "#e6ebf1",
  borderDark: "#d0d7de",
  text: "#0f172a",
  sub: "#5b6472",
  pillBg: "#eef2f6",
  hint: "#6b7280",
  primary: "#1f6feb",
  primaryText: "#ffffff",
  rowHover: "#f9fbff",
};

const S = {
  page: { padding: 16, fontFamily: "Inter, system-ui, Arial, sans-serif", color: COLOR.text, background: COLOR.bg },
  wrap: { maxWidth: 1100, margin: "0 auto" },
  card: { border: `1px solid ${COLOR.border}`, borderRadius: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", padding: 16, background: COLOR.card },
  h1: { fontSize: 20, fontWeight: 700, margin: 0 },
  sub: { color: COLOR.sub, marginTop: 6, fontSize: 14 },
  labelPill: { display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${COLOR.border}`, borderRadius: 10, padding: "6px 10px", background: COLOR.pillBg, fontSize: 13 },
  row: { display: "grid", gap: 8, marginTop: 8 },
  grid2: { display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  input: { border: `1px solid ${COLOR.borderDark}`, borderRadius: 10, padding: "10px 12px", width: "100%", background: COLOR.card, outline: 0 },
  select: { border: `1px solid ${COLOR.borderDark}`, borderRadius: 10, padding: "10px 12px", width: "100%", background: COLOR.card, outline: 0 },
  textarea: { border: `1px solid ${COLOR.borderDark}`, borderRadius: 10, padding: 12, width: "100%", minHeight: 70, background: COLOR.card, outline: 0 },
  readonly: { border: `1px solid ${COLOR.borderDark}`, borderRadius: 10, padding: "10px 12px", width: "100%", background: "#f3f4f6" },
  btn: { border: `1px solid ${COLOR.borderDark}`, borderRadius: 10, padding: "8px 12px", background: COLOR.card, cursor: "pointer", height: 36 },
  btnIcon: { fontFamily: "ui-sans-serif, system-ui, -apple-system", marginRight: 6, opacity: 0.8 },
  btnPrimary: { border: `1px solid ${COLOR.primary}`, background: COLOR.primary, color: COLOR.primaryText },
  hint: { color: COLOR.hint, fontSize: 12 },
  divider: { height: 1, background: COLOR.border, margin: "12px 0" },
  accordion: { border: `1px solid ${COLOR.border}`, borderRadius: 12, marginBottom: 10, background: COLOR.card },
  summary: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", cursor: "pointer", fontWeight: 600 },
  badgeIdx: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: "#e8eefc", color: "#213c8c", fontWeight: 700, marginRight: 10, fontSize: 13 },
  actions: { display: "flex", gap: 8 },
  dangerBox: { border: "1px solid #fecaca", background: "#fff1f2", padding: 12, borderRadius: 12 },
  successBox: { border: "1px solid #bbf7d0", background: "#f0fdf4", padding: 12, borderRadius: 12 },
  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { background: COLOR.card, borderRadius: 12, padding: 16, width: 420, maxWidth: "calc(100% - 32px)", border: `1px solid ${COLOR.border}` },
  list: { listStyle: "disc", marginLeft: 18, marginTop: 6 },
};

function Autocomplete({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = options.filter(o => o.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ position: "relative" }}>
      <input
        style={S.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => { onChange(e.target.value); setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div style={{ position: "absolute", zIndex: 10, background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: 10, width: "100%", maxHeight: 200, overflow: "auto" }}>
          {filtered.length === 0 && (
            <div style={{ padding: 10, color: COLOR.hint }}>No results</div>
          )}
          {filtered.map(opt => (
            <div key={opt} style={{ padding: 10, cursor: "pointer" }} onMouseDown={() => { onChange(opt); setOpen(false); }}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SampleCollectionStandalone() {
  const [subcontracted, setSubcontracted] = useState(false);
  const [rows, setRows] = useState(() => makeInitialRows());
  const [openRowId, setOpenRowId] = useState(null); // for Add Data modal
  const [errors, setErrors] = useState([]);
  const [completeMessage, setCompleteMessage] = useState(null);
  const [collectionAt] = useState(() => new Date());

  const anyCorrosion = useMemo(() => rows.some(r => r.locationType === "corrosion"), [rows]);

  const activeRow = rows.find(r => r.id === openRowId) || null;

  function handleRowChange(id, patch) {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  }

  function copyRowToOthers(source) {
    setRows(prev => prev.map(r => {
      if (r.id === source.id) return r;
      return {
        ...r,
        samplingMethod: source.samplingMethod,
        sampleType: source.sampleType,
        comments: source.comments,
        status: r.status,
        reason: r.reason,
        corrosionData: r.corrosionData,
      };
    }));
  }

  function onComplete() {
    setCompleteMessage(null);
    const v = validateRows(rows, subcontracted);
    setErrors(v);
    if (v.length) return;

    const updated = rows.map(r => {
      if (r.locationType === "corrosion" && r.phase === "installation") {
        return { ...r, phase: "collection", status: "", reason: undefined };
      }
      return r;
    });
    setRows(updated);
    setCompleteMessage("Schedule completed." + (anyCorrosion ? " Corrosion installation rows moved to Collection Pending." : ""));
  }

  // ---- Dev sanity tests (console warnings) ----
  if (typeof window !== "undefined" && !window.__SAMPLE_TESTED__) {
    try {
      window.__SAMPLE_TESTED__ = true;
      const t1 = [{ id: "T1", index: 1, label: "CT", locationType: "non", sampleType: "CT", samplingMethod: "", status: "", comments: "" }];
      const e1 = validateRows(t1, false);
      if (!e1.find(x => x.includes("Sampling Method"))) console.warn("[TEST] Missing sampling method check");

      const t2 = [{ id: "T2", index: 1, label: "CR", locationType: "corrosion", sampleType: "Corrosion", samplingMethod: "S1", status: "Yes", comments: "", phase: "installation", requiresAdditionalData: true, corrosionData: {}, corrosionMaterial: "mildSteel" }];
      const e2 = validateRows(t2, false);
      if (!e2.find(x => x.includes("Add Data is required"))) console.warn("[TEST] Missing corrosion coupon requirement check");

      const t3 = [{ id: "T3", index: 1, label: "CR", locationType: "corrosion", sampleType: "Corrosion", samplingMethod: "S1", status: "Yes", comments: "", phase: "installation", requiresAdditionalData: true, corrosionData: { mildSteel: "MS-001" }, corrosionMaterial: "mildSteel" }];
      const e3 = validateRows(t3, false);
      if (e3.length !== 0) console.warn("[TEST] Expected no errors when proper coupon selected:", e3);
    } catch (err) {
      console.warn("[TEST] Runtime tests threw:", err);
    }
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.card}>
          <h1 style={S.h1}>Sample Collection – Schedule</h1>
          <div style={S.sub}>Note: Prototype only. In the real job we don't mix sample types - water+corrosion).</div>
          <div style={{ ...S.hint, marginTop: 6 }}>Designed to work in mobile/table devices (small text. This is an instruction in the prototype)</div>

          {/* Header pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <div style={S.labelPill}><span style={S.hint}>Job</span><strong>{JOB_CODE}</strong></div>
            <div style={S.labelPill}><span style={S.hint}>Collection Date/Time (AU)</span><span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{formatAuDateTime(collectionAt)}</span></div>
          </div>

          {/* Subcontracted Switch */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
            <input id="subc" type="checkbox" checked={subcontracted} onChange={(e) => setSubcontracted(e.target.checked)} />
            <label htmlFor="subc">Subcontracted job</label>
            <span style={S.hint}>(Schedule-level)</span>
          </div>

          {subcontracted && (
            <div style={{ ...S.row, ...S.dangerBox, border: `1px solid ${COLOR.border}` }}>
              Subcontracted workflow active. Testing will be done outside of IMC.
            </div>
          )}

          <div style={S.divider} />

          {/* Accordion (details/summary) */}
          <div>
            {rows.map((r) => (
              <details key={r.id} style={S.accordion}>
                <summary style={S.summary}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={S.badgeIdx}>{r.index}</span>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</span>
                  </div>
                  <div style={S.actions}>
                    <button style={S.btn} onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyRowToOthers(r); }}>
                      <span style={S.btnIcon}>⧉</span> Copy to others
                    </button>
                    {r.locationType === "corrosion" && (
                      <button style={S.btn} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenRowId(r.id); }}>
                        <span style={S.btnIcon}>✎</span> Add Data
                      </button>
                    )}
                  </div>
                </summary>

                <div style={{ padding: 14, borderTop: `1px solid ${COLOR.border}` }}>
                  <div style={S.grid2}>
                    <div style={S.row}>
                      <label style={{ fontWeight: 600 }}>Sampling Method <span style={{ color: "#dc2626" }}>*</span></label>
                      <select style={S.select} value={r.samplingMethod}
                        onChange={(e) => handleRowChange(r.id, { samplingMethod: e.target.value })}>
                        <option value="">Select method</option>
                        {SAMPLING_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>

                    <div style={S.row}>
                      <label style={{ fontWeight: 600 }}>Sample Type</label>
                      <div style={S.readonly}>{r.sampleType}</div>
                    </div>

                    <div style={S.row}>
                      <label style={{ fontWeight: 600 }}>{r.locationType === "corrosion" && r.phase === "installation" ? "Installed?" : "Collected?"} <span style={{ color: "#dc2626" }}>*</span></label>
                      <div style={{ display: "flex", gap: 12 }}>
                        {["Yes", "No"].map(v => (
                          <label key={v} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                            <input type="radio" name={`status-${r.id}`} value={v}
                              checked={r.status === v}
                              onChange={(e) => handleRowChange(r.id, { status: e.target.value, reason: undefined })} /> {v}
                          </label>
                        ))}
                      </div>
                    </div>

                    {r.status === "No" && (
                      <div style={S.row}>
                        <label style={{ fontWeight: 600 }}>Reason <span style={{ color: "#dc2626" }}>*</span></label>
                        <select style={S.select} value={r.reason || ""}
                          onChange={(e) => handleRowChange(r.id, { reason: e.target.value })}>
                          <option value="">Select reason</option>
                          {(r.sampleType === "CT" ? CT_REASONS : ["Other"]).map(x => <option key={x} value={x}>{x}</option>)}
                        </select>
                      </div>
                    )}

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ fontWeight: 600 }}>Comments</label>
                      <textarea style={S.textarea} value={r.comments || ""}
                        onChange={(e) => handleRowChange(r.id, { comments: e.target.value })} placeholder="Notes, onsite observations, etc." />
                    </div>

                    {r.locationType === "corrosion" && r.phase === "installation" && (
                      <div style={{ gridColumn: "1 / -1", ...S.hint }}>
                        Installation data required when status is <em>Yes</em>. Select coupon via <strong>Add Data</strong> (material is predefined).
                        <div style={{ marginTop: 4 }}>Current: Mild Steel – {r.corrosionData?.mildSteel || "—"}; Copper – {r.corrosionData?.copper || "—"}</div>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            ))}
          </div>

          {errors.length > 0 && (
            <div style={{ ...S.dangerBox, marginTop: 12 }}>
              <strong>Validation</strong>
              <ul style={S.list}>
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {completeMessage && (
            <div style={{ ...S.successBox, marginTop: 12 }}>
              {completeMessage}
              <div style={S.hint}>(Mock) Email with collection details sent to designated team members.</div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 12 }}>
            <button style={{ ...S.btn, ...S.btnPrimary }} onClick={onComplete}>Complete Job</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeRow && activeRow.locationType === "corrosion" && (
        <div style={S.modalBackdrop} onClick={() => setOpenRowId(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Add Data – Coupon Assignment</div>
            <div style={S.hint}>Assign corrosion coupons (unused inventory only). Required when installation status is Yes.</div>

            <div style={{ marginTop: 12 }}>
              <label style={{ fontWeight: 600 }}>Coupon code (Material: {activeRow.corrosionMaterial === "mildSteel" ? "Mild Steel" : "Copper"})</label>
              <Autocomplete
                value={activeRow.corrosionMaterial === "mildSteel" ? (activeRow.corrosionData?.mildSteel || "") : (activeRow.corrosionData?.copper || "")}
                onChange={(code) => {
                  if (activeRow.corrosionMaterial === "mildSteel") {
                    handleRowChange(activeRow.id, { corrosionData: { ...(activeRow.corrosionData||{}), mildSteel: code } });
                  } else {
                    handleRowChange(activeRow.id, { corrosionData: { ...(activeRow.corrosionData||{}), copper: code } });
                  }
                }}
                options={UNUSED_COUPONS[activeRow.corrosionMaterial]}
                placeholder={`Search ${activeRow.corrosionMaterial === 'mildSteel' ? 'Mild Steel' : 'Copper'} coupon...`}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button style={S.btn} onClick={() => setOpenRowId(null)}>Close</button>
              <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => setOpenRowId(null)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
