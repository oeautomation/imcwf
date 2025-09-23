import React, { useMemo, useState } from "react";

const UNITS = [
  "CFU/mL",
  "CFU/g",
  "MPN/100 mL",
  "MPN/g",
  "%",
  "NTU",
  "mg/L",
];

const STYLES = {
  btnPrimary:
    "inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-800 text-white shadow-sm hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed",
  btnSecondary:
    "inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm",
  btnDanger:
    "inline-flex items-center gap-2 px-4 py-2 rounded-md border border-red-300 text-red-600 bg-white hover:bg-red-50 shadow-sm",
  link:
    "text-slate-600 hover:text-slate-900 underline underline-offset-2",
  fieldLabel:
    "text-[11px] uppercase tracking-wide font-medium text-slate-500",
  input:
    "mt-1 w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-slate-700",
  textarea:
    "mt-1 w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-slate-700",
  staticField:
    "mt-1 px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-sm flex items-center justify-between",
  card:
    "rounded-lg border border-slate-200 bg-white shadow-sm",
  cardHeader:
    "p-4 border-b border-slate-100",
  title:
    "text-base font-semibold text-slate-800",
  subtitle:
    "text-sm text-slate-500 mt-1",
  tabsBar:
    "flex items-center gap-2 border-b border-slate-200",
  tab:
    "px-3 py-2 -mb-px rounded-t-md border border-transparent text-sm text-slate-600 hover:text-slate-900",
  tabActive:
    "px-3 py-2 -mb-px rounded-t-md border border-slate-200 border-b-white bg-white text-sm text-slate-900",
  modalBackdrop:
    "fixed inset-0 bg-black/30",
  modal:
    "fixed inset-0 flex items-center justify-center p-4",
  modalPanel:
    "w-full max-w-3xl rounded-lg border border-slate-200 bg-white shadow-xl",
  chip:
    "inline-flex items-center px-2 py-0.5 rounded-md text-xs border border-slate-300",
};

const MEDIA_OPTIONS = [
  { id: "PCA", name: "PCA agar" },
  { id: "DRBC", name: "DRBC agar" },
  { id: "MYP", name: "MYP agar" },
  { id: "m-Endo", name: "m-Endo agar" },
];

const SAMPLE_TYPES = [
  "Drinking water",
  "Process water",
  "Cooling Tower water",
  "Dairy products",
  "Food surfaces",
  "Pharma PW/WFI",
];

const RESULT_OPERATORS = [
  "=",
  "<",
  ">",
  "est",
  "<est",
  ">est",
  "Detected",
  "Not Detected",
  "+ve",
  "-ve",
  "Positive",
  "Negative",
  "Present",
  "Absent",
];

const safeId = () =>
  (window.crypto && typeof window.crypto.randomUUID === "function")
    ? window.crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

export default function TestMethodDefinitionPage() {
  const [method, setMethod] = useState({
    codePrefix: "",
    codeVersion: "",
    name: "",
    shortCode: "",
    reference: "",
    methodUnits: "CFU/mL",
    applicableTo: "",
    preservation: "",
    principle: "",
    sampleContainer: "",
    defaultDilutions: 1,
    multipleMedia: false,
    mediaSelected: [],
  });

  const [analytes, setAnalytes] = useState([]);
  const [activeTab, setActiveTab] = useState("Analytes");
  const [showAnalyteModal, setShowAnalyteModal] = useState(false);
  const [draftAnalyte, setDraftAnalyte] = useState(null);

  const methodCode = useMemo(() => {
    if (!method.codePrefix && !method.codeVersion) return "—";
    return [method.codePrefix || "0", method.codeVersion || "0"].join(".");
  }, [method.codePrefix, method.codeVersion]);

  const startAddAnalyte = () => {
    setDraftAnalyte({
      id: safeId(),
      analyteCodeSuffix: "",
      sampleTypes: [],
      defaultResultOp: RESULT_OPERATORS[0],
      defaultResultValue: "",
      secondaryValuesCsv: "",
      alertValue: "",
      description: "",
      italics: false,
      detectionLimit: "",
      reportShortName: "",
      note: "",
      units: method.methodUnits || "CFU/mL",
      accredited: false,
    });
    setShowAnalyteModal(true);
  };

  const saveAnalyte = () => {
    if (!draftAnalyte.analyteCodeSuffix) return alert("Analyte Code is required");
    setAnalytes((prev) => [...prev, draftAnalyte]);
    setShowAnalyteModal(false);
  };

  const updateAnalyte = (id, patch) => {
    setAnalytes((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const removeAnalyte = (id) => {
    setAnalytes((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleMediaSelection = (id) => {
    setMethod((m) => {
      const exists = m.mediaSelected.includes(id);
      const next = exists ? m.mediaSelected.filter((x) => x !== id) : [...m.mediaSelected, id];
      return { ...m, mediaSelected: next };
    });
  };

  const validate = () => {
    const errors = [];
    if (!method.codePrefix) errors.push("Method Code (Prefix) is required");
    if (!method.codeVersion) errors.push("Method Code (Version) is required");
    if (!method.name) errors.push("Name is required");
    if (!method.shortCode || (method.shortCode.length !== 3 && method.shortCode.length !== 4)) {
      errors.push("Short code is required (3–4 characters)");
    }
    if (!method.methodUnits) errors.push("Method Units is required");
    if (method.defaultDilutions < 1) errors.push("Default number of dilutions must be ≥ 1");
    if (method.multipleMedia && method.mediaSelected.length === 0) {
      errors.push("Select at least one medium when Multiple Media is enabled");
    }
    analytes.forEach((a, idx) => {
      if (!a.analyteCodeSuffix) errors.push(`Analyte #${idx + 1}: Analyte Code (numeric suffix) is required`);
      if (!a.units) errors.push(`Analyte #${idx + 1}: Method Units is required`);
    });
    return errors;
  };

  const handleSave = () => {
    const errors = validate();
    if (errors.length) {
      alert("Please fix the following before saving:\n\n" + errors.map((e) => `• ${e}`).join("\n"));
      return;
    }
    const payload = {
      method: {
        ...method,
        codeComputed: methodCode,
      },
      analytes: analytes.map((a) => ({
        ...a,
        analyteCodeComputed: `${methodCode}.${a.analyteCodeSuffix || "0"}`,
      })),
    };
    console.log("SAVE", payload);
    alert("Saved! (Check console for payload)");
  };

  const resetAll = () => {
    if (!confirm("Clear the form?")) return;
    setMethod({
      codePrefix: "",
      codeVersion: "",
      name: "",
      shortCode: "",
      reference: "",
      methodUnits: "CFU/mL",
      applicableTo: "",
      preservation: "",
      principle: "",
      sampleContainer: "",
      defaultDilutions: 1,
      multipleMedia: false,
      mediaSelected: [],
    });
    setAnalytes([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-semibold tracking-tight text-slate-800">Test Method Definition</h1>
          <div className="flex gap-2">
            <button onClick={resetAll} className={STYLES.btnSecondary}>Reset</button>
            <button onClick={handleSave} className={STYLES.btnPrimary}>Save</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <section>
          <Card title="Method Details" subtitle="Primary method identifier, metadata, and scope.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput label="Method Code (Prefix)" required value={method.codePrefix} onChange={(v) => setMethod({ ...method, codePrefix: v.replace(/[^0-9]/g, "") })} placeholder="e.g., 7" />
              <TextInput label="Method Code (Version)" required value={method.codeVersion} onChange={(v) => setMethod({ ...method, codeVersion: v.replace(/[^0-9]/g, "") })} placeholder="e.g., 1" />
              <StaticField label="Computed Method Code" value={methodCode} hint="Shown on templates, worksheets, CoAs" />

              <TextInput className="md:col-span-2" label="Name" required value={method.name} onChange={(v) => setMethod({ ...method, name: v })} placeholder="Heterotrophic Plate Count – Pour Plate, 35 °C" />
              <TextInput label="Short Code (3–4 chars)" required maxLength={4} value={method.shortCode} onChange={(v) => setMethod({ ...method, shortCode: v.toUpperCase() })} placeholder="SPC" />

              <TextInput className="md:col-span-2" label="Reference(s)" value={method.reference} onChange={(v) => setMethod({ ...method, reference: v })} placeholder="ISO 4833-1:2013; APHA 9215B" />
              <SelectInput label="Method Units" required options={UNITS} value={method.methodUnits} onChange={(v) => setMethod({ ...method, methodUnits: v })} />

              <TextArea className="md:col-span-3" label="Applicable To (Matrices/Scope)" value={method.applicableTo} onChange={(v) => setMethod({ ...method, applicableTo: v })} placeholder="Drinking water; Process water; Dairy products" />

              <TextArea className="md:col-span-3" label="Preservation & Holding Time" value={method.preservation} onChange={(v) => setMethod({ ...method, preservation: v })} placeholder="Cool ≤ 8 °C; Analyze within 6 h; Sodium thiosulfate for chlorinated water" />

              <TextArea className="md:col-span-3" label="Principle" value={method.principle} onChange={(v) => setMethod({ ...method, principle: v })} placeholder="Membrane filtration followed by incubation on m-Endo agar at 35 ± 0.5 °C for 24 ± 2 h." />

              <TextArea className="md:col-span-3" label="Sample Container" value={method.sampleContainer} onChange={(v) => setMethod({ ...method, sampleContainer: v })} placeholder="Sterile 250 mL PET bottle with thiosulfate; 100 mL minimum." />

              <NumberInput label="Default number of dilutions" min={1} value={method.defaultDilutions} onChange={(v) => setMethod({ ...method, defaultDilutions: v })} />

              <CheckboxInput label="Multiple media supported" checked={method.multipleMedia} onChange={(v) => setMethod({ ...method, multipleMedia: v, mediaSelected: v ? method.mediaSelected : [] })} />

              {method.multipleMedia && (
                <div className="md:col-span-2">
                  <FieldLabel>Supported media (select at least one)</FieldLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                    {MEDIA_OPTIONS.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={method.mediaSelected.includes(m.id)}
                          onChange={() => toggleMediaSelection(m.id)}
                        />
                        <span className="text-sm">{m.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </section>

        <section>
          <div className={STYLES.tabsBar}>
            <button className={activeTab === "Analytes" ? STYLES.tabActive : STYLES.tab} onClick={() => setActiveTab("Analytes")}>Analytes</button>
          </div>
          {activeTab === "Analytes" && (
            <div className="rounded-b-lg border border-slate-200 border-t-0 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-700">Analyte List</h3>
                <button onClick={startAddAnalyte} className={STYLES.btnPrimary}>Add Analyte</button>
              </div>
              {analytes.length === 0 ? (
                <p className="text-sm text-slate-500 mt-3">No analytes added yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {analytes.map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-4 rounded-md border border-slate-200 p-3">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-slate-800">{`${methodCode}.${a.analyteCodeSuffix || "—"}`}</div>
                        <div className="text-sm text-slate-600">{a.description || "—"}</div>
                        <div className="flex flex-wrap gap-1">
                          {(a.sampleTypes || []).map((s) => (
                            <span key={s} className={STYLES.chip}>{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeAnalyte(a.id)} className={STYLES.btnDanger}>Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </main>

      {showAnalyteModal && (
        <div className={STYLES.modal}>
          <div className={STYLES.modalBackdrop} onClick={() => setShowAnalyteModal(false)} />
          <div className={STYLES.modalPanel}>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">Add Analyte</h3>
              <button onClick={() => setShowAnalyteModal(false)} className={STYLES.btnSecondary}>Close</button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextInput label="Analyte Code (numeric suffix)" required value={draftAnalyte.analyteCodeSuffix} onChange={(v) => setDraftAnalyte({ ...draftAnalyte, analyteCodeSuffix: v.replace(/[^0-9]/g, "") })} placeholder="e.g., 2" />
                <StaticField label="Computed Analyte Code" value={`${methodCode}.${draftAnalyte.analyteCodeSuffix || "—"}`} />
                <SelectInput label="Method Units" required options={UNITS} value={draftAnalyte.units} onChange={(v) => setDraftAnalyte({ ...draftAnalyte, units: v })} />

                <MultiSelect label="Sample Types" options={SAMPLE_TYPES} value={draftAnalyte.sampleTypes} onChange={(arr) => setDraftAnalyte({ ...draftAnalyte, sampleTypes: arr })} />

                <SelectInput label="Default Result (Operator)" options={RESULT_OPERATORS} value={draftAnalyte.defaultResultOp} onChange={(v) => setDraftAnalyte({ ...draftAnalyte, defaultResultOp: v })} />
                <TextInput label="Default Result (Value)" value={draftAnalyte.defaultResultValue} onChange={(v) => setDraftAnalyte({ ...draftAnalyte, defaultResultValue: v })} placeholder="e.g., 10" />

                <TextInput className="md:col-span-2" label="Supported secondary values (CSV)" value={draftAnalyte.secondaryValuesCsv} onChange={(v) => setDraftAnalyte({ ...draftAnalyte, secondaryValuesCsv: v })} placeholder="Negligible or excellent, Mild to very good, Good, Moderate to fair, Poor, Very Poor" />
                <TextInput label="Alert Value (threshold)" value={draftAnalyte.alertValue} onChange={(v) => setDraftAnalyte({ ...draftAnalyte, alertValue: v })} placeholder="e.g., 500" />

                <TextInput className="md:col-span-2" label="Description (e.g., Escherichia coli)" value={draftAnalyte.description} onChange={(v) => setDraftAnalyte({ ...draftAnalyte, description: v })} />
                <CheckboxInput label="Italicize Description (reports)" checked={draftAnalyte.italics} onChange={(v) => setDraftAnalyte({ ...draftAnalyte, italics: v })} />

                <TextInput label="Detection Limit" value={draftAnalyte.detectionLimit} onChange={(v) => setDraftAnalyte({ ...draftAnalyte, detectionLimit: v })} placeholder="e.g., 1 CFU/100mL" />
                <TextInput label="Report Short Name" value={draftAnalyte.reportShortName} onChange={(v) => setDraftAnalyte({ ...draftAnalyte, reportShortName: v })} placeholder="E. coli" />
                <CheckboxInput label="Accredited (NATA/SAMM)" checked={draftAnalyte.accredited} onChange={(v) => setDraftAnalyte({ ...draftAnalyte, accredited: v })} />

                <TextArea className="md:col-span-3" label="Note" value={draftAnalyte.note} onChange={(v) => setDraftAnalyte({ ...draftAnalyte, note: v })} placeholder="Specific constraints or remarks" />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onClick={() => setShowAnalyteModal(false)} className={STYLES.btnSecondary}>Cancel</button>
              <button onClick={saveAnalyte} className={STYLES.btnPrimary}>Save Analyte</button>
            </div>
          </div>
        </div>
      )}

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-slate-500">
        <p>Prototype only · No persistence · Fields and rules based on internal data dictionary.</p>
      </footer>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className={STYLES.card}>
      <div className={STYLES.cardHeader}>
        <h2 className={STYLES.title}>{title}</h2>
        {subtitle && <p className={STYLES.subtitle}>{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function FieldLabel({ children }) {
  return <label className={STYLES.fieldLabel}>{children}</label>;
}

function StaticField({ label, value, hint }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className={STYLES.staticField}>
        <span>{value || "—"}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, required, maxLength, className }) {
  return (
    <div className={className}>
      <FieldLabel>
        {label} {required && <span className="text-red-600">*</span>}
      </FieldLabel>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={STYLES.input}
      />
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max }) {
  const handle = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange(typeof min === "number" ? min : 0);
      return;
    }
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    onChange(n);
  };
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={handle}
        className={STYLES.input}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, className }) {
  return (
    <div className={className}>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={STYLES.textarea}
      />
    </div>
  );
}

function CheckboxInput({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-2 mt-6">
      <input type="checkbox" className="h-4 w-4" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <FieldLabel>{label}</FieldLabel>
    </div>
  );
}

function SelectInput({ label, options, value, onChange, required }) {
  return (
    <div>
      <FieldLabel>
        {label} {required && <span className="text-red-600">*</span>}
      </FieldLabel>
      <select
        className={STYLES.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function MultiSelect({ label, options, value, onChange }) {
  const toggle = (opt) => {
    const exists = value.includes(opt);
    onChange(exists ? value.filter((v) => v !== opt) : [...value, opt]);
  };
  return (
    <div className="md:col-span-3">
      <FieldLabel>{label}</FieldLabel>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
            <input type="checkbox" className="h-4 w-4" checked={value.includes(opt)} onChange={() => toggle(opt)} />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
