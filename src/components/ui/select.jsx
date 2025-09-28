import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const Ctx = createContext();

export const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <Ctx.Provider value={{ value, onValueChange, open, setOpen }}>
      <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
        {children}
      </div>
    </Ctx.Provider>
  );
};

export const SelectTrigger = ({ className = "", children, ...p }) => {
  const ctx = useContext(Ctx) || {};
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen && ctx.setOpen(!ctx.open)}
      className={`inline-flex items-center justify-between border rounded px-2 py-1 text-sm min-w-[8rem] ${className}`}
      {...p}
    >
      {children}
      <span style={{ marginLeft: 6, opacity: 0.7 }}>▾</span>
    </button>
  );
};

export const SelectValue = ({ placeholder }) => {
    const { value } = useContext(Ctx) || {};
    const showPlaceholder =
      value === undefined || value === null || value === "" || value === "all";
    return <span>{showPlaceholder ? (placeholder ?? "") : String(value)}</span>;
  };
  
export const SelectContent = ({ children }) => {
  const { open } = useContext(Ctx) || {};
  if (!open) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: 0,
        minWidth: "100%",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 4,
        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
        zIndex: 2000,
      }}
      role="listbox"
    >
      {children}
    </div>
  );
};

export const SelectItem = ({ value, children }) => {
  const ctx = useContext(Ctx) || {};
  const selected = String(ctx.value) === String(value);
  return (
    <button
      type="button"
      onClick={() => {
        ctx.onValueChange && ctx.onValueChange(value);
        ctx.setOpen && ctx.setOpen(false);
      }}
      role="option"
      aria-selected={selected}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        borderRadius: 6,
        padding: "6px 8px",
        fontSize: 14,
        color: selected ? "#ffffff" : "#111827",      // <-- ensure visible text
        background: selected ? "#111827" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = "#f3f4f6";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
};

export default Select;
