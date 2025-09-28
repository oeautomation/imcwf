import React from "react";

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div
      onClick={() => onOpenChange && onOpenChange(false)}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
};
export const DialogContent = ({ className = "", ...p }) => (
  <div className={`bg-white rounded p-4 min-w-[320px] ${className}`} {...p} />
);
export const DialogHeader = (p) => <div className="mb-2" {...p} />;
export const DialogTitle = (p) => <h3 className="text-lg font-semibold" {...p} />;
export const DialogDescription = (p) => <p className="text-sm opacity-70" {...p} />;
export const DialogFooter = (p) => <div className="mt-3 flex justify-end gap-2" {...p} />;
export default Dialog;
