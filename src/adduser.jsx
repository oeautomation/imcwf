import React, { useMemo, useState, useEffect } from "react";

/*******************************************************************
 * User Editor – Sample Collector & Regions (Australia)
 * Fix: Correct useState destructuring + clean Status section
 * Added: Simple in-app test harness to validate core behaviours
 ***********************************************************/

// ---- Constants ----
const ALL_ROLES = [
  "Accounts",
  "Lab Level 1",
  "Lab Level 2",
  "Lab Manager",
  "Lab Signatory",
  "Lab Staff",
  "Lab Staff NATA",
  "Office Admin",
  "Sales Manager",
  "Sales Staff",
  "Sample Collecting Staff",
  "System Administrator",
  "T/S - Supervisor",
];

// Example Australia regions (pre-configured)
const REGION_OPTIONS = [
    { code: "NSW-T3", name: "NSW Territory 3" },
    { code: "NSW-T4", name: "NSW Territory 4" },
    { code: "NSW-T1", name: "NSW territory 1" },
    { code: "NSW-T2", name: "NSW territory 2" },
    { code: "QLD-NORTH", name: "QLD North" },
    { code: "QLD-SOUTH", name: "QLD South" },
    { code: "SUB-CON", name: "Sub Contractor" },
    { code: "VICSA-T2", name: "VICSA Territory 2" },
    { code: "VICSA", name: "Victoria SA" },
  ];
/******************* Helper UI *******************/
function Section({ title, children, className = "" }) {
  return (
    <section className={`mt-6 pt-6 border-t border-slate-200 ${className}`}>
      {title && <h3 className="text-sm font-semibold text-slate-600 mb-3">{title}</h3>}
      {children}
    </section>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <div>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>}
      {children}
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-full border text-sm transition ${
        active
          ? "bg-indigo-600 text-white border-indigo-600"
          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-indigo-600" : "bg-slate-300"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </div>
  );
}

/******************* Pure validation for tests *******************/
function validateUser(form) {
  const errors = {};
  if (!form.fullName?.trim()) errors.fullName = "Full name is required.";
  if (!form.email?.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email.";

  const isCollector = form.roles?.includes("Sample Collecting Staff");
  if (isCollector && !form.regionAny && (!form.regionCodes || form.regionCodes.length === 0)) {
    errors.region = "Choose ‘Any’ or select at least one region for Sample Collecting Staff.";
  }
  return errors;
}

/******************* Main Component *******************/
export default function UserEditor() {
  // --- State (fixed destructuring) ---
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Active"); // Active | Inactive
  const [roles, setRoles] = useState([]); // <-- fixed
  const [regionAny, setRegionAny] = useState(false);
  const [regionCodes, setRegionCodes] = useState([]);
  const [errors, setErrors] = useState({});
  // Additional requested fields
  const [nataSignatory, setNataSignatory] = useState(false);
  const [qualification, setQualification] = useState("");
  const [signatureFileName, setSignatureFileName] = useState("");

  const isCollector = roles.includes("Sample Collecting Staff");

  const livePayload = useMemo(
    () => ({
      full_name: fullName.trim(),
      email: email.trim(),
      status,
      roles,
      sample_collecting_access: isCollector
        ? { any_region: regionAny, region_codes: regionAny ? [] : regionCodes }
        : null,
      nata_samm_signatory: nataSignatory,
      qualification: qualification.trim() || null,
      signature_file_name: signatureFileName || null,
    }),
    [fullName, email, status, roles, isCollector, regionAny, regionCodes, nataSignatory, qualification, signatureFileName]
  );

  function toggleRole(role) {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  function toggleRegion(code) {
    setRegionCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  function loadExample() {
    setFullName("Jordan Nguyen");
    setEmail("jordan.nguyen@example.com");
    setStatus("Active");
    setRoles(["Lab Staff", "Sample Collecting Staff"]);
    setRegionAny(false);
    setRegionCodes(["NSW-WEST", "VIC-MELB"]);
    setNataSignatory(true);
    setQualification("B.Sc. (Microbiology), NATA Accredited");
    setSignatureFileName("jordan-signature.png");
    setErrors({});
  }

  function clearAll() {
    setFullName("");
    setEmail("");
    setStatus("Active");
    setRoles([]);
    setRegionAny(false);
    setRegionCodes([]);
    setNataSignatory(false);
    setQualification("");
    setSignatureFileName("");
    setErrors({});
  }

  function validateAndSet() {
    const e = validateUser({
      fullName,
      email,
      roles,
      regionAny,
      regionCodes,
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e) {
    e.preventDefault();
    if (!validateAndSet()) return;
    alert("✅ User is valid. See payload preview below (console).\nReplace alert with your API call.");
    console.log("SUBMIT", livePayload);
  }

  // Auto-clear regions when collector role removed
  useEffect(() => {
    if (!isCollector) {
      setRegionAny(false);
      setRegionCodes([]);
    }
  }, [isCollector]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">User Editor</span>
            <p className="text-sm text-slate-500">Grant roles and configure Sample Collector regions (Australia)</p>
          </div>

          <form onSubmit={submit} className="p-5">
            {/* Basic fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name" error={errors.fullName}>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </Field>
            </div>

            <Section title="Status">
              <div className="flex items-center gap-3">
                <Toggle checked={status === "Active"} onChange={(v) => setStatus(v ? "Active" : "Inactive")} />
                <span className={`text-sm font-semibold ${status === "Active" ? "text-emerald-600" : "text-red-600"}`}>{status}</span>
              </div>
            </Section>

            <Section title="Additional Fields">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="NATA/SAMM Signatory">
                  <div className="flex items-center gap-3">
                    <Toggle checked={nataSignatory} onChange={setNataSignatory} />
                    <span className="text-sm">Mark as authorised signatory</span>
                  </div>
                </Field>
                <Field label="Qualification" hint="E.g., B.Sc. (Microbiology), M.Sc., NATA Accredited">
                  <input
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="Enter qualification"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Signature" hint={signatureFileName ? ("Selected: " + signatureFileName) : "Upload an image of the user's signature (PNG/JPG)."}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      setSignatureFileName(f ? f.name : "");
                    }}
                    className="w-full text-sm"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Roles (Multi-select)">
              <div className="flex flex-wrap gap-2">
                {ALL_ROLES.map((r) => (
                  <Chip key={r} active={roles.includes(r)} onClick={() => toggleRole(r)}>
                    {r}
                  </Chip>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">Selecting <b>Sample Collecting Staff</b> reveals Region access.</p>
            </Section>

            {isCollector && (
              <Section title="Region Access">
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <Toggle checked={regionAny} onChange={setRegionAny} label={<span className="font-semibold">Any</span>} />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                        onClick={() => setRegionCodes(REGION_OPTIONS.map((r) => r.code))}
                        disabled={regionAny}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                        onClick={() => setRegionCodes([])}
                        disabled={regionAny}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4 ${regionAny ? "opacity-50 pointer-events-none" : ""}`}>
                    {REGION_OPTIONS.map((r) => (
                      <label key={r.code} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white">
                        <input
                          type="checkbox"
                          checked={regionCodes.includes(r.code)}
                          onChange={() => toggleRegion(r.code)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{r.name}</span>
                      </label>
                    ))}
                  </div>

                  {errors.region && <p className="text-xs text-red-600 mt-2">{errors.region}</p>}
                </div>
              </Section>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700">
                Save User
              </button>
              <button type="button" onClick={loadExample} className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold">
                Load Example User
              </button>
              <button type="button" onClick={clearAll} className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold">
                New User
              </button>
            </div>
            {/*
            <Section title="Live payload preview (what you’d send to your API)">
              <pre className="bg-slate-900 text-indigo-100 p-3 rounded-lg text-xs overflow-auto">{JSON.stringify(livePayload, null, 2)}</pre>
            </Section>
            */}

            <TestPanel />
          </form>
        </div>
      </div>
    </div>
  );
}

/******************* Test Harness (UI) *******************/
function TestPanel() {
  const [results, setResults] = useState([]);

  function runTests() {
    const tests = [];

    // Test 1: Collector with no regions and Any=false => error.region
    tests.push({
      name: "Collector requires Any or at least one region",
      form: {
        fullName: "A B",
        email: "a@b.com",
        roles: ["Sample Collecting Staff"],
        regionAny: false,
        regionCodes: [],
      },
      expect: (errs) => errs.region,
    });

    // Test 2: Collector with Any=true => no region error
    tests.push({
      name: "Collector with Any passes region validation",
      form: {
        fullName: "A B",
        email: "a@b.com",
        roles: ["Sample Collecting Staff"],
        regionAny: true,
        regionCodes: [],
      },
      expect: (errs) => !errs.region,
    });

    // Test 3: Non-collector ignores region rules
    tests.push({
      name: "Non-collector ignores region validation",
      form: {
        fullName: "A B",
        email: "a@b.com",
        roles: ["Lab Staff"],
        regionAny: false,
        regionCodes: [],
      },
      expect: (errs) => !errs.region,
    });

    // Test 4: Email format validation
    tests.push({
      name: "Invalid email is flagged",
      form: {
        fullName: "A B",
        email: "not-an-email",
        roles: [],
        regionAny: false,
        regionCodes: [],
      },
      expect: (errs) => errs.email,
    });

    // Test 5: Full name required
    tests.push({
      name: "Full name required",
      form: {
        fullName: " ",
        email: "a@b.com",
        roles: [],
        regionAny: false,
        regionCodes: [],
      },
      expect: (errs) => errs.fullName,
    });

    const outcomes = tests.map((t) => {
      const errs = validateUser(t.form);
      const pass = !!t.expect(errs);
      return { name: t.name, pass, errs };
    });

    setResults(outcomes);
    console.table(outcomes.map(o => ({ name: o.name, pass: o.pass })));
  }

  return (
    <Section title="Test Panel (in-app)">
      {/* <div className="flex items-center gap-2 mb-3">
        <button type="button" onClick={runTests} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm">
          Run Tests
        </button>
        <span className="text-xs text-slate-500">Results also printed to console.</span>
      </div> */}
      {results.length > 0 && (
        <ul className="space-y-1 text-sm">
          {results.map((r, i) => (
            <li key={i} className={r.pass ? "text-emerald-600" : "text-red-600"}>
              {r.pass ? "✓" : "✗"} {r.name}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
