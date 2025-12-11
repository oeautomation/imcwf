import React, { useState } from "react";

/**
 * Advanced User Editor – Single-file JSX with inline dependencies (no external UI libs)
 *
 * Requirements handled:
 * - Contexts are tied to role type (Labs→Departments, Sample Collectors→Regions, Sales→Both)
 * - Each role shows ONLY the contexts it supports; roles with no contexts show nothing
 * - "Apply to all" button under each context copies that context to other compatible roles
 * - Includes basic user details + Save button; payload is validated & logged
 */

// --- Data ---
const ALL_ROLES = [
  "Accounts",
  "Lab Level 1",
  "Lab Level 2",
  "Lab Manager",
  "Lab Signatory",
  "Lab Staff",
  "Sales Manager",
  "Sales Staff",
  "Sample Collecting Staff",
];

const DEPT_OPTIONS = [
  { code: "MIC", name: "Microbiology" },
  { code: "ENV", name: "Environs" },
  { code: "AWT", name: "AWT" },
  { code: "MSC", name: "Misc" },
];

const REGION_OPTIONS = [
  { code: "NSW-T3", name: "NSW Territory 3" },
  { code: "NSW-T4", name: "NSW Territory 4" },
  { code: "QLD-NORTH", name: "QLD North" },
  { code: "QLD-SOUTH", name: "QLD South" },
  { code: "VICSA", name: "Victoria SA" },
];

// --- Small style helpers (inline, no external CSS) ---
const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", color: "#0f172a", padding: 24, boxSizing: "border-box" },
  card: { maxWidth: 980, margin: "0 auto", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", padding: 24 },
  h2: { fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 16 },
  section: { marginTop: 24, paddingTop: 24, borderTop: "1px solid #e2e8f0" },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 12 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 },
  input: { width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: "10px 12px", outline: "none" },
  inputError: { borderColor: "#fda4af", boxShadow: "0 0 0 2px rgba(244,63,94,0.15)" },
  help: { fontSize: 12, color: "#ef4444", marginTop: 6 },
  row: { display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" },
  toggleWrap: { display: "flex", alignItems: "center", gap: 8 },
  toggle: (on) => ({ position: "relative", width: 44, height: 24, borderRadius: 999, background: on ? "#4f46e5" : "#cbd5e1", cursor: "pointer" }),
  knob: (on) => ({ position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: 999, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.15)", transition: "left 160ms" }),
  rolesWrap: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: (active) => ({ padding: "8px 12px", borderRadius: 999, border: `1px solid ${active ? "#4f46e5" : "#e2e8f0"}`, background: active ? "#4f46e5" : "#fff", color: active ? "#fff" : "#334155", fontSize: 14, cursor: "pointer" }),
  rolePanel: { border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc", padding: 12 },
  roleHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  subTitle: { fontSize: 12, fontWeight: 700, margin: 0, color: "#334155" },
  rowWrap: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  subtleBtn: { fontSize: 12, color: "#4f46e5", background: "transparent", border: "none", cursor: "pointer", padding: 0 },
  actions: { display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" },
  primaryBtn: { padding: "10px 14px", borderRadius: 12, border: "none", background: "#4f46e5", color: "#fff", fontWeight: 700, cursor: "pointer" },
  ghostBtn: { padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", fontWeight: 700, cursor: "pointer" },
};

// --- Small UI primitives ---
const TextInput = ({ label, value, onChange, placeholder, error }) => (
  <div>
    <label style={styles.label}>{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
    />
    {error && <div style={styles.help}>{error}</div>}
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div style={styles.toggleWrap}>
    <div role="switch" aria-checked={checked} onClick={() => onChange(!checked)} style={styles.toggle(checked)}>
      <span style={styles.knob(checked)} />
    </div>
    {label && <span style={{ fontSize: 13, color: "#334155" }}>{label}</span>}
  </div>
);

const Chip = ({ active, onClick, children }) => (
  <button type="button" onClick={onClick} style={styles.chip(active)}>{children}</button>
);

const Section = ({ title, children }) => (
  <section style={styles.section}>
    {title && <h3 style={styles.sectionTitle}>{title}</h3>}
    {children}
  </section>
);

// --- Role rules ---
const roleHasDepartments = (role) => [
  "Lab Level 1",
  "Lab Level 2",
  "Lab Manager",
  "Lab Staff",
  "Lab Signatory",
  "Sales Staff",
  "Sales Manager",
].includes(role);

const roleHasRegions = (role) => [
  "Sample Collecting Staff",
  "Sales Staff",
  "Sales Manager",
].includes(role);

// --- Main component ---
function AddUser() {
  // User details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [active, setActive] = useState(true);
  const [nataSignatory, setNataSignatory] = useState(false);
  const [qualification, setQualification] = useState("");
  const [signatureFileName, setSignatureFileName] = useState("");
  const [errors, setErrors] = useState({});

  // Roles & contexts
  const [roles, setRoles] = useState([]);
  // contextMap: { [role]: { departments: string[], regions: string[] } }
  const [contextMap, setContextMap] = useState({});

  const toggleRole = (role) => {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  };

  const ensureRoleObj = (role) => ({ departments: [], regions: [], ...(contextMap[role] || {}) });

  const toggleContextValue = (role, type, code) => {
    setContextMap((prev) => {
      const existing = ensureRoleObj(role);
      const list = existing[type] || [];
      const updatedList = list.includes(code) ? list.filter((c) => c !== code) : [...list, code];
      return { ...prev, [role]: { ...existing, [type]: updatedList } };
    });
  };

  // Apply-to-all (per context type) from a source role → copy to other compatible roles
  const applyDepartmentsToAll = (sourceRole) => {
    const src = ensureRoleObj(sourceRole).departments;
    setContextMap((prev) => {
      const next = { ...prev };
      roles.forEach((r) => {
        if (r === sourceRole) return;
        if (roleHasDepartments(r)) next[r] = { ...ensureRoleObj(r), departments: [...src] };
      });
      return next;
    });
  };

  const applyRegionsToAll = (sourceRole) => {
    const src = ensureRoleObj(sourceRole).regions;
    setContextMap((prev) => {
      const next = { ...prev };
      roles.forEach((r) => {
        if (r === sourceRole) return;
        if (roleHasRegions(r)) next[r] = { ...ensureRoleObj(r), regions: [...src] };
      });
      return next;
    });
  };

  // Save
  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = "Full name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      user: {
        full_name: fullName.trim(),
        email: email.trim(),
        status: active ? "Active" : "Inactive",
        nata_samm_signatory: nataSignatory,
        qualification: qualification || null,
        signature_file_name: signatureFileName || null,
      },
      roles,
      contexts_by_role: contextMap,
    };

    console.log("SAVE USER PAYLOAD", payload);
    alert("✅ User saved (payload in console). Replace with API call.");
  };

  // --- Render ---
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.h2}>Advanced User Creation</h2>

        <form onSubmit={handleSave}>
          <div style={styles.grid2}>
            <TextInput label="Full Name" value={fullName} onChange={setFullName} placeholder="Enter full name" error={errors.fullName} />
            <TextInput label="Email" value={email} onChange={setEmail} placeholder="name@example.com" error={errors.email} />
            <div style={styles.row}>
              <Toggle label="Active" checked={active} onChange={setActive} />
              <Toggle label="NATA/SAMM Signatory" checked={nataSignatory} onChange={setNataSignatory} />
            </div>
            <TextInput label="Qualification" value={qualification} onChange={setQualification} placeholder="B.Sc. (Microbiology), M.Sc., etc." />
            <div>
              <label style={styles.label}>Signature</label>
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files && e.target.files[0]; setSignatureFileName(f ? f.name : ""); }} />
              {signatureFileName && <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>Selected: {signatureFileName}</div>}
            </div>
          </div>

          <Section title="Roles">
            <div style={styles.rolesWrap}>
              {ALL_ROLES.map((r) => (
                <Chip key={r} active={roles.includes(r)} onClick={() => toggleRole(r)}>{r}</Chip>
              ))}
            </div>
          </Section>

          {roles.length > 0 && (
            <Section title="Additional Configurations">
              <div style={{ display: "grid", gap: 12 }}>
                {roles.map((role) => {
                  const showDepts = roleHasDepartments(role);
                  const showRegs = roleHasRegions(role);
                  if (!showDepts && !showRegs) return null; // hide section if role doesn't support contexts
                  return (
                    <div key={role} style={styles.rolePanel}>
                      <div style={styles.roleHeader}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{role}</h4>
                      </div>

                      {showDepts && (
                        <div style={{ marginTop: 8 }}>
                          <div style={styles.rowWrap}>
                            <h5 style={styles.subTitle}>Departments</h5>
                            <button type="button" style={styles.subtleBtn} onClick={() => applyDepartmentsToAll(role)} title="Copy to all roles that use Departments">Apply to all</button>
                          </div>
                          <div style={styles.rolesWrap}>
                            {DEPT_OPTIONS.map((d) => (
                              <Chip key={d.code} active={ensureRoleObj(role).departments.includes(d.code)} onClick={() => toggleContextValue(role, "departments", d.code)}>
                                {d.name}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      )}

                      {showRegs && (
                        <div style={{ marginTop: 12 }}>
                          <div style={styles.rowWrap}>
                            <h5 style={styles.subTitle}>Regions</h5>
                            <button type="button" style={styles.subtleBtn} onClick={() => applyRegionsToAll(role)} title="Copy to all roles that use Regions">Apply to all</button>
                          </div>
                          <div style={styles.rolesWrap}>
                            {REGION_OPTIONS.map((r) => (
                              <Chip key={r.code} active={ensureRoleObj(role).regions.includes(r.code)} onClick={() => toggleContextValue(role, "regions", r.code)}>
                                {r.name}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          <div style={styles.actions}>
            <button type="submit" style={styles.primaryBtn}>Save User</button>
            <button
              type="button"
              style={styles.ghostBtn}
              onClick={() => {
                setFullName("");
                setEmail("");
                setActive(true);
                setNataSignatory(false);
                setQualification("");
                setSignatureFileName("");
                setRoles([]);
                setContextMap({});
                setErrors({});
              }}
            >
              New User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUser;
