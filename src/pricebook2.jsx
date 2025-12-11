import React, { useMemo, useState, useEffect } from "react";

/**
 * Price Book + Sales Item Prototype (single-file JSX)
 * - TailwindCSS classes for styling (no external UI libs)
 * - Itemised (Standard/Custom) and Bulk price books
 * - Sales Item has MULTIPLE price points (status + effective dates)
 * - New (per requirements):
 *   1) BLOCK overlapping price point date ranges for the same Sales Item in a book
 *   2) Sort price points by Effective From (DESC) within each Sales Item
 *   3) Toggle to include/exclude Inactive price points (default: hide Inactive)
 *   4) Sales Item filter with simple autocomplete
 *   5) Client-side pagination for (potentially) 100s of price points
 */

// --- Small helpers ---
const currency = (n) => (n === "" || n === null || n === undefined ? "—" : Number(n).toFixed(2));
const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);

function parseISO(d) {
  if (!d) return null; // open-ended
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : new Date(t);
}

function rangesOverlap(aFrom, aTo, bFrom, bTo) {
  // null = open-ended. Overlap if ranges intersect at all.
  const aF = parseISO(aFrom);
  const aT = parseISO(aTo);
  const bF = parseISO(bFrom);
  const bT = parseISO(bTo);
  const start = aF && bF ? Math.max(aF.getTime(), bF.getTime()) : (aF ? aF.getTime() : (bF ? bF.getTime() : -Infinity));
  const endA = aT ? aT.getTime() : Infinity;
  const endB = bT ? bT.getTime() : Infinity;
  const end = Math.min(endA, endB);
  return start <= end; // overlaps or touches
}

// Demo catalog of products
const demoProducts = [
  { id: "P-SPC", name: "SPC - Standard Plate Count", supportsRetest: true },
  { id: "P-YM", name: "YM - Yeast & Mould", supportsRetest: true },
  { id: "P-Misc", name: "Consulting Hour", supportsRetest: false },
  { id: "P-Project", name: "Project Cost", supportsRetest: false },
];

// Seed price books
const seedPriceBooks = [
  {
    id: "PB-STD-ITEM",
    name: "Standard Itemised",
    type: "Itemised",
    isCustom: false,
    status: "Active",
    items: [
      {
        id: uid(),
        productId: "P-SPC",
        productName: "SPC - Standard Plate Count",
        pricePoints: [
          {
            id: uid(),
            status: "Active",
            standardPrice: 45.0,
            applicablePrice: 45.0,
            standardRetestPrice: 30.0,
            applicableRetestPrice: 30.0,
            effectiveFrom: "2025-01-01",
            effectiveTo: "",
          },
          {
            id: uid(),
            status: "Inactive",
            standardPrice: 40.0,
            applicablePrice: 40.0,
            standardRetestPrice: 25.0,
            applicableRetestPrice: 25.0,
            effectiveFrom: "2024-01-01",
            effectiveTo: "2024-12-31",
          },
        ],
      },
      {
        id: uid(),
        productId: "P-YM",
        productName: "YM - Yeast & Mould",
        pricePoints: [
          {
            id: uid(),
            status: "Active",
            standardPrice: 55.0,
            applicablePrice: 55.0,
            standardRetestPrice: 35.0,
            applicableRetestPrice: 35.0,
            effectiveFrom: "2025-04-01",
            effectiveTo: "",
          },
        ],
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

// --- Pure helpers for catalog ---
function latestPricePoint(item) {
  if (!item?.pricePoints?.length) return null;
  return [...item.pricePoints].sort((a, b) => (a.effectiveFrom > b.effectiveFrom ? -1 : 1))[0];
}

function buildStandardCatalog(standardItemisedBooks) {
  const map = new Map();
  for (const b of standardItemisedBooks) {
    for (const it of b.items || []) {
      if (!map.has(it.productId)) {
        const latest = latestPricePoint(it);
        map.set(it.productId, {
          productId: it.productId,
          productName: it.productName,
          standardPrice: latest?.standardPrice ?? null,
          standardRetestPrice: latest?.standardRetestPrice ?? null,
        });
      }
    }
  }
  return Array.from(map.values());
}

export default function PriceBookPrototype() {
  const [priceBooks, setPriceBooks] = useState(seedPriceBooks);
  const [activeBookId, setActiveBookId] = useState(priceBooks[0].id);
  const activeBook = useMemo(
    () => priceBooks.find((b) => b.id === activeBookId) || priceBooks[0],
    [priceBooks, activeBookId]
  );

  // Derived context
  const isItemised = activeBook.type === "Itemised";
  const isCustomItemised = isItemised && activeBook.isCustom;
  const isStandardItemised = isItemised && !activeBook.isCustom;
  const isBulk = activeBook.type === "Bulk";

  const standardItemisedBooks = useMemo(
    () => priceBooks.filter((b) => b.type === "Itemised" && !b.isCustom),
    [priceBooks]
  );
  const standardCatalog = useMemo(() => buildStandardCatalog(standardItemisedBooks), [standardItemisedBooks]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    status: "Active",
    effectiveFrom: todayISO(),
    effectiveTo: "",
    productId: "",
    standardPrice: "",
    applicablePrice: "",
    standardRetestPrice: "",
    applicableRetestPrice: "",
    copyToCustomBooks: [],
  });

  // List controls: toggle, filter, pagination
  const [showInactive, setShowInactive] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [filterProductId, setFilterProductId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAuto, setShowAuto] = useState(false);

  useEffect(() => {
    if (showModal) resetFormForContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, activeBookId]);

  useEffect(() => {
    // Reset pagination when filters change
    setPage(1);
  }, [showInactive, filterText, filterProductId, activeBookId]);

  function resetFormForContext() {
    setErrorMsg("");
    if (isStandardItemised || isBulk) {
      setForm({
        status: "Active",
        effectiveFrom: todayISO(),
        effectiveTo: "",
        productId: demoProducts[0].id,
        standardPrice: "",
        applicablePrice: "",
        standardRetestPrice: "",
        applicableRetestPrice: "",
        copyToCustomBooks: [],
      });
    } else if (isCustomItemised) {
      const def = standardCatalog[0];
      setForm({
        status: "Active",
        effectiveFrom: todayISO(),
        effectiveTo: "",
        productId: def?.productId || "",
        standardPrice: def?.standardPrice ?? "",
        applicablePrice: def?.standardPrice ?? "",
        standardRetestPrice: def?.standardRetestPrice ?? "",
        applicableRetestPrice: def?.standardRetestPrice ?? "",
        copyToCustomBooks: [],
      });
    }
  }

  const customItemisedBooks = useMemo(
    () => priceBooks.filter((b) => b.type === "Itemised" && b.isCustom),
    [priceBooks]
  );

  function addPricePointToBook(targetBookId, baseItem, pricePoint) {
    setPriceBooks((prev) =>
      prev.map((b) => {
        if (b.id !== targetBookId) return b;
        const bookClone = { ...b, items: b.items.map((i) => ({ ...i, pricePoints: [...(i.pricePoints || [])] })) };
        const existing = bookClone.items.find((i) => i.productId === baseItem.productId);
        if (existing) {
          existing.pricePoints = [...existing.pricePoints, { id: uid(), ...pricePoint }];
        } else {
          bookClone.items = [
            ...bookClone.items,
            {
              id: uid(),
              productId: baseItem.productId,
              productName: baseItem.productName,
              pricePoints: [{ id: uid(), ...pricePoint }],
            },
          ];
        }
        return bookClone;
      })
    );
  }

  function handleProductChangeCustom(productId) {
    setForm((prev) => {
      const std = standardCatalog.find((p) => p.productId === productId);
      return {
        ...prev,
        productId,
        standardPrice: std?.standardPrice ?? "",
        standardRetestPrice: std?.standardRetestPrice ?? "",
        applicablePrice: std?.standardPrice ?? "",
        applicableRetestPrice: std?.standardRetestPrice ?? "",
      };
    });
  }

  function blockOverlaps(bookId, productId, newFrom, newTo) {
    const book = priceBooks.find((b) => b.id === bookId);
    if (!book) return false;
    const item = (book.items || []).find((i) => i.productId === productId);
    if (!item) return false;
    const pts = item.pricePoints || [];
    for (const p of pts) {
      if (rangesOverlap(p.effectiveFrom, p.effectiveTo, newFrom, newTo)) {
        return true; // overlap found
      }
    }
    return false;
  }

  function handleSave() {
    setErrorMsg("");
    if (!form.productId) return;

    const isCustom = isCustomItemised;
    const selectedDemo = demoProducts.find((x) => x.id === form.productId);
    const stdFromCatalog = standardCatalog.find((p) => p.productId === form.productId);

    const productId = form.productId;
    const productName = isCustom ? stdFromCatalog?.productName || "" : selectedDemo?.name || "";

    // OVERLAP GUARD
    if (blockOverlaps(activeBookId, productId, form.effectiveFrom, form.effectiveTo)) {
      setErrorMsg("Effective dates overlap an existing price point for this Sales Item in this price book. Please adjust the range.");
      return;
    }

    const pricePoint = {
      status: form.status,
      standardPrice: isCustom ? Number(stdFromCatalog?.standardPrice ?? 0) : form.standardPrice === "" ? null : Number(form.standardPrice),
      applicablePrice: form.applicablePrice === "" ? null : Number(form.applicablePrice),
      standardRetestPrice: isItemised
        ? (isCustom ? Number(stdFromCatalog?.standardRetestPrice ?? 0) : form.standardRetestPrice === "" ? null : Number(form.standardRetestPrice))
        : null,
      applicableRetestPrice: isItemised ? (form.applicableRetestPrice === "" ? null : Number(form.applicableRetestPrice)) : null,
      effectiveFrom: form.effectiveFrom || todayISO(),
      effectiveTo: form.effectiveTo || "",
    };

    const baseItem = { productId, productName };
    addPricePointToBook(activeBookId, baseItem, pricePoint);

    if (isStandardItemised && form.copyToCustomBooks?.length) {
      form.copyToCustomBooks.forEach((copyId) => {
        addPricePointToBook(copyId, baseItem, { ...pricePoint });
      });
    }

    setShowModal(false);
  }

  // ---- Listing (filter + sort + paginate) ----
  const allRows = useMemo(() => {
    // Flatten rows with sort by Effective From DESC within item
    const rows = [];
    for (const it of activeBook.items || []) {
      const points = [...(it.pricePoints || [])].sort((a, b) => (a.effectiveFrom > b.effectiveFrom ? -1 : 1));
      for (const pp of points) {
        rows.push({
          productId: it.productId,
          productName: it.productName,
          pp,
        });
      }
    }
    return rows;
  }, [activeBook]);

  const filteredRows = useMemo(() => {
    return allRows.filter(({ productId, productName, pp }) => {
      if (!showInactive && pp.status !== "Active") return false;
      if (filterProductId && productId !== filterProductId) return false;
      if (filterText && !productName.toLowerCase().includes(filterText.toLowerCase())) return false;
      return true;
    });
  }, [allRows, showInactive, filterProductId, filterText]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  // Autocomplete list (from active book items)
  const autoOptions = useMemo(() => {
    const opts = (activeBook.items || []).map((i) => ({ id: i.productId, name: i.productName }));
    return opts.filter((o) => !filterText || o.name.toLowerCase().includes(filterText.toLowerCase()));
  }, [activeBook.items, filterText]);

  function selectAutoOption(opt) {
    setFilterProductId(opt.id);
    setFilterText(opt.name);
    setShowAuto(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Price Books</h1>
            <p className="text-sm text-gray-600">Ex GST pricing • Effective dating • Multiple price points per Sales Item</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-2xl border px-4 py-2 text-sm font-medium shadow-sm hover:shadow disabled:opacity-50"
              onClick={() => setShowModal(true)}
              disabled={isItemised && isCustomItemised && standardCatalog.length === 0}
              title={isCustomItemised && standardCatalog.length === 0 ? "No items in Standard to copy" : "Add Price Point"}
            >
              + Add Price Point
            </button>
          </div>
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
                        <div className="text-xs text-gray-500">{b.type} {b.isCustom ? "• Custom" : "• Standard"} • {b.status}</div>
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
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{activeBook.name}</h2>
                  <p className="text-xs text-gray-500">{activeBook.type} {activeBook.isCustom ? "• Custom" : "• Standard"} • Status: {activeBook.status}</p>
                </div>

                {/* Toolbar: filter + toggle + pagination size */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <input
                      className="w-64 rounded-xl border px-3 py-2 text-sm"
                      placeholder="Filter by Sales Item..."
                      value={filterText}
                      onChange={(e) => {
                        setFilterText(e.target.value);
                        setShowAuto(true);
                        setFilterProductId("");
                      }}
                      onFocus={() => setShowAuto(true)}
                    />
                    {showAuto && autoOptions.length > 0 && (
                      <div className="absolute z-10 mt-1 max-h-56 w-64 overflow-auto rounded-xl border bg-white shadow">
                        {autoOptions.map((opt) => (
                          <div
                            key={opt.id}
                            className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => selectAutoOption(opt)}
                          >
                            {opt.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                    />
                    <span>Show inactive</span>
                  </label>

                  <label className="text-xs text-gray-600">
                    Page size
                    <select
                      className="ml-2 rounded-lg border px-2 py-1 text-xs"
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                      {[10, 20, 50, 100].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {/* Items + price points table (flattened + paginated) */}
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
                    {pageRows.length === 0 && (
                      <tr>
                        <td colSpan={isItemised ? 8 : 6} className="px-3 py-6 text-center text-gray-500">
                          No matching price points.
                        </td>
                      </tr>
                    )}
                    {pageRows.map((row, idx) => (
                      <tr key={`${row.productId}-${row.pp.id}-${idx}`} className="align-top">
                        <td className="px-3 py-2">
                          <div className="font-medium">{row.productName}</div>
                          <div className="text-xs text-gray-500">ID: {row.productId}</div>
                        </td>
                        <td className="px-3 py-2">{row.pp.status}</td>
                        <td className="px-3 py-2">${currency(row.pp.standardPrice)}</td>
                        <td className="px-3 py-2">${currency(row.pp.applicablePrice)}</td>
                        {isItemised && (
                          <>
                            <td className="px-3 py-2">${currency(row.pp.standardRetestPrice)}</td>
                            <td className="px-3 py-2">${currency(row.pp.applicableRetestPrice)}</td>
                          </>
                        )}
                        <td className="px-3 py-2">{row.pp.effectiveFrom || "—"}</td>
                        <td className="px-3 py-2">{row.pp.effectiveTo || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  Page {page} of {totalPages} • {filteredRows.length} price point{filteredRows.length === 1 ? "" : "s"}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border px-3 py-1 disabled:opacity-50"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >« First</button>
                  <button
                    className="rounded-lg border px-3 py-1 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >‹ Prev</button>
                  <button
                    className="rounded-lg border px-3 py-1 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >Next ›</button>
                  <button
                    className="rounded-lg border px-3 py-1 disabled:opacity-50"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                  >Last »</button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />

          <div className="relative z-10 w-full max-w-2xl rounded-2xl border bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{isCustomItemised ? "Copy Price Point from Standard" : "Add Price Point"}</h3>
              <button className="rounded-xl border px-3 py-1 text-xs hover:bg-gray-50" onClick={() => setShowModal(false)}>Close</button>
            </div>

            {errorMsg && (
              <div className="mb-3 rounded-xl border border-red-300 bg-red-50 p-2 text-xs text-red-700">{errorMsg}</div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Product selector */}
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
                        <option key={p.productId} value={p.productId}>{p.productName}</option>
                      ))
                    : demoProducts.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
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

              {/* Retest fields only for Itemised */}
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
                <div className="mb-2 text-sm font-medium">Copy this price point into Custom Price Books</div>
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
              <button className="rounded-2xl border px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
                onClick={handleSave}
                disabled={isCustomItemised && !form.productId}
                title={isCustomItemised && !form.productId ? "Select an item from Standard" : "Save Price Point"}
              >
                Save Price Point
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Runtime tests (console-based) for helpers and invariants.
 */
(function runtimeTests() {
  try {
    // De-dup + latest price selection
    const stdBooks = [
      { type: "Itemised", isCustom: false, items: [ { productId: "A", productName: "A1", pricePoints: [ { standardPrice: 1, standardRetestPrice: 0, effectiveFrom: "2024-01-01" } ] }, { productId: "B", productName: "B1", pricePoints: [ { standardPrice: 2, standardRetestPrice: 0, effectiveFrom: "2024-01-01" } ] } ] },
      { type: "Itemised", isCustom: false, items: [ { productId: "A", productName: "A1dup", pricePoints: [ { standardPrice: 3, standardRetestPrice: 0, effectiveFrom: "2024-02-01" } ] } ] },
    ];
    const cat = buildStandardCatalog(stdBooks);
    console.assert(Array.isArray(cat), "Catalog array");
    console.assert(cat.length === 2, "Unique productIds");
    const a = cat.find((x) => x.productId === "A");
    console.assert(a && a.standardPrice === 3, "Latest price used for A");

    // Overlap checker
    console.assert(rangesOverlap("2024-01-01", "2024-03-31", "2024-03-01", "2024-04-01") === true, "Overlaps");
    console.assert(rangesOverlap("2024-01-01", "2024-01-31", "2024-02-01", "2024-02-28") === false, "No overlap");
    console.assert(rangesOverlap("2024-01-01", "", "2024-06-01", "2024-06-30") === true, "Open-ended overlaps");

    // Currency
    console.assert(currency(12.3) === "12.30", "currency 2dp");
    console.assert(currency(null) === "—", "currency null dash");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Runtime tests failed:", err);
  }
})();
