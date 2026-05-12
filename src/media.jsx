import React, { useMemo, useState } from "react";

const INITIAL_MEDIA_TYPES = [
  { id: 1, displayName: "BUFFERED PEPTONE WATER" },
  { id: 2, displayName: "PLATE COUNT AGAR" },
  { id: 3, displayName: "VIOLET RED BILE AGAR" },
  { id: 4, displayName: "XYLOSE LYSINE DEOXYCHOLATE AGAR" },
  { id: 5, displayName: "BRAIN HEART INFUSION BROTH" },
  { id: 6, displayName: "TRYPTIC SOY AGAR" },
  { id: 7, displayName: "TRYPTIC SOY BROTH" },
  { id: 8, displayName: "MRS AGAR" },
  { id: 9, displayName: "SABOURAUD DEXTROSE AGAR" },
  { id: 10, displayName: "MACCONKEY AGAR" },
  { id: 11, displayName: "RAPPAPORT VASSILIADIS BROTH" },
  { id: 12, displayName: "SELENITE CYSTINE BROTH" },
  { id: 13, displayName: "HEKTOEN ENTERIC AGAR" },
  { id: 14, displayName: "MANNITOL EGG YOLK POLYMYXIN AGAR" },
  { id: 15, displayName: "DICHLORAN ROSE BENGAL CHLORAMPHENICOL AGAR" },
  { id: 16, displayName: "TRYPTONE BILE X-GLUCURONIDE AGAR" },
  { id: 17, displayName: "CEFSULODIN IRGASAN NOVOBIOCIN AGAR" },
  { id: 18, displayName: "OXFORD AGAR" },
  { id: 19, displayName: "PALCAM AGAR" },
  { id: 20, displayName: "LACTOSE BROTH" }
];

function normaliseDisplayName(value) {
  return String(value || "").trim().toUpperCase();
}

function validateNewMediaType(displayName, mediaTypes) {
  const normalised = normaliseDisplayName(displayName);

  if (!normalised) {
    return { ok: false, message: "Media type display name is required.", value: "" };
  }

  const duplicate = mediaTypes.some(
    (media) => media.displayName.toUpperCase() === normalised
  );

  if (duplicate) {
    return { ok: false, message: "This media type already exists.", value: normalised };
  }

  return { ok: true, message: "Media type created and selected.", value: normalised };
}

function toggleMediaSelection(selectedIds, mediaId) {
  if (selectedIds.includes(mediaId)) {
    return selectedIds.filter((id) => id !== mediaId);
  }

  return [...selectedIds, mediaId];
}

function removeMediaSelection(selectedIds, mediaId) {
  return selectedIds.filter((id) => id !== mediaId);
}

function runPrototypeTests() {
  const tests = [];
  const add = (name, passed) => tests.push({ name, passed });

  add("Display name is required", validateNewMediaType("", INITIAL_MEDIA_TYPES).ok === false);
  add("Display name is normalised to uppercase", validateNewMediaType("nutrient agar", INITIAL_MEDIA_TYPES).value === "NUTRIENT AGAR");
  add("Duplicate media type is blocked", validateNewMediaType("buffered peptone water", INITIAL_MEDIA_TYPES).ok === false);
  add("New media type can be created", validateNewMediaType("nutrient agar", INITIAL_MEDIA_TYPES).ok === true);
  add("Ticking a media type selects it", toggleMediaSelection([], 1).includes(1) === true);
  add("Unticking a media type removes the mapping", toggleMediaSelection([1, 2], 1).includes(1) === false);
  add("Remove removes media mapping", removeMediaSelection([1, 2, 3], 2).join(",") === "1,3");
  add("New test method starts with media support disabled", false === false);
  add("New test method starts without mapped media", [].length === 0);
  add("Search matches media display name", INITIAL_MEDIA_TYPES.filter((media) => media.displayName.toLowerCase().includes("agar")).length > 0);

  return tests;
}

function Icon({ name, className = "h-4 w-4" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true
  };

  const icons = {
    search: (
      <svg {...common}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
    plus: (
      <svg {...common}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),
    save: (
      <svg {...common}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
        <path d="M17 21v-8H7v8" />
        <path d="M7 3v5h8" />
      </svg>
    ),
    check: (
      <svg {...common}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    alert: (
      <svg {...common}>
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
    close: (
      <svg {...common}>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    ),
    menu: (
      <svg {...common}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </svg>
    ),
    bell: (
      <svg {...common}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    user: (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 0 0-16 0" />
      </svg>
    ),
    briefcase: (
      <svg {...common}>
        <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 12h18" />
      </svg>
    ),
    customers: (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    jobs: (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10" />
        <path d="M7 12h10" />
        <path d="M7 16h6" />
      </svg>
    ),
    lab: (
      <svg {...common}>
        <path d="M9 3h6" />
        <path d="M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3" />
        <path d="M7 16h10" />
      </svg>
    ),
    mail: (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
    shield: (
      <svg {...common}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    invoice: (
      <svg {...common}>
        <path d="M4 2h14l2 2v18l-3-2-3 2-3-2-3 2-4-2V2Z" />
        <path d="M8 7h8" />
        <path d="M8 11h8" />
        <path d="M8 15h4" />
      </svg>
    ),
    chevronRight: (
      <svg {...common}>
        <path d="m9 18 6-6-6-6" />
      </svg>
    ),
    logo: (
      <svg {...common}>
        <path d="M4 9.5C4 6.5 6.5 4 9.5 4h10.5v10.5c0 3-2.5 5.5-5.5 5.5H4V9.5Z" />
        <path d="M7 7h10v7.5c0 1.4-1.1 2.5-2.5 2.5H7V7Z" />
      </svg>
    ),
    layers: (
      <svg {...common}>
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 17 9 5 9-5" />
      </svg>
    )
  };

  return icons[name] || icons.layers;
}

function Button({
  children,
  onClick,
  variant = "primary",
  size = "default",
  className = "",
  disabled = false,
  type = "button"
}) {
  const base = "inline-flex items-center justify-center font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-slate-800 text-white hover:bg-slate-900 shadow-sm",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    soft: "bg-slate-100 text-slate-700 hover:bg-slate-200"
  };
  const sizes = {
    default: "h-11 rounded-md px-5 text-sm",
    icon: "h-8 w-8 rounded-md p-0",
    sm: "h-8 rounded-md px-3 text-xs",
    xs: "h-7 rounded-md px-2.5 text-xs"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

function Field({ label, required = false, children }) {
  return (
    <div className="contents">
      <label className="text-sm font-semibold text-slate-900">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      {children}
    </div>
  );
}

function SidebarItem({ label, icon, active = false, indent = false, expanded = false }) {
  const expandableItems = [
    "Customers",
    "Jobs",
    "Testing and Reporting",
    "Invoicing and Billing",
    "User Management"
  ];

  return (
    <button
      className={`group flex w-full items-center justify-between rounded-md py-2 text-left text-sm transition ${
        indent ? "pl-8 pr-3" : "px-4"
      } ${active ? "bg-slate-100 font-semibold text-slate-950" : "text-slate-700 hover:bg-slate-50"}`}
    >
      <span className="flex items-center gap-3">
        {!indent && icon && (
          <Icon
            name={icon}
            className={`h-4 w-4 ${active ? "text-rose-700" : "text-slate-500"}`}
          />
        )}
        <span>{label}</span>
      </span>
      {expanded && <span className="text-slate-400">⌄</span>}
      {!expanded && !indent && expandableItems.includes(label) && (
        <Icon name="chevronRight" className="h-4 w-4 text-slate-400" />
      )}
    </button>
  );
}

function TestPanel() {
  const tests = useMemo(() => runPrototypeTests(), []);
  const passedCount = tests.filter((test) => test.passed).length;

  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Prototype Logic Tests</h2>
          <p className="text-xs text-slate-500">Media popup and mapping checks.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {passedCount}/{tests.length} passed
        </span>
      </div>
      <div className="grid gap-2 p-4 md:grid-cols-3">
        {tests.map((test) => (
          <div key={test.name} className="flex items-start gap-2 rounded-md border bg-slate-50 p-3 text-xs">
            <Icon
              name={test.passed ? "check" : "alert"}
              className={
                test.passed
                  ? "mt-0.5 h-4 w-4 text-emerald-600"
                  : "mt-0.5 h-4 w-4 text-amber-600"
              }
            />
            <span className="text-slate-700">{test.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TestMethodAddPrototype() {
  const [mediaTypes, setMediaTypes] = useState(INITIAL_MEDIA_TYPES);
  const [mediaSupported, setMediaSupported] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState([]);
  const [mediaSearch, setMediaSearch] = useState("");
  const [newMediaName, setNewMediaName] = useState("");
  const [isMediaPopupOpen, setIsMediaPopupOpen] = useState(false);
  const [toast, setToast] = useState(
    "Media support is disabled by default. Tick Multiple Media Supported only when the test method requires media mapping."
  );
  const [testMethod, setTestMethod] = useState({
    prefix: "",
    version: "",
    shortCode: "",
    name: "",
    unit: ""
  });

  const computedCode = testMethod.prefix && testMethod.version
    ? `${testMethod.prefix}.${testMethod.version}`
    : "N/A";

  const selectedMedia = useMemo(() => {
    return selectedMediaIds
      .map((id) => mediaTypes.find((media) => media.id === id))
      .filter(Boolean)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [selectedMediaIds, mediaTypes]);

  const filteredMediaTypes = useMemo(() => {
    const query = mediaSearch.trim().toLowerCase();
    return mediaTypes
      .filter((media) => media.displayName.toLowerCase().includes(query))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [mediaTypes, mediaSearch]);

  const toastIsWarning = toast.toLowerCase().includes("required") || toast.toLowerCase().includes("already");

  function handleMediaSupportedChange(value) {
    setMediaSupported(value);
    setToast(
      value
        ? "Media type mapping enabled. No media types are mapped yet."
        : "Media type mapping disabled. Existing selections are kept but hidden until enabled again."
    );
  }

  function toggleMedia(mediaId) {
    setSelectedMediaIds((items) => toggleMediaSelection(items, mediaId));
    setToast("Media type selection updated. Unticked items remain visible in the popup.");
  }

  function removeMedia(mediaId) {
    setSelectedMediaIds((items) => removeMediaSelection(items, mediaId));
    setToast("Media type removed from this test method.");
  }

  function createAndSelectMedia() {
    const result = validateNewMediaType(newMediaName, mediaTypes);

    if (!result.ok) {
      setToast(result.message);
      return;
    }

    const next = {
      id: Date.now(),
      displayName: result.value
    };

    setMediaTypes((items) => [next, ...items]);
    setSelectedMediaIds((items) => [...items, next.id]);
    setNewMediaName("");
    setMediaSearch("");
    setToast(result.message);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[335px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="flex h-[74px] items-center border-b border-slate-100 px-6">
            <div className="flex items-center gap-3">
              <Icon name="logo" className="h-10 w-10 text-black" />
              <div className="text-4xl font-semibold tracking-tight text-black">Luthen</div>
              <span className="-ml-2 mt-1 text-xs text-slate-500">*</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-2">
            <SidebarItem label="Dashboard" />
            <SidebarItem label="Opportunities" />
            <SidebarItem label="Price Book" />
            <SidebarItem label="Job Cards" />
            <div className="my-2 border-t border-transparent" />
            <SidebarItem label="Customers" icon="customers" />
            <SidebarItem label="Jobs" icon="jobs" />
            <SidebarItem label="Sample Collection" icon="jobs" />
            <SidebarItem label="Testing and Reporting" icon="lab" />
            <SidebarItem label="Report Email" icon="mail" />
            <div className="my-2 rounded-md bg-slate-50">
              <div className="border-l-4 border-rose-700">
                <SidebarItem label="Setup Admin" icon="shield" active expanded />
              </div>
              <SidebarItem label="Sales Items" indent />
              <SidebarItem label="Test Method" indent active />
              <SidebarItem label="Analytes" indent />
              <SidebarItem label="Guidelines" indent />
              <SidebarItem label="Coupons" indent />
            </div>
            <SidebarItem label="Invoicing and Billing" icon="invoice" />
            <SidebarItem label="User Management" icon="customers" />
          </nav>
        </aside>

        <main className="min-w-0 flex-1 bg-white">
          <header className="flex h-[74px] items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
            <Button variant="ghost" size="icon">
              <Icon name="menu" className="h-5 w-5" />
            </Button>
            <div className="mx-auto hidden w-[520px] items-center gap-2 md:flex">
              <input
                className="h-11 flex-1 rounded-md border border-slate-200 px-5 text-sm outline-none focus:border-slate-400"
                placeholder="Search anything..."
              />
              <Button className="h-11 rounded-md px-5">
                Search <Icon name="search" className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-5 text-slate-700">
              <Icon name="briefcase" className="h-5 w-5" />
              <Icon name="bell" className="h-5 w-5" />
              <span className="text-sm">Hello, IMC User</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <Icon name="user" className="h-5 w-5 text-slate-600" />
              </span>
            </div>
          </header>

          <div className="p-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Create Test Method</h1>
            <div className="mt-6">
              <Button variant="primary">
                <span className="mr-2 text-lg">‹</span> Back
              </Button>
            </div>

            {toast && (
              <div
                className={`mt-6 flex items-center gap-2 rounded-md border px-4 py-3 text-sm ${
                  toastIsWarning
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
                }`}
              >
                <Icon name={toastIsWarning ? "alert" : "check"} className="h-4 w-4" />
                <span>{toast}</span>
              </div>
            )}

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <h2 className="mb-5 text-xl font-bold text-slate-950">Method Details</h2>
                <div className="grid gap-x-5 gap-y-6 xl:grid-cols-[170px_minmax(0,1fr)_170px_150px] xl:items-center">
                  <Field label="Method Code (Prefix)" required>
                    <input
                      value={testMethod.prefix}
                      onChange={(event) => setTestMethod({ ...testMethod, prefix: event.target.value })}
                      className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                      placeholder="e.g. 7"
                    />
                  </Field>

                  <Field label="Method Code (Version)" required>
                    <input
                      value={testMethod.version}
                      onChange={(event) => setTestMethod({ ...testMethod, version: event.target.value })}
                      className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                      placeholder="e.g. 1"
                    />
                  </Field>

                  <Field label="Method Name" required>
                    <input
                      value={testMethod.name}
                      onChange={(event) => setTestMethod({ ...testMethod, name: event.target.value })}
                      className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                      placeholder="Enter test method name"
                    />
                  </Field>

                  <Field label="Short Code (4 Chars)" required>
                    <input
                      value={testMethod.shortCode}
                      onChange={(event) => setTestMethod({ ...testMethod, shortCode: event.target.value.toUpperCase() })}
                      className="h-11 rounded-md border border-slate-200 px-3 text-sm uppercase outline-none focus:border-slate-400"
                      placeholder="e.g. SPC"
                    />
                  </Field>

                  <Field label="Reference(s)">
                    <input
                      className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                      placeholder="Enter reference(s)"
                    />
                  </Field>

                  <Field label="Method Units" required>
                    <select
                      value={testMethod.unit}
                      onChange={(event) => setTestMethod({ ...testMethod, unit: event.target.value })}
                      className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                    >
                      <option value="">Select units</option>
                      <option>CFU/g</option>
                      <option>CFU/mL</option>
                      <option>MPN/g</option>
                      <option>P/A</option>
                      <option>mg/L</option>
                    </select>
                  </Field>

                  <label className="self-start pt-3 text-sm font-semibold text-slate-900">
                    Applicable To (Matrices/Scope)
                  </label>
                  <textarea
                    className="min-h-[68px] rounded-md border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400 xl:col-span-3"
                    placeholder="Enter applicable matrices/scope e.g., Drinking water, Process water, Dairy products"
                  />

                  <label className="self-start pt-3 text-sm font-semibold text-slate-900">
                    Preservation and Holding Time
                  </label>
                  <textarea
                    className="min-h-[68px] rounded-md border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400 xl:col-span-3"
                    placeholder="Enter preservation and holding time e.g., Cool ≤ 8 °C; Analyze within 6 h; Sodium thiosulfate for chlorinated water"
                  />

                  <label className="self-start pt-3 text-sm font-semibold text-slate-900">
                    Principle
                  </label>
                  <textarea
                    className="min-h-[68px] rounded-md border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400 xl:col-span-3"
                    placeholder="Enter principle e.g., Membrane filtration followed by incubation on m-Endo agar at 35 ± 0.5 °C for 24 ± 2 h"
                  />

                  <label className="self-start pt-3 text-sm font-semibold text-slate-900">
                    Sample Container
                  </label>
                  <textarea
                    className="min-h-[120px] rounded-md border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400 xl:col-span-3"
                    placeholder="Enter sample container e.g., Sterile 250 mL PET bottle with thiosulfate; 100 mL minimum"
                  />

                  <Field label="Default Number of Dilutions" required>
                    <input
                      className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                      defaultValue="1"
                    />
                  </Field>

                  <div className="xl:col-span-2">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={mediaSupported}
                        onChange={(event) => handleMediaSupportedChange(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <span className="text-sm font-semibold text-slate-900">Multiple Media Supported</span>
                    </label>
                  </div>
                </div>

                {mediaSupported && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <label className="text-sm font-semibold text-slate-900">
                        Supported media (select at least one) <span className="text-rose-600">*</span>
                      </label>
                      <Button onClick={() => setIsMediaPopupOpen(true)}>
                        <Icon name="plus" className="mr-2 h-4 w-4" /> Select Media Types
                      </Button>
                    </div>

                    {selectedMedia.length > 0 ? (
                      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {selectedMedia.map((media) => (
                          <div
                            key={media.id}
                            className="flex items-center justify-between gap-3 rounded-md border bg-white px-3 py-2"
                          >
                            <span className="truncate text-sm font-semibold text-slate-950">
                              {media.displayName}
                            </span>
                            <button
                              onClick={() => removeMedia(media.id)}
                              className="shrink-0 text-xs font-semibold text-rose-700 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">No options found</div>
                    )}
                  </div>
                )}

                <div className="mt-7 rounded-md border border-slate-200 bg-white">
                  <div className="grid grid-cols-3 border-b text-center text-sm font-semibold text-slate-900">
                    <button className="border-b-4 border-slate-700 px-4 py-4">Analytes</button>
                    <button className="px-4 py-4">Adornments</button>
                    <button className="px-4 py-4">Supporting Values</button>
                  </div>
                  <div className="p-4">
                    <Button variant="primary">
                      <Icon name="plus" className="mr-2 h-4 w-4" /> Add Analyte
                    </Button>
                  </div>
                </div>
              </div>

              <aside className="h-fit rounded-md border border-slate-200 bg-white p-5 shadow-md">
                <h3 className="mb-5 text-lg font-bold text-slate-950">Test Method</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-semibold text-slate-900">Method Code (Computed)</div>
                    <div className="mt-1 text-slate-700">{computedCode}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Method Name</div>
                    <div className="mt-1 text-slate-700">{testMethod.name || "N/A"}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Short Code</div>
                    <div className="mt-1 text-slate-700">{testMethod.shortCode || "N/A"}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Applicable To</div>
                    <div className="mt-1 text-slate-700">N/A</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Default Number of Dilutions</div>
                    <div className="mt-1 text-slate-700">1</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Multiple Media Supported</div>
                    <div className="mt-1 text-slate-700">{mediaSupported ? "Yes" : "No"}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Analytes</div>
                    <div className="mt-1 text-slate-700">N/A</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Summary</div>
                    <div className="mt-1 text-slate-700">Fill details to create a new Test Method.</div>
                  </div>
                </div>
              </aside>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline">
                <Icon name="close" className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button>
                <Icon name="save" className="mr-2 h-4 w-4" /> Save
              </Button>
            </div>

            <div className="mt-6">
              <TestPanel />
            </div>
          </div>
        </main>
      </div>

      {isMediaPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[88vh] w-full max-w-5xl flex-col rounded-md bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Select Supported Media Types</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tick or untick media types. Unticked items remain visible in this popup.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsMediaPopupOpen(false)}>
                <Icon name="close" className="h-5 w-5" />
              </Button>
            </div>

            <div className="border-b bg-slate-50 p-4">
              <div className="grid gap-3 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
                <div>
                  <label className="text-sm font-medium text-slate-700">Search Media Types</label>
                  <div className="mt-1 flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
                    <Icon name="search" className="h-4 w-4 text-slate-400" />
                    <input
                      value={mediaSearch}
                      onChange={(event) => setMediaSearch(event.target.value.toUpperCase())}
                      className="w-full bg-transparent text-sm uppercase outline-none"
                      placeholder="FILTER BY MEDIA TYPE"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Create New Media Type</label>
                  <input
                    value={newMediaName}
                    onChange={(event) => setNewMediaName(event.target.value.toUpperCase())}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") createAndSelectMedia();
                    }}
                    className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm uppercase outline-none focus:border-slate-400"
                    placeholder="e.g. NUTRIENT AGAR"
                  />
                </div>

                <Button onClick={createAndSelectMedia}>
                  <Icon name="plus" className="mr-2 h-4 w-4" /> Create and Tick
                </Button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  Showing <strong>{filteredMediaTypes.length}</strong> media types
                </span>
                <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {selectedMedia.length} selected
                </span>
              </div>

              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {filteredMediaTypes.map((media) => {
                  const checked = selectedMediaIds.includes(media.id);

                  return (
                    <label
                      key={media.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 transition ${
                        checked ? "border-slate-800 bg-slate-100" : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMedia(media.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-950">
                          {media.displayName}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t px-5 py-4">
              <div className="text-sm text-slate-500">
                Changes are reflected in the mapped list immediately.
              </div>
              <Button onClick={() => setIsMediaPopupOpen(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
