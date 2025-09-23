import React, { useMemo, useState, useEffect } from "react";

/**
 * Price Book + Sales Item Prototype (single-file React component)
 * - TailwindCSS classes for styling
 * - No external UI libs
 * - Supports Itemised (Standard/Custom) and Bulk price books
 * - Add Sales Item via popup
 * - Rules per spec:
 *   - MANY itemised price books can exist.
 *   - You CANNOT add a brand-new product directly to a CUSTOM itemised price book.
 *     Instead you COPY from the STANDARD itemised price book.
 *   - In a CUSTOM itemised price book, the Product dropdown lists ONLY items
 *     that already exist in the Standard Itemised book(s).
 *   - When copying to a CUSTOM book, Standard and Retest-Standard prices are
 *     auto-copied from Standard and are READ-ONLY in the modal.
 */

// --- Small helpers ---
const currency = (n) => (n === "" || n === null || n === undefined ? "—" : Number(n).toFixed(2));
const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);

// Demo catalog of products (in a real app these come from backend)
const demoProducts = [
  { id: "P-SPC", name: "SPC - Standard Plate Count", supportsRetest: true },
  { id: "P-YM", name: "YM - Yeast & Mould", supportsRetest: true },
  { id: "P-Misc", name: "Consulting Hour", supportsRetest: false },
];

// Seed price books (one standard itemised, one custom itemised, one bulk)
const seedPriceBooks = [
  {
    id: "PB-STD-ITEM",
    name: "Standard Itemised",
    type: "Itemised", // Itemised | Bulk
    isCustom: false,
    status: "Active",
    items: [
      {
        id: uid(),
        productId: "P-SPC",
        productName: "SPC - Standard Plate Count",
        status: "Active",
        standardPrice: 45.0,
        applicablePrice: 45.0,
        standardRetestPrice: 30.0,
        applicableRetestPrice: 30.0,
        effectiveFrom: todayISO(),
        effectiveTo: "",
      },
      {
        id: uid(),
        productId: "P-YM",
        productName: "YM - Yeast & Mould",
        status: "Active",
        standardPrice: 55.0,
        applicablePrice: 55.0,
        standardRetestPrice: 35.0,
        applicableRetestPrice: 35.0,
        effectiveFrom: todayISO(),
        effectiveTo: "",
      },
    ],
  },
  {
    id: "PB-CUST-ITEM-ACME",
    name: "Custom Itemised - ACME Foods",
    type: "Itemised",
    isCustom: true,
    status: "Active",
    items: [],
  },
  {
    id: "PB-BULK",
    name: "Standard Bulk (Projects)",
    type: "Bulk",
    isCustom: false,
    status: "Active",
    items: [],
  },
];

export default function PriceBookPrototype() {
  const [priceBooks, setPriceBooks] = useState(seedPriceBooks);
  const [activeBookId, setActiveBookId] = useState(priceBooks[0].id);
  const activeBook = useMemo(
    () => priceBooks.find((b) => b.id === activeBookId) || priceBooks[0],
    [priceBooks, activeBookId]
  );

  // Derived: standard vs custom itemised context
  const isItemised = activeBook.type === "Itemised";
  const isCustomItemised = isItemised && activeBook.isCustom;
  const isStandardItemised = isItemised && !activeBook.isCustom;

  // All standard itemised books (there can be many)
  const standardItemisedBooks = useMemo(
    () => priceBooks.filter((b) => b.type === "Itemised" && !b.isCustom),
    [priceBooks]
  );

  // Catalog from Standard Itemised entries (union by productId)
  const standardCatalog = useMemo(() => {
    const map = new Map();
    for (const b of standardItemisedBooks) {
      for (const it of b.items) {
        if (!map.has(it.productId)) {
          map.set(it.productId, {
            productId: it.productId,
            productName: it.productName,
            standardPrice: it.standardPrice ?? null,
            standardRetestPrice: it.standardRetestPrice ?? null,
          });
        }
      }
    }
    return Array.from(map.values());
  }, [standardItemisedBooks]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    status: "Active",
    standardPrice: "",
    applicablePrice: "",
    standardRetestPrice: "",
    applicableRetestPrice: "",
    effectiveFrom: todayISO(),
    effectiveTo: "",
    copyToCustomBooks: [], // only when adding to Standard Itemised
  });

  // When opening modal, default product depends on context
  function resetFormForContext() {
    if (isStandardItemised) {
      setForm({
        productId: demoProducts[0].id,
        status: "Active",
        standardPrice: "",
        applicablePrice: "",
        standardRetestPrice: "",
        applicableRetestPrice: "",
        effectiveFrom: todayISO(),
        effectiveTo: "",
        copyToCustomBooks: [],
      });
    } else if (isCustomItemised) {
      const defaultStd = standardCatalog[0];
      setForm({
        productId: defaultStd?.productId || "",
        status: "Active",
        standardPrice: defaultStd?.standardPrice ?? "",
        applicablePrice: defaultStd?.standardPrice ?? "",
        standardRetestPrice: defaultStd?.standardRetestPrice ?? "",
        applicableRetestPrice: defaultStd?.standardRetestPrice ?? "",
        effectiveFrom: todayISO(),
        effectiveTo: "",
        copyToCustomBooks: [],
      });
    } else {
      // Bulk: treat similar to standard add, but without retest fields being relevant
      setForm({
        productId: demoProducts[0].id,
        status: "Active",
        standardPrice: "",
        applicablePrice: "",
        standardRetestPrice: "",
        applicableRetestPrice: "",
        effectiveFrom: todayISO(),
        effectiveTo: "",
        copyToCustomBooks: [],
      });
    }
  }

  useEffect(() => {
    if (showModal) resetFormForContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, activeBookId]);

  const selectedProduct = useMemo(() => {
    if (isCustomItemised) {
      // find from standard catalog (already in standard)
      return standardCatalog.find((p) => p.productId === form.productId) || null;
    }
    // else choose from demo products
    return demoProducts.find((p) => p.id === form.productId) || null;
  }, [form.productId, isCustomItemised, standardCatalog]);

  const customItemisedBooks = useMemo(
    () => priceBooks.filter((b) => b.type === "Itemised" && b.isCustom),
    [priceBooks]
  );

  function addItemToBook(targetBookId, itemPayload) {
    setPriceBooks((prev) =>
      prev.map((b) => (b.id === targetBookId ? { ...b, items: [...b.items, itemPayload] } : b))
    );
  }

  function handleProductChangeCustom(productId) {
    setForm((prev) => {
      const std = standardCatalog.find((p) => p.productId === productId);
      return {
        ...prev,
        productId,
        // Copy standard & retest standard; keep read-only in UI
        standardPrice: std?.standardPrice ?? "",
        standardRetestPrice: std?.standardRetestPrice ?? "",
        // Default applicable(s) to the standard(s) but editable
        applicablePrice: std?.standardPrice ?? "",
        applicableRetestPrice: std?.standardRetestPrice ?? "",
      };
    });
  }

  function handleSave() {
    if (!form.productId) return;

    // Build base item
    const baseItem = {
      id: uid(),
      productId: form.productId,
      productName: isCustomItemised
        ? standardCatalog.find((x) => x.productId === form.productId)?.productName || ""
        : demoProducts.find((x) => x.id === form.productId)?.name || "",
      status: form.status,
      standardPrice:
        isCustomItemised
          ? // enforce copy from standard for custom
            Number(standardCatalog.find((p) => p.productId === form.productId)?.standardPrice ?? 0)
          : form.standardPrice === "" ? null : Number(form.standardPrice),
      applicablePrice: form.applicablePrice === "" ? null : Number(form.applicablePrice),
      standardRetestPrice:
        isItemised
          ? (isCustomItemised
              ? Number(
                  standardCatalog.find((p) => p.productId === form.productId)?.standardRetestPrice ?? 0
                )
              : form.standardRetestPrice === "" ? null : Number(form.standardRetestPrice))
          : null,
      applicableRetestPrice:
        isItemised
          ? form.applicableRetestPrice === "" ? null : Number(form.applicableRetestPrice)
          : null,
      effectiveFrom: form.effectiveFrom || todayISO(),
      effectiveTo: form.effectiveTo || "",
    };

    // Always add to the currently active price book
    addItemToBook(activeBookId, baseItem);

    // If adding into Standard Itemised and user selected custom books, copy there as well
    if (isStandardItemised && form.copyToCustomBooks?.length) {
      form.copyToCustomBooks.forEach((copyId) => {
        const clone = { ...baseItem, id: uid() };
        addItemToBook(copyId, clone);
      });
    }

    setShowModal(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Price Books</h1>
            <p className="text-sm text-gray-600">
              Prices are Ex GST. Effective dating supported. Retest price optional for test-type items.
            </p>
          </div>
          <button
            className="rounded-2xl border px-4 py-2 text-sm font-medium shadow-sm hover:shadow disabled:opacity-50"
            onClick={() => setShowModal(true)}
            disabled={isItemised && isCustomItemised && standardCatalog.length === 0}
            title={isCustomItemised && standardCatalog.length === 0 ? "No items in Standard to copy" : "Add Sales Item"}
          >
            + Add Sales Item
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Left: Price book list */}
          <aside className="md:col-span-4">
            <div className="rounded-2xl border bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-base font-semibold">Books</h2>
              </div>
              <ul className="divide-y">
                {priceBooks.map((b) => (
                  <li
                    key={b.id}
                    className={`cursor-pointer px-3 py-3 hover:bg-gray-50 ${activeBookId === b.id ? "bg-gray-100 rounded-xl" : ""}`}
                    onClick={() => setActiveBookId(b.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{b.name}</div>
                        <div className="text-xs text-gray-500">
                          {b.type} {b.isCustom ? "• Custom" : "• Standard"} • {b.status}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500">{b.items.length} items</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right: Active book details */}
          <main className="md:col-span-8">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{activeBook.name}</h2>
                <p className="text-xs text-gray-500">
                  {activeBook.type} {activeBook.isCustom ? "• Custom" : "• Standard"} • Status: {activeBook.status}
                </p>
              </div>

              {/* Items table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="px-3 py-2">Sales Item</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Standard (Ex GST)</th>
                      <th className="px-3 py-2">Applicable</th>
                      {isItemised && (
                        <>
                          <th className="px-3 py-2">Retest Std</th>
                          <th className="px-3 py-2">Retest Appl.</th>
                        </>
                      )}
                      <th className="px-3 py-2">Effective From</th>
                      <th className="px-3 py-2">Effective To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activeBook.items.length === 0 && (
                      <tr>
                        <td colSpan={isItemised ? 8 : 6} className="px-3 py-6 text-center text-gray-500">
                          No sales items yet. Click <span className="font-medium">+ Add Sales Item</span>.
                        </td>
                      </tr>
                    )}
                    {activeBook.items.map((it) => (
                      <tr key={it.id} className="align-top">
                        <td className="px-3 py-2">
                          <div className="font-medium">{it.productName}</div>
                          <div className="text-xs text-gray-500">ID: {it.productId}</div>
                        </td>
                        <td className="px-3 py-2">{it.status}</td>
                        <td className="px-3 py-2">${currency(it.standardPrice)}</td>
                        <td className="px-3 py-2">${currency(it.applicablePrice)}</td>
                        {isItemised && (
                          <>
                            <td className="px-3 py-2">${currency(it.standardRetestPrice)}</td>
                            <td className="px-3 py-2">${currency(it.applicableRetestPrice)}</td>
                          </>
                        )}
                        <td className="px-3 py-2">{it.effectiveFrom || "—"}</td>
                        <td className="px-3 py-2">{it.effectiveTo || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />

          <div className="relative z-10 w-full max-w-2xl rounded-2xl border bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{isCustomItemised ? "Copy Sales Item from Standard" : "Add Sales Item"}</h3>
              <button className="rounded-xl border px-3 py-1 text-xs hover:bg-gray-50" onClick={() => setShowModal(false)}>Close</button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Product */}
              <label className="text-sm">
                <span className="mb-1 block text-gray-700">{isCustomItemised ? "Sales Item (from Standard)" : "Product"}</span>
                <select
                  className="w-full rounded-xl border px-3 py-2"
                  value={form.productId}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isCustomItemised) handleProductChangeCustom(val);
                    else setForm({ ...form, productId: val });
                  }}
                >
                  {isCustomItemised
                    ? standardCatalog.map((p) => (
                        <option key={p.productId} value={p.productId}>
                          {p.productName}
                        </option>
                      ))
                    : demoProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                </select>
              </label>

              {/* Status */}
              <label className="text-sm">
                <span className="mb-1 block text-gray-700">Status</span>
                <select
                  className="w-full rounded-xl border px-3 py-2"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>

              {/* Pricing */}
              <label className="text-sm">
                <span className="mb-1 block text-gray-700">Standard Price (Ex GST)</span>
                <input
                  type="number"
                  className={`w-full rounded-xl border px-3 py-2 ${isCustomItemised ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder={isCustomItemised ? "Copied from Standard" : "e.g., 45.00"}
                  value={form.standardPrice}
                  onChange={(e) => !isCustomItemised && setForm({ ...form, standardPrice: e.target.value })}
                  readOnly={isCustomItemised}
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-gray-700">Applicable Price</span>
                <input
                  type="number"
                  className="w-full rounded-xl border px-3 py-2"
                  placeholder="defaults to Standard"
                  value={form.applicablePrice}
                  onChange={(e) => setForm({ ...form, applicablePrice: e.target.value })}
                />
              </label>

              {isItemised && (
                <>
                  <label className="text-sm">
                    <span className="mb-1 block text-gray-700">Standard Retest Price</span>
                    <input
                      type="number"
                      className={`w-full rounded-xl border px-3 py-2 ${isCustomItemised ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      placeholder={isCustomItemised ? "Copied from Standard" : "e.g., 30.00"}
                      value={form.standardRetestPrice}
                      onChange={(e) => !isCustomItemised && setForm({ ...form, standardRetestPrice: e.target.value })}
                      readOnly={isCustomItemised}
                    />
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block text-gray-700">Applicable Retest Price</span>
                    <input
                      type="number"
                      className="w-full rounded-xl border px-3 py-2"
                      placeholder="defaults to Retest Std"
                      value={form.applicableRetestPrice}
                      onChange={(e) => setForm({ ...form, applicableRetestPrice: e.target.value })}
                    />
                  </label>
                </>
              )}

              {/* Effective dates */}
              <label className="text-sm">
                <span className="mb-1 block text-gray-700">Effective From</span>
                <input
                  type="date"
                  className="w-full rounded-xl border px-3 py-2"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-gray-700">Effective To (optional)</span>
                <input
                  type="date"
                  className="w-full rounded-xl border px-3 py-2"
                  value={form.effectiveTo}
                  onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
                />
              </label>
            </div>

            {/* Copy to custom pricebooks (ONLY when adding into Standard Itemised) */}
            {isStandardItemised && customItemisedBooks.length > 0 && (
              <div className="mt-4 rounded-xl border bg-gray-50 p-3">
                <div className="mb-2 text-sm font-medium">Copy this item into Custom Price Books</div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {customItemisedBooks.map((b) => (
                    <label key={b.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={form.copyToCustomBooks.includes(b.id)}
                        onChange={(e) => {
                          const next = new Set(form.copyToCustomBooks);
                          if (e.target.checked) next.add(b.id);
                          else next.delete(b.id);
                          setForm({ ...form, copyToCustomBooks: [...next] });
                        }}
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                className="rounded-2xl border px-4 py-2 text-sm hover:bg-gray-50"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
                onClick={handleSave}
                disabled={isCustomItemised && !form.productId}
                title={isCustomItemised && !form.productId ? "Select an item from Standard" : "Save Item"}
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
