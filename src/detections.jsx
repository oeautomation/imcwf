import React, { useMemo, useState } from "react";

const initialManagers = [
  {
    id: 1,
    selected: true,
    name: "ABC Water Services",
    category: "Water Treatment Company",
    phoneFax: "011 234 5678",
    mobile: "077 123 4567",
    email: "ops@abcwater.com",
    notes: "Monthly treatment and flushing support.",
  },
  {
    id: 2,
    selected: false,
    name: "John Silva",
    category: "Primary Contact",
    phoneFax: "011 456 7890",
    mobile: "071 987 6543",
    email: "john.silva@example.com",
    notes: "Site contact for access coordination.",
  },
];

const categoryOptions = [
  "None",
  "Primary Contact",
  "Secondary Contact",
  "Water Treatment Company",
  "Other",
];

const emptyForm = {
  id: null,
  selected: true,
  name: "",
  category: "None",
  phoneFax: "",
  mobile: "",
  email: "",
  notes: "",
};

function validateEmail(email) {
  if (!email.trim()) return "";
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email) ? "" : "Enter a valid email address.";
}

export default function JobLocationDetectionManagersPrototype() {
  const [detectionManagers, setDetectionManagers] = useState(initialManagers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const selectedCount = useMemo(
    () => detectionManagers.filter((manager) => manager.selected).length,
    [detectionManagers]
  );

  const openAddModal = () => {
    setModalMode("add");
    setForm(emptyForm);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (manager) => {
    setModalMode("edit");
    setForm(manager);
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(emptyForm);
    setErrors({});
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
    if (field === "name" && value.trim()) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleSave = () => {
    const nextErrors = {
      name: form.name.trim() ? "" : "Detection Manager Name is required.",
      email: validateEmail(form.email),
    };

    setErrors(nextErrors);

    if (nextErrors.name || nextErrors.email) {
      return;
    }

    if (modalMode === "add") {
      const newManager = {
        ...form,
        id: Date.now(),
      };
      setDetectionManagers((prev) => [newManager, ...prev]);
    } else {
      setDetectionManagers((prev) =>
        prev.map((manager) => (manager.id === form.id ? form : manager))
      );
    }

    closeModal();
  };

  const handleSelectToggle = (id) => {
    setDetectionManagers((prev) =>
      prev.map((manager) =>
        manager.id === id ? { ...manager, selected: !manager.selected } : manager
      )
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setDetectionManagers((prev) => prev.filter((manager) => manager.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-6 text-[#111827]">
      <div className="mx-auto max-w-[1600px]">
        <h1 className="mb-4 text-[42px] font-semibold tracking-[-0.02em] text-[#0f172a]">
          Job Location Details
        </h1>

        <button className="mb-6 inline-flex h-14 items-center gap-3 rounded-2xl bg-[#334155] px-7 text-lg font-semibold text-white shadow-sm transition hover:opacity-95">
          <span className="text-2xl leading-none">←</span>
          <span>Back</span>
        </button>

        <div className="rounded-2xl border border-[#d7dbe2] bg-white shadow-sm">
          <section className="px-6 pb-10 pt-6">
            <h2 className="mb-8 text-[28px] font-semibold text-[#0f172a]">
              Basic Details
            </h2>

            <div className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-32">
              <div className="space-y-8">
                <div className="grid grid-cols-[180px_1fr] gap-x-8">
                  <div className="text-[17px] font-semibold text-black">Job Location</div>
                  <div className="text-[17px] text-black">Jill Job Location</div>
                </div>
                <div className="grid grid-cols-[180px_1fr] gap-x-8">
                  <div className="text-[17px] font-semibold text-black">Street Name</div>
                  <div className="text-[17px] text-black">Dikhenapura</div>
                </div>
                <div className="grid grid-cols-[180px_1fr] gap-x-8">
                  <div className="text-[17px] font-semibold text-black">Post Code</div>
                  <div className="text-[17px] text-black">1240</div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-[180px_1fr] gap-x-8">
                  <div className="text-[17px] font-semibold text-black">Suburb</div>
                  <div className="text-[17px] text-black">Horana</div>
                </div>
                <div className="grid grid-cols-[180px_1fr] gap-x-8">
                  <div className="text-[17px] font-semibold text-black">State</div>
                  <div className="text-[17px] text-black">NSW_SYDNEY</div>
                </div>
              </div>
            </div>
          </section>

          <div className="mx-6 border-t border-[#e5e7eb]" />

          <section className="px-6 py-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[28px] font-semibold text-[#0f172a]">
                  Detection Managers
                </h2>
                <p className="mt-1 text-sm text-[#64748b]">
                  {detectionManagers.length} total • {selectedCount} selected
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#334155] px-4 text-[15px] font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                <span className="text-[24px] font-light leading-none">+</span>
                <span>Add Detection Manager</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
              {detectionManagers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-[#f8fafc]">
                      <tr className="border-b border-[#e5e7eb] text-left">
                        <th className="px-5 py-4 text-sm font-semibold text-[#334155]">Select</th>
                        <th className="px-5 py-4 text-sm font-semibold text-[#334155]">Detection Manager Name</th>
                        <th className="px-5 py-4 text-sm font-semibold text-[#334155]">Category</th>
                        <th className="px-5 py-4 text-sm font-semibold text-[#334155]">Phone / Fax</th>
                        <th className="px-5 py-4 text-sm font-semibold text-[#334155]">Mobile</th>
                        <th className="px-5 py-4 text-sm font-semibold text-[#334155]">Email</th>
                        <th className="px-5 py-4 text-sm font-semibold text-[#334155]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detectionManagers.map((manager) => (
                        <tr
                          key={manager.id}
                          className="border-b border-[#eef2f7] last:border-b-0 hover:bg-[#fafbfd]"
                        >
                          <td className="px-5 py-4 align-middle">
                            <input
                              type="checkbox"
                              checked={manager.selected}
                              onChange={() => handleSelectToggle(manager.id)}
                              className="h-5 w-5 rounded border-[#cbd5e1] text-[#334155]"
                            />
                          </td>
                          <td className="px-5 py-4 text-[15px] text-[#0f172a]">{manager.name}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full bg-[#eff6ff] px-3 py-1 text-sm font-medium text-[#1d4ed8]">
                              {manager.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[15px] text-[#334155]">{manager.phoneFax || "—"}</td>
                          <td className="px-5 py-4 text-[15px] text-[#334155]">{manager.mobile || "—"}</td>
                          <td className="px-5 py-4 text-[15px] text-[#334155]">{manager.email || "—"}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(manager)}
                                className="rounded-xl border border-[#dbe1e8] px-3 py-2 text-sm font-medium text-[#334155] hover:bg-[#f8fafc]"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteTarget(manager)}
                                className="rounded-xl border border-[#fecaca] px-3 py-2 text-sm font-medium text-[#b91c1c] hover:bg-[#fef2f2]"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex min-h-[180px] items-center justify-center bg-[#fafafa] text-[18px] text-[#64748b]">
                  No detection managers found for this location
                </div>
              )}
            </div>
          </section>

          <div className="mx-6 border-t border-[#e5e7eb]" />

          <section className="px-6 pb-10 pt-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-[28px] font-semibold text-[#0f172a]">Job Card Details</h2>
              <button className="inline-flex h-14 items-center gap-3 rounded-2xl bg-[#334155] px-6 text-lg font-semibold text-white shadow-sm transition hover:opacity-95">
                <span className="text-[30px] font-light leading-none">+</span>
                <span>Add Job Card</span>
              </button>
            </div>

            <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-[#d7dbe2] bg-[#fafafa] text-[18px] text-[#64748b]">
              No job cards found for this location
            </div>
          </section>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
              <div>
                <h3 className="text-xl font-semibold text-[#0f172a]">
                  {modalMode === "add" ? "Add Detection Manager" : "Edit Detection Manager"}
                </h3>
                <p className="mt-1 text-sm text-[#64748b]">
                  Maintain contact details for this job location.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-xl px-3 py-2 text-lg text-[#475569] hover:bg-[#f1f5f9]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[#334155]">
                  Detection Manager Name <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#cbd5e1] px-4 text-[14px] outline-none transition focus:border-[#64748b]"
                  placeholder="Enter detection manager name"
                />
                {errors.name ? (
                  <p className="mt-2 text-sm text-[#dc2626]">{errors.name}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#334155]">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#cbd5e1] bg-white px-4 text-[14px] outline-none transition focus:border-[#64748b]"
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <label className="inline-flex items-center gap-3 rounded-xl border border-[#dbe1e8] px-4 py-[11px] text-[14px] text-[#334155]">
                  <input
                    type="checkbox"
                    checked={form.selected}
                    onChange={(e) => handleFieldChange("selected", e.target.checked)}
                    className="h-5 w-5 rounded border-[#cbd5e1]"
                  />
                  Selected for this Job Location
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#334155]">Phone / Fax</label>
                <input
                  value={form.phoneFax}
                  onChange={(e) => handleFieldChange("phoneFax", e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#cbd5e1] px-4 text-[14px] outline-none transition focus:border-[#64748b]"
                  placeholder="Enter phone or fax number"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#334155]">Mobile</label>
                <input
                  value={form.mobile}
                  onChange={(e) => handleFieldChange("mobile", e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#cbd5e1] px-4 text-[14px] outline-none transition focus:border-[#64748b]"
                  placeholder="Enter mobile number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[#334155]">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#cbd5e1] px-4 text-[14px] outline-none transition focus:border-[#64748b]"
                  placeholder="Enter email address"
                />
                {errors.email ? (
                  <p className="mt-2 text-sm text-[#dc2626]">{errors.email}</p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[#334155]">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[#cbd5e1] px-4 py-3 text-[14px] outline-none transition focus:border-[#64748b]"
                  placeholder="Enter notes"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#e5e7eb] px-5 py-4">
              <button
                onClick={closeModal}
                className="h-11 rounded-xl border border-[#cbd5e1] px-5 text-[14px] font-semibold text-[#334155] hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="h-11 rounded-xl bg-[#334155] px-5 text-[14px] font-semibold text-white hover:opacity-95"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="px-6 py-6">
              <h3 className="text-2xl font-semibold text-[#0f172a]">Delete Detection Manager</h3>
              <p className="mt-3 text-[15px] leading-7 text-[#475569]">
                Are you sure you want to delete <span className="font-semibold text-[#0f172a]">{deleteTarget.name}</span>?
                This will remove the detection manager from the job location.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-[#e5e7eb] px-6 py-5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="h-12 rounded-xl border border-[#cbd5e1] px-5 text-[15px] font-semibold text-[#334155] hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="h-12 rounded-xl bg-[#b91c1c] px-5 text-[15px] font-semibold text-white hover:opacity-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
