import React, { useEffect, useMemo, useRef, useState } from "react";

// ===== Utilities (no external deps) =====
function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}
function mergeStyles(...objs) { return Object.assign({}, ...objs.filter(Boolean)); }

// ==== Result/adornment state helpers ====
function parseNumericResult(s) {
  if (!s || !s.trim()) return { ok: false };
  const m = s.trim().match(/^\s*(<=|>=|<|>|=)?\s*([0-9]*\.?[0-9]+)\s*(.*)$/);
  if (!m) return { ok: false };
  const num = Number(m[2]);
  if (!Number.isFinite(num)) return { ok: false };
  const op = m[1] || undefined;
  return { ok: true, num, op };
}
function requiredAdornmentKeys(row) { return row.adornments.filter(a => a.required).map(a => a.key); }
function missingRequiredAdornments(row) { const req = requiredAdornmentKeys(row); return req.filter(k => (row.adornValues[k] ?? "").toString().trim() === ""); }
function rowState(row) {
  const hasResultText = (row.result || "").toString().trim().length > 0;
  if (!hasResultText) {
    const anyAdornmentVal = Object.values(row.adornValues || {}).some(v => (v ?? "").toString().trim().length > 0);
    return anyAdornmentVal ? "in_progress" : "not_started";
  }
  const parsed = parseNumericResult(row.result);
  if (!parsed.ok) return "invalid";
  const missing = missingRequiredAdornments(row);
  return missing.length === 0 ? "complete" : "in_progress";
}
function counts(states) { return states.reduce((m, s) => { m[s] = (m[s] || 0) + 1; return m; }, {}); }
function stateBgColor(s) {
  switch (s) {
    case "complete": return "#10b981"; // emerald-500
    case "in_progress": return "#f59e0b"; // amber-500
    case "invalid": return "#ef4444"; // red-500
    default: return "#94a3b8"; // slate-400
  }
}

// ===== UI primitives (unstyled, inline CSS) =====
const styles = {
  chip: (clickable, active) => mergeStyles({
    display: "inline-flex", alignItems: "center", borderRadius: 9999,
    padding: "2px 8px", fontSize: 12, lineHeight: "16px",
    border: clickable ? "1px solid #e2e8f0" : "1px solid transparent",
    background: clickable ? "#fff" : "#f1f5f9", color: "#334155",
    cursor: clickable ? "pointer" : "default",
    userSelect: "none",
    boxShadow: clickable ? "0 0 0 0 rgba(0,0,0,0)" : undefined,
    outline: active ? "2px solid #cbd5e1" : "none"
  }),
  btn: (variant, size, disabled) => mergeStyles({
    borderRadius: 12, fontWeight: 600, transition: "background 120ms", boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    padding: size === "md" ? "8px 12px" : "4px 8px", fontSize: size === "md" ? 14 : 12,
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
    border: variant === "ghost" ? "1px solid #e2e8f0" : "1px solid transparent",
    background: variant === "primary" ? "#0f172a" : variant === "danger" ? "#dc2626" : "#fff",
    color: variant === "primary" || variant === "danger" ? "#fff" : "#334155"
  }),
  input: (readonly) => ({ border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 8px", fontSize: 14, background: readonly ? "#f8fafc" : "#fff", color: readonly ? "#64748b" : "#0f172a", outline: "none" }),
  select: { border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 8px", fontSize: 14, background: "#fff", color: "#0f172a" },
  container: { maxWidth: 1200, margin: "0 auto", padding: 24 },
  headerRow: (sticky) => mergeStyles({ display: "grid", gridTemplateColumns: "80px 90px 110px 1fr 110px 140px 110px 100px 140px 110px 70px", alignItems: "center", borderBottom: "1px solid #e2e8f0", background: "#fff", fontSize: 12, fontWeight: 600, color: "#475569" }, sticky && { position: "sticky", top: 0, zIndex: 10 }),
  cell: { padding: "8px 8px" },
  row: { display: "grid", gridTemplateColumns: "80px 90px 110px 1fr 110px 140px 110px 100px 140px 110px 70px", alignItems: "center", fontSize: 14 },
  dot: (bg) => ({ display: "inline-block", width: 10, height: 10, borderRadius: 9999, background: bg }),
  grid: { border: "1px solid #e2e8f0", borderRadius: 16, overflow: "auto", maxHeight: "70vh" },
  subgrid: { background: "#f8fafc", padding: 12, borderTop: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 },
  title: { fontSize: 20, fontWeight: 600, color: "#0f172a" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 },
  topbarLeft: { display: "flex", alignItems: "center", gap: 12 },
  topbarRight: { display: "flex", alignItems: "center", gap: 8 },
  muted: { color: "#94a3b8", fontSize: 12 }
};

function Chip({ children, onClick, active }) {
  return (
    <span onClick={onClick} style={styles.chip(!!onClick, active)}>{children}</span>
  );
}
function Button({ children, onClick, variant = "primary", size = "sm", disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={styles.btn(variant, size, disabled)}>{children}</button>
  );
}
function Select({ value, onChange, options, style }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={mergeStyles(styles.select, style)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
const Input = React.forwardRef(function Input({ value, onChange, placeholder, style, readOnly, type }, ref) {
  return (
    <input ref={ref} value={value} placeholder={placeholder} readOnly={readOnly} type={type} onChange={(e) => onChange?.(e.target.value)} style={mergeStyles(styles.input(readOnly), style)} />
  );
});

const secondaryValOptions = [
  "Negligible",
  "Mild to very good",
  "Good",
  "Moderate to fair",
  "Poor",
  "Very Poor",
].map((label) => ({ value: label, label }));

// ===== Mock data builder =====
function buildMockRows(samples = 3, analytes = 3) {
  const analyteDefs = [
    { code: "9.10.1", label: "Corrosion rate" },
    { code: "40.4.2", label: "Yeast" },
    { code: "40.4.3", label: "Mould" },
  ];
  const adornTemplate = [
    { key: "coupon_id", label: "Coupon ID", type: "text", required: true },
    { key: "orig_wt", label: "Original weight (g)", type: "number", readonly: true },
    { key: "image", label: "Image", type: "attachment" },
  ];
  const rows = [];
  let idx = 1;
  for (let s = 1; s <= samples; s++) {
    for (let a = 0; a < analytes; a++) {
      const ad = a === 0 ? adornTemplate : [];
      rows.push({
        id: uid(),
        idx: idx++,
        sampleNo: s,
        analyteCode: analyteDefs[a].code,
        analyteLabel: analyteDefs[a].label,
        operator: "<",
        result: "",
        unit: a === 0 ? "mm/y" : "cfu/plate",
        alertVal: a === 0 ? "" : "0",
        secondaryVal: "",
        highlight: false,
        qc: undefined,
        adornments: ad,
        adornValues: ad.reduce((m, f) => ({ ...m, [f.key]: f.key === "orig_wt" ? (120 - (s - 1) * 0.5).toFixed(3) : "" }), {}),
        originalWeight: (120 - (s - 1) * 0.5).toFixed(3),
        suggested: a === 0 ? "1.83" : undefined,
      });
    }
  }
  return rows;
}

// ===== Grid components =====
function RowAdornments({ row, onChange }) {
  return (
    <div style={styles.subgrid}>
      {row.adornments.length === 0 && (
        <div style={mergeStyles(styles.cell, styles.muted)}>No adornments for this analyte.</div>
      )}
      {row.adornments.map((f) => (
        <label key={f.key} style={{ display: "grid", gap: 4, fontSize: 12 }}>
          <span style={{ color: "#334155" }}>
            {f.label}
            {f.required ? " *" : ""}
          </span>
          {f.type === "enum" ? (
            <Select value={row.adornValues[f.key] || ""} onChange={(v) => onChange({ ...row, adornValues: { ...row.adornValues, [f.key]: v } })} options={(f.options || []).map((o) => ({ value: o, label: o }))} />
          ) : f.type === "attachment" ? (
            <input type="file" accept="image/*" onChange={(e) => onChange({ ...row, adornValues: { ...row.adornValues, [f.key]: e.target.files?.[0]?.name || "" } })} />
          ) : (
            <Input value={row.adornValues[f.key] || ""} readOnly={f.readonly} onChange={(v) => onChange({ ...row, adornValues: { ...row.adornValues, [f.key]: v } })} />
          )}
        </label>
      ))}
    </div>
  );
}

function GridHeader({ sticky }) {
  return (
    <div style={styles.headerRow(sticky)}>
      <div style={styles.cell}>#</div>
      <div style={styles.cell}>Sample</div>
      <div style={styles.cell}>Analyte</div>
      <div style={styles.cell}>Description</div>
      <div style={styles.cell}>Operator</div>
      <div style={styles.cell}>Result</div>
      <div style={styles.cell}>Units</div>
        <div style={styles.cell}>Alert Val</div>
        <div style={styles.cell}>Secondary val</div>
        <div style={styles.cell}>Highlighted</div>
      <div style={styles.cell}>⯆</div>
    </div>
  );
}

function GridRow({ row, expanded, onToggle, onChange }) {
  const adornCount = row.adornments.length;
  const resultRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter" && document.activeElement?.tagName !== "INPUT") {
        resultRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const state = rowState(row);
  return (
    <div style={{ borderBottom: "1px solid #e2e8f0" }}>
      <div style={styles.row}>
        <div style={styles.cell}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={styles.dot(stateBgColor(state))} /><span style={{ color: "#64748b" }}>{row.idx}</span></div></div>
        <div style={styles.cell}>{row.sampleNo}</div>
        <div style={mergeStyles(styles.cell, { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 })}>{row.analyteCode}</div>
        <div style={styles.cell}>{row.analyteLabel}</div>
        <div style={styles.cell}>
          <Select value={row.operator} onChange={(v) => onChange({ ...row, operator: v })} options={["<", "<=", ">", ">=", "="].map((o) => ({ value: o, label: o }))} />
        </div>
        <div style={styles.cell}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Input ref={resultRef} value={row.result} onChange={(v) => onChange({ ...row, result: v })} placeholder={row.suggested ? `${row.suggested} (suggested)` : ""} style={{ width: "100%" }} />
            {row.suggested && (
              <Button size="sm" variant="ghost" onClick={() => onChange({ ...row, result: row.suggested })}>Use</Button>
            )}
          </div>
        </div>
        <div style={styles.cell}>
          <Input value={row.unit} onChange={(v) => onChange({ ...row, unit: v })} />
        </div>
        <div style={styles.cell}>
          <Input value={row.alertVal || ""} onChange={(v) => onChange({ ...row, alertVal: v })} />
        </div>
        <div style={styles.cell}>
          {row.analyteCode === "9.10.1" ? (
            <Select
              value={row.secondaryVal || ""}
              onChange={(v) => onChange({ ...row, secondaryVal: v })}
              options={[{ value: "", label: "Select" }, ...secondaryValOptions]}
            />
          ) : (
            <span style={styles.muted}>N/A</span>
          )}
        </div>
        <div style={{ ...styles.cell, display: "flex", justifyContent: "center" }}>
          <input type="checkbox" checked={!!row.highlight} onChange={(e) => onChange({ ...row, highlight: e.target.checked })} />
        </div>
        <div style={mergeStyles(styles.cell, { textAlign: "right" })}>{adornCount > 0 && (<Button size="sm" variant="ghost" onClick={onToggle}>{expanded ? "Hide" : "Show"}</Button>)}</div>
      </div>
      {expanded && adornCount > 0 && <RowAdornments row={row} onChange={onChange} />}
    </div>
  );
}

// ===== Mock data (same as before) =====
function RunWorksheetGrid() {
  const [rows, setRows] = useState(() => buildMockRows(20, 3));
  const [expandedMap, setExpandedMap] = useState({});
  const [filter, setFilter] = useState({});
  const [stateFilter, setStateFilter] = useState(undefined);
  const [addNatLogo, setAddNatLogo] = useState(false);

  const baseFiltered = useMemo(
    () => rows.filter((r) => (filter.sample ? r.sampleNo === filter.sample : true) && (filter.analyte ? r.analyteCode === filter.analyte : true)),
    [rows, filter]
  );
  const filtered = useMemo(
    () => baseFiltered.filter((r) => (stateFilter ? rowState(r) === stateFilter : true)),
    [baseFiltered, stateFilter]
  );
  const stateCounts = useMemo(() => counts(baseFiltered.map(rowState)), [baseFiltered]);

  function updateRow(id, patch) {
    setRows((xs) => xs.map((r) => (r.id === id ? (typeof patch === "function" ? patch(r) : { ...r, ...patch }) : r)));
  }

  return (
    <div style={styles.container}>
      <div style={styles.topbar}>
      <div style={styles.title}>Enter Data

        <div style={styles.topbarLeft}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ fontWeight: 600 }}>Lab Number</label>
            <input
              type="text"
              defaultValue="25-"
              style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 8px", fontSize: 14 }}
            />
            <select
              style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 8px", fontSize: 14 }}
            >
              <option value="">Select Lab Number</option>
              <option value="25-0001">25-0001</option>
              <option value="25-0002">25-0002</option>
              <option value="25-0003">25-0003</option>
            </select>
            <button
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                padding: "6px 12px",
                background: "#0f172a",
                color: "#fff",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Search
            </button>
            </div>
            
          </div>
          <div style={{ marginTop: 12 }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12,  fontSize: "14px"}}>Reference Number: 25 -00001</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "14px" }}>Job Code: CBR20-001</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "14px" }}>Job Location: 200, Spring Street, Sydney 2000</div>

          <Chip><span style={mergeStyles(styles.dot("#94a3b8"), { marginRight: 6 })}></span>{filtered.length} lines</Chip>
          <Chip onClick={() => setStateFilter(stateFilter === "not_started" ? undefined : "not_started")} active={stateFilter === "not_started"}><span style={mergeStyles(styles.dot("#94a3b8"), { marginRight: 6 })}></span>{(stateCounts.not_started || 0)} not entered</Chip>
          <Chip onClick={() => setStateFilter(stateFilter === "complete" ? undefined : "complete")} active={stateFilter === "complete"}><span style={mergeStyles(styles.dot("#10b981"), { marginRight: 6 })}></span>{(stateCounts.complete || 0)} complete</Chip>
          <Chip onClick={() => setStateFilter(stateFilter === "in_progress" ? undefined : "in_progress")} active={stateFilter === "in_progress"}><span style={mergeStyles(styles.dot("#f59e0b"), { marginRight: 6 })}></span>{(stateCounts.in_progress || 0)} in progress</Chip>
          <Chip onClick={() => setStateFilter(stateFilter === "invalid" ? undefined : "invalid")} active={stateFilter === "invalid"}><span style={mergeStyles(styles.dot("#ef4444"), { marginRight: 6 })}></span>{(stateCounts.invalid || 0)} invalid</Chip>
        </div>
        <div style={styles.topbarRight}>
          <Select value={String(filter.sample || "")} onChange={(v) => setFilter((f) => ({ ...f, sample: v ? Number(v) : undefined }))} options={[{ value: "", label: "All samples" }, ...Array.from(new Set(rows.map((r) => r.sampleNo))).map((n) => ({ value: String(n), label: `Sample ${n}` }))]} />
          <Select value={filter.analyte || ""} onChange={(v) => setFilter((f) => ({ ...f, analyte: v || undefined }))} options={[{ value: "", label: "All analytes" }, ...Array.from(new Set(rows.map((r) => r.analyteCode))).map((c) => ({ value: c, label: c }))]} />
          <Button variant="ghost" onClick={() => setExpandedMap(Object.fromEntries(filtered.map((r) => [r.id, true])))}>Expand shown</Button>
          <Button variant="ghost" onClick={() => setExpandedMap({})}>Collapse all</Button>
        </div>
        
      </div>

      <div style={styles.grid}>
        <GridHeader sticky />
        {filtered.map((r) => (
          <GridRow key={r.id} row={r} expanded={!!expandedMap[r.id]} onToggle={() => setExpandedMap((m) => ({ ...m, [r.id]: !m[r.id] }))} onChange={(nr) => updateRow(r.id, nr)} />
        ))}


      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
          marginTop: 16,
        }}
      >
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: "#0f172a" }}>
          <input type="checkbox" checked={addNatLogo} onChange={(e) => setAddNatLogo(e.target.checked)} />
          Add NATA logo
        </label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, width: "100%" }}>
          <button
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              padding: "6px 12px",
              background: "#0f172a",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Save
          </button>
          
          <button
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              padding: "6px 12px",
              background: "#0f172a",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Accept Results Entered
          </button>
        </div>
      </div>
    </div>
  );
}

export default RunWorksheetGrid;

// ===== Minimal tests =====
(function __selfTest() {
  try {
    const rows = buildMockRows(3, 3);
    console.assert(rows.length === 9, "mock rows shape");
    const hasAdorn = rows.filter((r) => r.adornments.length > 0).length;
    console.assert(hasAdorn === 3, "only corrosion rows carry adornments in mock");
    console.assert(parseNumericResult("< 10").ok, "parse operator+number");
    console.assert(parseNumericResult("10.5").ok, "parse plain number");
    console.assert(!parseNumericResult("").ok, "empty not ok");
    const base = rows[0];
    const r1 = { ...base, result: "", adornments: [{ key: "k", label: "K", type: "text", required: true }], adornValues: { k: "" } };
    console.assert(rowState(r1) === "not_started", "row not started");
    const r2 = { ...r1, adornValues: { k: "x" } };
    console.assert(rowState(r2) === "in_progress", "row in progress");
    const r3 = { ...r2, result: "12.3" };
    console.assert(rowState(r3) === "complete", "row complete");
    const r4 = { ...r2, result: "abc" };
    console.assert(rowState(r4) === "invalid", "row invalid");
    const r5 = { ...base, result: "", adornments: [], adornValues: {} };
    console.assert(rowState(r5) === "not_started", "row without adornments and result empty is not_started");
  } catch (e) {
    console.warn("Self-test failed", e);
  }
})();


