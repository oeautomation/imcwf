import React, { createContext, useContext, useState } from "react";
const TabsCtx = createContext();

export const Tabs = ({ defaultValue, value, onValueChange, children, className = "" }) => {
  const [internal, setInternal] = useState(defaultValue);
  const v = value ?? internal;
  const set = onValueChange ?? setInternal;
  return <TabsCtx.Provider value={{ value: v, set }}><div className={className}>{children}</div></TabsCtx.Provider>;
};
export const TabsList = ({ className = "", ...p }) => <div className={`flex gap-2 ${className}`} {...p} />;
export const TabsTrigger = ({ value, className = "", ...p }) => {
  const ctx = useContext(TabsCtx);
  const active = ctx?.value === value;
  return (
    <button
      className={`px-3 py-1 text-sm border rounded ${active ? "bg-black text-white" : ""} ${className}`}
      onClick={() => ctx?.set(value)}
      {...p}
    />
  );
};
export const TabsContent = ({ value, children, className = "", ...p }) => {
  const ctx = useContext(TabsCtx);
  if (ctx?.value !== value) return null;
  return <div className={className} {...p}>{children}</div>;
};
export default Tabs;
