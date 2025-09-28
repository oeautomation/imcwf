import React, { createContext, useContext } from "react";
const Ctx = createContext();

export const Select = ({ value, onValueChange, children }) => (
  <Ctx.Provider value={{ value, onValueChange }}>{children}</Ctx.Provider>
);
export const SelectTrigger = ({ className = "", children, ...p }) => (
  <div className={`inline-block ${className}`} {...p}>{children}</div>
);
export const SelectValue = ({ placeholder }) => {
  const { value } = useContext(Ctx) || {};
  return <span>{value ?? placeholder ?? ""}</span>;
};
export const SelectContent = ({ children }) => <div>{children}</div>;
export const SelectItem = ({ value, children }) => {
  const ctx = useContext(Ctx) || {};
  const selected = String(ctx.value) === String(value);
  return (
    <button
      type="button"
      onClick={() => ctx.onValueChange && ctx.onValueChange(value)}
      style={{ display: "block", width: "100%", textAlign: "left" }}
      className={`border rounded px-2 py-1 text-sm ${selected ? "bg-black text-white" : ""}`}
    >
      {children}
    </button>
  );
};
export default Select;
