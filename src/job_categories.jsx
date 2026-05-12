import React, { useState } from "react";

const workflows = ["Regular Workflow", "Corrosion Workflow", "AWT Workflow"];

const initialData = [
  {
    id: "jt-microbiology",
    type: "jobType",
    name: "Microbiology",
    displayName: "Microbiology",
    prefix: "M",
    categories: [
      {
        id: "cat-food",
        type: "category",
        name: "Food",
        displayName: "Food",
        workflow: "Regular Workflow",
        active: true,
        sampleTypes: [
          { id: "st-food-swab", type: "sampleType", name: "Food Swab", displayName: "Food Swab", active: true },
          { id: "st-ingredients", type: "sampleType", name: "Ingredients", displayName: "Ingredients", active: true },
          { id: "st-beverages", type: "sampleType", name: "Beverages", displayName: "Beverages", active: true },
        ],
      },
      {
        id: "cat-water",
        type: "category",
        name: "Water",
        displayName: "Water",
        workflow: "Regular Workflow",
        active: true,
        sampleTypes: [
          { id: "st-water-ct", type: "sampleType", name: "CT", displayName: "CT", active: true },
          { id: "st-water-pool", type: "sampleType", name: "Pool/SPA", displayName: "Pool/SPA", active: true },
          { id: "st-water-pw", type: "sampleType", name: "PW", displayName: "PW", active: true },
          { id: "st-water-wf", type: "sampleType", name: "WF", displayName: "WF", active: true },
        ],
      },
    ],
  },
  {
    id: "jt-awt",
    type: "jobType",
    name: "AWT",
    displayName: "AWT",
    prefix: "A",
    categories: [
      {
        id: "cat-chemical",
        type: "category",
        name: "Chemical",
        displayName: "Chemical",
        workflow: "AWT Workflow",
        active: true,
        sampleTypes: [
          { id: "st-chemical-analysis", type: "sampleType", name: "Chemical Analysis", displayName: "Chemical Analysis", active: true },
        ],
      },
      {
        id: "cat-corrosion",
        type: "category",
        name: "Corrosion",
        displayName: "Corrosion",
        workflow: "Corrosion Workflow",
        active: true,
        sampleTypes: [
          { id: "st-corrosion-analysis", type: "sampleType", name: "Corrosion Analysis", displayName: "Corrosion Analysis", active: true },
        ],
      },
      {
        id: "cat-awt-placeholder",
        type: "category",
        name: "Regular AWT category placeholder",
        displayName: "Regular AWT category placeholder",
        workflow: "AWT Workflow",
        active: true,
        sampleTypes: [
          { id: "st-awt-placeholder", type: "sampleType", name: "samples placeholder", displayName: "samples placeholder", active: true },
        ],
      },
    ],
  },
  {
    id: "jt-environs",
    type: "jobType",
    name: "Environs",
    displayName: "Environs",
    prefix: "E",
    categories: [
      {
        id: "cat-ieq",
        type: "category",
        name: "IEQ",
        displayName: "IEQ",
        workflow: "Regular Workflow",
        active: true,
        sampleTypes: [
          { id: "st-ieq-ct", type: "sampleType", name: "CT", displayName: "CT", active: true },
          { id: "st-ieq-pool", type: "sampleType", name: "Pool/SPA", displayName: "Pool/SPA", active: true },
          { id: "st-ieq-pw", type: "sampleType", name: "PW", displayName: "PW", active: true },
        ],
      },
      {
        id: "cat-iaq",
        type: "category",
        name: "IAQ",
        displayName: "IAQ",
        workflow: "Regular Workflow",
        active: true,
        sampleTypes: [
          { id: "st-iaq-ct", type: "sampleType", name: "CT", displayName: "CT", active: true },
          { id: "st-iaq-pool", type: "sampleType", name: "Pool/SPA", displayName: "Pool/SPA", active: true },
          { id: "st-iaq-pw", type: "sampleType", name: "PW", displayName: "PW", active: true },
        ],
      },
      {
        id: "cat-env-placeholder",
        type: "category",
        name: "Regular ENV category placeholder",
        displayName: "Regular ENV category placeholder",
        workflow: "Regular Workflow",
        active: true,
        sampleTypes: [
          { id: "st-env-placeholder", type: "sampleType", name: "samples placeholder", displayName: "samples placeholder", active: true },
        ],
      },
    ],
  },
  {
    id: "jt-misc",
    type: "jobType",
    name: "Miscellaneous",
    displayName: "Miscellaneous",
    prefix: "O",
    categories: [
      {
        id: "cat-misc",
        type: "category",
        name: "Miscellaneous",
        displayName: "Miscellaneous",
        workflow: "Regular Workflow",
        active: true,
        sampleTypes: [
          { id: "st-misc-placeholder", type: "sampleType", name: "sample type placeholder", displayName: "sample type placeholder", active: true },
        ],
      },
    ],
  },
];

const emptyForm = {
  mode: "add",
  entity: "jobType",
  jobTypeId: "",
  categoryId: "",
  id: "",
  name: "",
  displayName: "",
  prefix: "",
  workflow: "",
};

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function toggleActiveInData(data, entity, jobTypeId, categoryId, sampleTypeId) {
  const next = cloneData(data);
  const jt = next.find((x) => x.id === jobTypeId);

  if (!jt) return { data, ok: false, message: "Job Type was not found." };

  if (entity === "jobType") {
    return { data, ok: false, message: "Job Type cannot be made inactive." };
  }

  const cat = jt.categories.find((x) => x.id === categoryId);
  if (!cat) return { data, ok: false, message: "Job Category was not found." };

  if (entity === "category") {
    const targetStatus = !cat.active;
    cat.active = targetStatus;

    if (!targetStatus) {
      cat.sampleTypes.forEach((st) => {
        st.active = false;
      });
      return {
        data: next,
        ok: true,
        message: "Job Category was made inactive. Dependent sample types were also made inactive.",
      };
    }

    return {
      data: next,
      ok: true,
      message: "Job Category was reactivated. Sample types remain unchanged until manually reactivated.",
    };
  }

  const st = cat.sampleTypes.find((x) => x.id === sampleTypeId);
  if (!st) return { data, ok: false, message: "Sample Type was not found." };

  if (entity === "sampleType") {
    if (!st.active && !cat.active) {
      return {
        data,
        ok: false,
        message: "Cannot reactivate a Sample Type while the parent Job Category is inactive.",
      };
    }

    st.active = !st.active;
    return {
      data: next,
      ok: true,
      message: `Sample Type was ${st.active ? "reactivated" : "made inactive"}.`,
    };
  }

  return { data, ok: false, message: "Unsupported action." };
}

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${active ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-slate-200 bg-slate-100 text-slate-500"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function Button({ children, onClick, variant = "primary", size = "md", className = "", disabled = false, title }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-700",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
  };

  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

function Icon({ name, className = "h-4 w-4" }) {
  const icons = {
    plus: "+",
    edit: "✎",
    power: "⏻",
    search: "⌕",
    down: "⌄",
    right: "›",
    warning: "!",
    close: "×",
    save: "✓",
  };

  return (
    <span aria-hidden="true" className={`inline-flex items-center justify-center font-semibold leading-none ${className}`}>
      {icons[name] || "•"}
    </span>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-slate-100" aria-label="Close">
            <Icon name="close" className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function JobConfigurationPrototype() {
  const [data, setData] = useState(initialData);
  const [expanded, setExpanded] = useState(() => new Set());
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState(null);

  function toggleExpand(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openAdd(entity, jobTypeId = "", categoryId = "") {
    const nextJobTypeId = jobTypeId || data[0]?.id || "";
    const parentJobType = data.find((x) => x.id === nextJobTypeId);
    const nextCategoryId = categoryId || parentJobType?.categories[0]?.id || "";

    setForm({
      ...emptyForm,
      mode: "add",
      entity,
      jobTypeId: nextJobTypeId,
      categoryId: nextCategoryId,
      workflow: entity === "category" ? workflows[0] : "",
    });
  }

  function openEdit(entity, payload) {
    setForm({ ...emptyForm, mode: "edit", entity, ...payload });
  }

  function showMessage(type, text) {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 3500);
  }

  function saveForm() {
    const trimmedName = form.name.trim();
    const trimmedDisplayName = form.displayName.trim();

    if (form.mode === "add" && !trimmedName) {
      showMessage("error", "Name is mandatory.");
      return;
    }

    if (!trimmedDisplayName) {
      showMessage("error", "Display Name is mandatory.");
      return;
    }

    if (form.entity === "jobType" && !form.prefix.trim()) {
      showMessage("error", "Prefix is mandatory for Job Type.");
      return;
    }

    if (form.entity === "category" && !form.jobTypeId) {
      showMessage("error", "Parent Job Type is mandatory for Job Category.");
      return;
    }

    if (form.entity === "category" && !form.workflow) {
      showMessage("error", "Workflow is mandatory for Job Category.");
      return;
    }

    if (form.entity === "sampleType" && (!form.jobTypeId || !form.categoryId)) {
      showMessage("error", "Parent Job Type and Job Category are mandatory for Sample Type.");
      return;
    }

    setData((prev) => {
      const next = cloneData(prev);
      const newId = `${form.entity}-${Date.now()}`;

      if (form.mode === "add") {
        if (form.entity === "jobType") {
          const duplicateName = next.some((x) => x.name.toLowerCase() === trimmedName.toLowerCase());
          const duplicatePrefix = next.some((x) => x.prefix.toLowerCase() === form.prefix.trim().toLowerCase());

          if (duplicateName) {
            showMessage("error", "Duplicate Job Type name is not allowed.");
            return prev;
          }

          if (duplicatePrefix) {
            showMessage("error", "Duplicate Job Type prefix is not allowed.");
            return prev;
          }

          next.push({
            id: newId,
            type: "jobType",
            name: trimmedName,
            displayName: trimmedDisplayName,
            prefix: form.prefix.trim().toUpperCase(),
            categories: [],
          });
        }

        if (form.entity === "category") {
          const jt = next.find((x) => x.id === form.jobTypeId);
          if (!jt) {
            showMessage("error", "Parent Job Type was not found.");
            return prev;
          }

          const duplicate = jt.categories.some((x) => x.name.toLowerCase() === trimmedName.toLowerCase());
          if (duplicate) {
            showMessage("error", "Duplicate Job Category name under the same Job Type is not allowed.");
            return prev;
          }

          jt.categories.push({
            id: newId,
            type: "category",
            name: trimmedName,
            displayName: trimmedDisplayName,
            workflow: form.workflow,
            active: true,
            sampleTypes: [],
          });
        }

        if (form.entity === "sampleType") {
          const jt = next.find((x) => x.id === form.jobTypeId);
          const cat = jt?.categories.find((x) => x.id === form.categoryId);
          if (!jt || !cat) {
            showMessage("error", "Parent Job Category was not found.");
            return prev;
          }

          const duplicate = cat.sampleTypes.some((x) => x.name.toLowerCase() === trimmedName.toLowerCase());
          if (duplicate) {
            showMessage("error", "Duplicate Sample Type name under the same Job Category is not allowed.");
            return prev;
          }

          cat.sampleTypes.push({ id: newId, type: "sampleType", name: trimmedName, displayName: trimmedDisplayName, active: true });
        }
      }

      if (form.mode === "edit") {
        if (form.entity === "jobType") {
          const jt = next.find((x) => x.id === form.id);
          jt.displayName = trimmedDisplayName;
        }

        if (form.entity === "category") {
          const jt = next.find((x) => x.id === form.jobTypeId);
          const cat = jt?.categories.find((x) => x.id === form.id);

          if (!jt || !cat) {
            showMessage("error", "Job Category was not found.");
            return prev;
          }

          cat.displayName = trimmedDisplayName;
          cat.workflow = form.workflow;
        }

        if (form.entity === "sampleType") {
          const jt = next.find((x) => x.id === form.jobTypeId);
          const cat = jt?.categories.find((x) => x.id === form.categoryId);
          const st = cat?.sampleTypes.find((x) => x.id === form.id);

          if (!jt || !cat || !st) {
            showMessage("error", "Sample Type was not found.");
            return prev;
          }

          st.displayName = trimmedDisplayName;
        }
      }

      return next;
    });

    setForm(null);
    showMessage("success", "Configuration saved successfully.");
  }

  function toggleActive(entity, jobTypeId, categoryId, sampleTypeId) {
    const result = toggleActiveInData(data, entity, jobTypeId, categoryId, sampleTypeId);
    if (result.ok) setData(result.data);
    showMessage(result.ok ? "success" : "error", result.message);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <TopBar />

          <main className="flex-1 px-7 py-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">Job Types Configuration</h1>
                <div className="mt-5 flex gap-3">
                  <Button variant="primary" className="min-w-40 rounded-md bg-slate-800 px-6 shadow-sm hover:bg-slate-700">
                    <span className="text-lg leading-none">←</span> Back
                  </Button>
                  <Button onClick={() => openAdd("jobType")} className="min-w-48 rounded-md bg-slate-800 px-6 shadow-sm hover:bg-slate-700">
                    <Icon name="plus" /> Add New Job Type
                  </Button>
                </div>
              </div>

              {message && (
                <div className={`flex items-center gap-2 rounded-2xl border p-4 text-sm ${message.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                  {message.type === "error" && <Icon name="warning" />}
                  {message.text}
                </div>
              )}

              <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                  <div className="grid grid-cols-[1fr_170px_130px_190px] gap-3 border-b bg-slate-50 px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <div>Display Name</div>
                    <div>Workflow / Prefix</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {data.length === 0 && <div className="px-4 py-8 text-center text-sm text-slate-500">No configuration items found.</div>}

                  {data.map((jt) => (
                    <div key={jt.id} className="border-b last:border-b-0">
                      <div className="grid grid-cols-[1fr_170px_130px_190px] items-center gap-3 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => toggleExpand(jt.id)} className="rounded p-1 hover:bg-slate-100" aria-label="Expand or collapse">
                            {expanded.has(jt.id) ? <Icon name="down" /> : <Icon name="right" />}
                          </button>
                          <div>
                            <div className="font-semibold">{jt.displayName}</div>
                            <div className="text-xs text-slate-500">Job Type / Department</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">Prefix: {jt.prefix}</div>
                        <div className="text-sm text-slate-400">—</div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openAdd("category", jt.id)}>Add Category</Button>
                          <IconButton icon="edit" label="Edit" onClick={() => openEdit("jobType", { id: jt.id, name: jt.name, displayName: jt.displayName, prefix: jt.prefix })} />
                        </div>
                      </div>

                      {expanded.has(jt.id) && jt.categories.map((cat) => (
                        <div key={cat.id} className="border-t bg-slate-50/70">
                          <div className="grid grid-cols-[1fr_170px_130px_190px] items-center gap-3 px-4 py-3 pl-12">
                            <div>
                              <div className="font-medium">{cat.displayName}</div>
                              <div className="text-xs text-slate-500">Job Category</div>
                            </div>
                            <div className="text-sm text-slate-700">{cat.workflow}</div>
                            <div><StatusBadge active={cat.active} /></div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openAdd("sampleType", jt.id, cat.id)}>Add Sample</Button>
                              <IconButton icon="edit" label="Edit" onClick={() => openEdit("category", { id: cat.id, jobTypeId: jt.id, name: cat.name, displayName: cat.displayName, workflow: cat.workflow })} />
                              <IconButton icon="power" label={cat.active ? "Make inactive" : "Make active"} onClick={() => toggleActive("category", jt.id, cat.id)} />
                            </div>
                          </div>

                          {cat.sampleTypes.map((st) => (
                            <div key={st.id} className="grid grid-cols-[1fr_170px_130px_190px] items-center gap-3 border-t px-4 py-3 pl-20">
                              <div>
                                <div className="text-sm font-medium">{st.displayName}</div>
                                <div className="text-xs text-slate-500">Sample Type</div>
                              </div>
                              <div className="text-sm text-slate-400">—</div>
                              <div><StatusBadge active={st.active} /></div>
                              <div className="flex justify-end gap-2">
                                <IconButton icon="edit" label="Edit" onClick={() => openEdit("sampleType", { id: st.id, jobTypeId: jt.id, categoryId: cat.id, name: st.name, displayName: st.displayName })} />
                                <IconButton icon="power" label={st.active ? "Make inactive" : "Make active"} onClick={() => toggleActive("sampleType", jt.id, cat.id, st.id)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-bold text-slate-950">Business Rules</h2>
                <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <span className="font-semibold">Inactive:</span> Job Types remain available as master departments. Inactive Job Categories and Sample Types are hidden from new job creation; inactivating a category also inactivates its sample types.
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {form && (
        <Modal title={`${form.mode === "add" ? "Add" : "Edit"} ${labelFor(form.entity)}`} onClose={() => setForm(null)}>
          <div className="space-y-4">
            {form.entity === "category" && (
              <Field label="Parent Job Type">
                <select value={form.jobTypeId} disabled={form.mode === "edit"} onChange={(e) => setForm({ ...form, jobTypeId: e.target.value })} className="w-full rounded-xl border bg-white px-3 py-2 text-sm disabled:bg-slate-100">
                  {data.map((x) => <option key={x.id} value={x.id}>{x.displayName}</option>)}
                </select>
              </Field>
            )}

            {form.entity === "sampleType" && (
              <>
                <Field label="Parent Job Type">
                  <select value={form.jobTypeId} disabled className="w-full rounded-xl border bg-slate-100 px-3 py-2 text-sm">
                    {data.map((x) => <option key={x.id} value={x.id}>{x.displayName}</option>)}
                  </select>
                </Field>
                <Field label="Parent Job Category">
                  <select value={form.categoryId} disabled className="w-full rounded-xl border bg-slate-100 px-3 py-2 text-sm">
                    {data.find((x) => x.id === form.jobTypeId)?.categories.map((x) => <option key={x.id} value={x.id}>{x.displayName}</option>)}
                  </select>
                </Field>
              </>
            )}

            {form.mode === "add" ? (
              <Field label="Name" required>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-400" placeholder={`Enter ${labelFor(form.entity)} name`} />
              </Field>
            ) : (
              <div>
                <div className="mb-1.5 text-sm font-medium text-slate-700">Name</div>
                <div className="rounded-xl border bg-slate-100 px-3 py-2 text-sm text-slate-700">{form.name}</div>
              </div>
            )}

            <Field label="Display Name" required>
              <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-400" placeholder={`Enter ${labelFor(form.entity)} display name`} />
            </Field>

            {form.entity === "jobType" && (
              <Field label="Prefix" required>
                {form.mode === "add" ? (
                  <input value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value.toUpperCase().slice(0, 3) })} className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-400" placeholder="Example: M" required />
                ) : (
                  <div className="rounded-xl border bg-slate-100 px-3 py-2 text-sm text-slate-700">{form.prefix}</div>
                )}
                <div className="mt-1 text-xs text-slate-500">Prefix is mandatory when adding and read-only after creation.</div>
              </Field>
            )}

            {form.entity === "category" && (
              <Field label="Workflow" required>
                <select value={form.workflow} onChange={(e) => setForm({ ...form, workflow: e.target.value })} className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-slate-400">
                  {workflows.map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
              <Button onClick={saveForm}><Icon name="save" /> Save</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Sidebar() {
  const salesItems = ["Dashboard", "Opportunities", "Price Book", "Job Cards"];
  const setupItems = ["Sales Items", "Test Method", "Analytes", "Guidelines", "Job Types Configuration", "Coupons"];

  return (
    <aside className="w-[292px] shrink-0 border-r border-slate-200 bg-white">
      <div className="flex h-[74px] items-center border-b border-slate-100 px-5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-9 rounded-md border-2 border-slate-900"></div>
          <div className="text-3xl font-semibold tracking-tight text-slate-900">Luthen</div>
          <span className="mb-4 text-xs text-slate-500">®</span>
        </div>
      </div>

      <nav className="py-4 text-sm text-slate-700">
        <MenuGroup icon="$" label="Sales" expanded items={salesItems} />
        <MenuGroup icon="▣" label="Customers" />
        <MenuGroup icon="▥" label="Jobs" />
        <MenuGroup icon="▤" label="Sample Collection" />
        <MenuGroup icon="△" label="Testing and Reporting" />
        <MenuGroup icon="✉" label="Report Email" />

        <div className="mt-2 border-l-4 border-rose-700 bg-slate-50 py-2">
          <div className="flex items-center justify-between px-4 py-2 font-semibold text-slate-950">
            <span className="flex items-center gap-3"><span className="text-rose-700">♙</span> Setup Admin</span>
            <span className="text-slate-400">⌄</span>
          </div>
          <div className="mt-1 space-y-1 pl-9 pr-4">
            {setupItems.map((item) => (
              <div key={item} className={`rounded-lg px-3 py-2 ${item === "Job Types Configuration" ? "bg-white font-semibold text-slate-950 shadow-sm" : "text-slate-700 hover:bg-white"}`}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <MenuGroup icon="▣" label="Invoicing and Billing" />
        <MenuGroup icon="♧" label="User Management" />
        <MenuGroup icon="▤" label="Admin Reports" />
      </nav>
    </aside>
  );
}

function MenuGroup({ icon, label, expanded = false, items = [] }) {
  return (
    <div className="px-4 py-1">
      <div className="flex items-center justify-between rounded-lg px-2 py-2 text-slate-700 hover:bg-slate-50">
        <span className="flex items-center gap-3"><span className="w-4 text-slate-500">{icon}</span>{label}</span>
        <span className="text-slate-300">›</span>
      </div>
      {expanded && items.length > 0 && (
        <div className="space-y-1 pl-9">
          {items.map((item) => <div key={item} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">{item}</div>)}
        </div>
      )}
    </div>
  );
}

function TopBar() {
  return (
    <header className="flex h-[62px] items-center justify-between border-b border-slate-200 bg-white px-6">
      <button type="button" className="rounded-md p-2 text-slate-600 hover:bg-slate-100" aria-label="Toggle sidebar">☰</button>

      <div className="flex flex-1 justify-center px-8">
        <div className="flex w-full max-w-[460px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <input className="min-w-0 flex-1 px-4 py-2 text-sm outline-none" placeholder="Search anything..." />
          <button type="button" className="bg-slate-800 px-5 text-sm font-semibold text-white">Search ⌕</button>
        </div>
      </div>

      <div className="flex items-center gap-5 text-slate-600">
        <span className="text-xl">⚑</span>
        <span className="text-xl">♢</span>
        <span className="text-sm text-slate-600">Hello, IMC User</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">◉</div>
      </div>
    </header>
  );
}

function IconButton({ icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} title={label} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-white text-slate-600 hover:bg-slate-100">
      <Icon name={icon} />
    </button>
  );
}

function Field({ label, children, required = false }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </div>
      {children}
    </label>
  );
}

function labelFor(entity) {
  if (entity === "jobType") return "Job Type";
  if (entity === "category") return "Job Category";
  return "Sample Type";
}
