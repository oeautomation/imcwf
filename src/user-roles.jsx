import React, { useEffect, useMemo, useRef, useState, useContext, createContext } from "react";
import ReactDOM from "react-dom";

/**
 * IMC Access Mapping – Self-contained React Prototype (no external UI deps)
 * JS/JSX-ONLY VERSION
 * ------------------------------------------------------------------------
 * - Removed ALL TypeScript-specific syntax (types, generics, assertions like `as const`).
 * - Pure JSX/JS that can live in a `.jsx` file.
 * - Inline UI primitives (Button, Input, Checkbox, Tabs, Select, Dialog, Popover, etc.).
 * - Virtualized lists for scale (100+ users/actions).
 * - Console self-tests for basic integrity.
 */

// ----------------------------- Inline UI Primitives -----------------------------
function cx() { return Array.from(arguments).filter(Boolean).join(" "); }

function Button({ children, onClick, variant = "default", size = "md", className, type = "button", ...rest }) {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition border";
  const sizes = { sm: "px-2.5 py-1.5 text-xs", md: "px-3 py-2 text-sm", lg: "px-4 py-2.5" };
  const variants = {
    default: "bg-slate-900 text-white border-slate-900 hover:bg-slate-800",
    outline: "bg-white text-slate-900 border-slate-300 hover:bg-slate-50",
    secondary: "bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200",
    destructive: "bg-red-600 text-white border-red-600 hover:bg-red-700",
  };
  return (
    <button type={type} onClick={onClick} className={cx(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

function Input({ className, ...rest }) {
  return <input className={cx("w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300", className)} {...rest}/>;
}

function Textarea({ className, ...rest }) {
  return <textarea className={cx("w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300", className)} {...rest}/>;
}

function Checkbox({ checked, onCheckedChange }) {
  return (
    <input type="checkbox" checked={!!checked} onChange={(e)=>onCheckedChange && onCheckedChange(e.target.checked)} className="h-4 w-4 rounded border-slate-300"/>
  );
}

function Badge({ children, variant = "secondary", className }) {
  const variants = {
    secondary: "bg-slate-100 text-slate-800",
    outline: "border border-slate-300 text-slate-700",
    destructive: "bg-red-100 text-red-800",
  };
  return <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-xs", variants[variant], className)}>{children}</span>;
}

function Separator({ orientation = "horizontal", className = "" }) {
  return orientation === "vertical" ? (
    <div className={cx("w-px bg-slate-200", className)} />
  ) : (
    <div className={cx("h-px bg-slate-200 w-full", className)} />
  );
}

function Card({ children, className = "" }) { return <div className={cx("border border-slate-200 rounded-2xl bg-white", className)}>{children}</div>; }
function CardHeader({ children, className = "" }) { return <div className={cx("p-4 border-b border-slate-100", className)}>{children}</div>; }
function CardTitle({ children, className = "" }) { return <div className={cx("text-lg font-semibold", className)}>{children}</div>; }
function CardContent({ children, className = "" }) { return <div className={cx("p-4", className)}>{children}</div>; }

function ScrollArea({ children, className = "", style }) { return <div className={cx("overflow-auto", className)} style={style}>{children}</div>; }

// Icons (inline SVG)
const Icon = {
  Shield: (p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
  Layers: (p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>),
  Users: (p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  Search: (p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>),
  Download: (p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>),
  Upload: (p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>),
  Filter: (p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12 10 19 14 21 14 12 22 3"/></svg>),
  ListFilter: (p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 12h13M10 18h11"/><circle cx="5" cy="12" r="2"/><circle cx="7" cy="18" r="2"/></svg>),
  AlertTriangle: (p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17"/></svg>),
};

// Tabs
const TabsCtx = createContext(null);
function Tabs({ defaultValue, children, className }){ const [value,setValue]=useState(defaultValue); return <TabsCtx.Provider value={{value,setValue}}><div className={className}>{children}</div></TabsCtx.Provider>; }
function TabsList({ children, className }){ return <div className={cx("inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1", className)}>{children}</div>; }
function TabsTrigger({ value, children, className }){ const ctx=useContext(TabsCtx); const active=ctx.value===value; return <button onClick={()=>ctx.setValue(value)} className={cx("px-3 py-1.5 text-sm rounded-lg", active?"bg-white shadow border":"text-slate-600")}>{children}</button>; }
function TabsContent({ value, children, className }){ const ctx=useContext(TabsCtx); if(ctx.value!==value) return null; return <div className={className}>{children}</div>; }

// Simple Select (headless, improved positioning & styles)
const SelectCtx = createContext(null);
function Select({ value, onValueChange, children }){
  const [open,setOpen]=useState(false);
  const [pos,setPos]=useState({top:0,left:0,width:0});
  const triggerRef=useRef(null);
  const contentRef=useRef(null);

  const close = () => setOpen(false);
  const openMenu = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX, width: r.width });
    setOpen(true);
  };

  useEffect(()=>{
    if(!open) return;
    const onClick = (e)=>{
      if(!contentRef.current || !triggerRef.current) return;
      if(!contentRef.current.contains(e.target) && !triggerRef.current.contains(e.target)) close();
    };
    const onResize = ()=>{
      if(!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX, width: r.width });
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return ()=>{
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  },[open]);

  return (
    <SelectCtx.Provider value={{value,onValueChange,open,openMenu,close,triggerRef,contentRef,pos}}>
      {children}
    </SelectCtx.Provider>
  );
}
function SelectTrigger({ children, className }){
  const { open, openMenu, close, triggerRef } = useContext(SelectCtx);
  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={()=> (open ? close() : openMenu())}
      className={cx(
        "w-full flex items-center justify-between border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white",
        "focus:outline-none focus:ring-2 focus:ring-slate-300",
        className
      )}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <svg className={cx("w-4 h-4 ml-2 shrink-0 transition-transform", open && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
    </button>
  );
}
function SelectValue({ placeholder }){ const { value } = useContext(SelectCtx); return <span className={cx("truncate text-sm", value?"text-slate-800":"text-slate-400")}>{value || placeholder}</span>; }
function SelectContent({ children, className }){
  const { open, contentRef, pos } = useContext(SelectCtx);
  if(!open) return null;
  const node = (
    <div
      ref={contentRef}
      style={{ position:"absolute", top: pos.top, left: pos.left, minWidth: pos.width }}
      className={cx("z-[9998] rounded-xl border border-slate-200 bg-white shadow-xl max-h-64 overflow-auto p-1", className)}
    >
      {children}
    </div>
  );
  return ReactDOM.createPortal(node, document.body);
}
function SelectItem({ value, children }){
  const ctx=useContext(SelectCtx);
  const selected = ctx.value === value;
  const onClick=()=>{ if(value==="") { alert("SelectItem value cannot be empty"); return; } ctx.onValueChange && ctx.onValueChange(value); ctx.close(); };
  return (
    <div
      onClick={onClick}
      className={cx(
        "px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between",
        selected ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-700"
      )}
      data-value={value}
    >
      <span className="truncate pr-2">{children}</span>
      {selected && <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>}
    </div>
  );
}
// Popover
const PopCtx = createContext(null);
function Popover({ children }){ const [open,setOpen]=useState(false); return <PopCtx.Provider value={{open,setOpen}}>{children}</PopCtx.Provider>; }
function PopoverTrigger({ asChild=false, children }){ const ctx=useContext(PopCtx); const onClick=()=>ctx.setOpen((o)=>!o); return asChild? React.cloneElement(children, { onClick }) : <button onClick={onClick}>{children}</button>; }
function PopoverContent({ children, className }){ const { open, setOpen } = useContext(PopCtx); if(!open) return null; return <div className={cx("mt-2 rounded-xl border border-slate-200 bg-white shadow p-3", className)} onKeyDown={(e)=>e.key==='Escape'&&setOpen(false)}>{children}</div>; }

// Dialog
const DialogCtx = createContext(null);
function Dialog({ children, open:controlledOpen, onOpenChange }){ const [open,setOpen]=useState(!!controlledOpen); useEffect(()=>{ if(controlledOpen!==undefined) setOpen(controlledOpen); },[controlledOpen]); const api={open,setOpen:(v)=>{setOpen(v);onOpenChange && onOpenChange(v);} }; return <DialogCtx.Provider value={api}>{children}</DialogCtx.Provider>; }
function DialogTrigger({ asChild=false, children }){ const ctx=useContext(DialogCtx); const onClick=()=>ctx.setOpen(true); return asChild? React.cloneElement(children, { onClick }) : <button onClick={onClick}>{children}</button>; }
function DialogContent({ children, className }){ const { open, setOpen } = useContext(DialogCtx); if(!open) return null; return (
  <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/30">
    <div className={cx("w-[90vw] max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl", className)}>
      <div className="p-4">{children}</div>
      <div className="px-4 pb-4 flex justify-end"><Button variant="outline" onClick={()=>setOpen(false)}>Close</Button></div>
    </div>
  </div>
); }
function DialogHeader({ children }){ return <div className="mb-2">{children}</div>; }
function DialogTitle({ children }){ return <div className="text-lg font-semibold">{children}</div>; }
function DialogDescription({ children }){ return <div className="text-sm text-slate-600">{children}</div>; }
function DialogFooter({ children }){ return <div className="mt-3 flex justify-end gap-2">{children}</div>; }

// --------------------------- Seed Data (can scale) ---------------------------
const DEFAULT_ACTIONS = [
  { id: "job.create", label: "Create Job", module: "Job Management" },
  { id: "result.add", label: "Add Result", module: "Laboratory" },
  { id: "result.edit", label: "Edit Result", module: "Laboratory" },
  { id: "result.approve", label: "Approve Result", module: "Laboratory" },
  { id: "report.generate", label: "Generate Report", module: "Reporting" },
  { id: "report.signoff", label: "Report Sign-off", module: "Reporting" },
  { id: "coc.upload", label: "Upload CoC", module: "Field Ops" },
  { id: "coc.photo.upload", label: "Attach Field Photo", module: "Field Ops" },
  { id: "invoice.generate", label: "Generate Invoice", module: "Finance" },
  { id: "invoice.approve", label: "Approve Invoice", module: "Finance" },
  { id: "user.create", label: "Create User", module: "Administration" },
  { id: "user.role.assign", label: "Assign Roles", module: "Administration" },
  { id: "audit.view", label: "View Audit Trail", module: "System" },
];

const DEFAULT_PRIVILEGES = [
  { name: "Data Entry", actions: ["result.add", "result.edit"] },
  { name: "Verification / Approval", actions: ["result.approve", "report.signoff"] },
  { name: "Reporting", actions: ["report.generate"] },
  { name: "Collection", actions: ["coc.upload", "coc.photo.upload"] },
  { name: "Financial", actions: ["invoice.generate", "invoice.approve"] },
  { name: "Administrative", actions: ["user.create", "user.role.assign", "audit.view"] },
];

const DEFAULT_ROLES = [
  { name: "Lab Level 1", privileges: ["Data Entry"] },
  { name: "Lab Level 2", privileges: ["Data Entry", "Reporting"] },
  { name: "Lab Manager", privileges: ["Data Entry", "Verification / Approval", "Reporting"] },
  { name: "Lab Signatory", privileges: ["Verification / Approval"] },
  { name: "Sample Collecting Staff", privileges: ["Collection"] },
  { name: "Sales User", privileges: ["Reporting"] },
  { name: "Sales Manager", privileges: ["Reporting"] },
  { name: "Accounts / Office Admin", privileges: ["Financial"] },
  { name: "System Administrator", privileges: ["Administrative", "Reporting"] },
];

const DEFAULT_USERS = [
  { name: "Ruwan", roles: ["Lab Level 2"], departments: ["Microbiology"], regions: [] },
  { name: "CK", roles: ["Sample Collecting Staff"], departments: [], regions: ["NSW-T3", "VICSA-T2"] },
  { name: "Dr. Drashana", roles: ["Lab Manager", "Lab Signatory"], departments: ["Microbiology", "Environs"], regions: [] },
  { name: "Piyumie", roles: ["Sales User", "Sample Collecting Staff"], departments: ["Environs"], regions: ["QLD-NORTH"] },
  { name: "Sagi", roles: ["Sales Manager"], departments: [], regions: [] },
  { name: "Kasun", roles: ["System Administrator"], departments: ["All"], regions: ["All"] },
];

const CONTEXT_RULES = {
  "Lab Level 1": { dept: "required", region: "none" },
  "Lab Level 2": { dept: "required", region: "none" },
  "Lab Manager": { dept: "optional", region: "none" },
  "Lab Signatory": { dept: "required", region: "none" },
  "Sample Collecting Staff": { dept: "none", region: "required" },
  "Sales User": { dept: "optional", region: "none" },
  "Sales Manager": { dept: "none", region: "none" },
  "Accounts / Office Admin": { dept: "none", region: "none" },
  "System Administrator": { dept: "all", region: "all" },
};

// ------------------------------ Utilities ------------------------------
function usePersistedState(key, initial) {
  const [state, setState] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; } catch (e) { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {} }, [key, state]);
  return [state, setState];
}
function useSearchFilter(items, toText) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => { if (!q.trim()) return items; const t = q.toLowerCase(); return items.filter((i) => (toText(i) + "").toLowerCase().includes(t)); }, [q, items, toText]);
  return { q, setQ, filtered };
}
function Pill({ text }) { return <Badge variant="secondary" className="rounded-full px-2 py-0.5 mr-1 mb-1">{text}</Badge>; }

// ------------------------- Lightweight VirtualList -------------------------
function VirtualList({ height, itemSize, itemCount, width, children }) {
  const containerRef = useRef(null); const [scrollTop, setScrollTop] = useState(0);
  const onScroll = () => { const st = (containerRef.current && containerRef.current.scrollTop) || 0; setScrollTop(st); };
  const totalHeight = itemCount * itemSize; const startIndex = Math.max(0, Math.floor(scrollTop / itemSize)); const viewCount = Math.ceil((typeof height === "number" ? height : 400) / itemSize) + 4; const endIndex = Math.min(itemCount - 1, startIndex + viewCount);
  const items = []; for (let i = startIndex; i <= endIndex; i++) { const style = { position: "absolute", top: i * itemSize, height: itemSize, left: 0, right: 0 }; items.push(children({ index: i, style })); }
  return (<div ref={containerRef} onScroll={onScroll} style={{ height, width, overflowY: "auto", position: "relative" }}><div style={{ height: totalHeight, position: "relative" }}>{items}</div></div>);
}

// ------------------------------- Main App -------------------------------
export default function IMCAccessMappingScalable() {
  const [actions, setActions] = usePersistedState("actions", DEFAULT_ACTIONS);
  const [privileges, setPrivileges] = usePersistedState("privileges", DEFAULT_PRIVILEGES);
  const [roles, setRoles] = usePersistedState("roles", DEFAULT_ROLES);
  const [users, setUsers] = usePersistedState("users", DEFAULT_USERS);

  const [importText, setImportText] = useState("");
  const exportJSON = () => { const blob = new Blob([JSON.stringify({ actions, privileges, roles, users }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "imc-access-mapping.json"; a.click(); URL.revokeObjectURL(url); };
  const importJSON = () => { try { const data = JSON.parse(importText); setActions(data.actions || []); setPrivileges(data.privileges || []); setRoles(data.roles || []); setUsers(data.users || []); } catch (e) { alert("Invalid JSON"); } };

  useEffect(() => {
    const tests = [];
    tests.push({ name: "Has actions", pass: actions.length > 0 });
    const actionIds = new Set(actions.map((a) => a.id));
    const badPrivRefs = privileges.flatMap((p) => (p.actions || []).filter((a) => !actionIds.has(a)).map((a) => `${p.name}→${a}`));
    tests.push({ name: "Privileges reference valid actions", pass: badPrivRefs.length === 0, detail: badPrivRefs.join(", ") });
    const privNames = new Set(privileges.map((p) => p.name));
    const badRoleRefs = roles.flatMap((r) => (r.privileges || []).filter((p) => !privNames.has(p)).map((p) => `${r.name}→${p}`));
    tests.push({ name: "Roles reference valid privileges", pass: badRoleRefs.length === 0, detail: badRoleRefs.join(", ") });
    const dupe = (arr) => arr.length !== new Set(arr).size;
    tests.push({ name: "Unique action IDs", pass: !dupe(actions.map(a=>a.id)) });
    tests.push({ name: "Unique role names", pass: !dupe(roles.map(r=>r.name)) });
    tests.push({ name: "Unique privilege names", pass: !dupe(privileges.map(p=>p.name)) });
    tests.push({ name: "Unique user names", pass: !dupe(users.map(u=>u.name)) });
    const SENTINEL_ALL = "__ALL__"; tests.push({ name: "Select sentinel non-empty", pass: SENTINEL_ALL.length > 0 });
    // Extra tests
    const hasContextForCollector = users.every(u => !(u.roles||[]).includes("Sample Collecting Staff") || (u.regions && u.regions.length>0));
    tests.push({ name: "Collectors have regions when assigned", pass: hasContextForCollector });
    const allPrivActionsExist = privileges.every(p => (p.actions||[]).every(a => actionIds.has(a)));
    tests.push({ name: "All privilege actions exist", pass: allPrivActionsExist });

    console.group("IMC Access Mapping – Self Tests"); tests.forEach((t) => console[t.pass ? "log" : "error"](`${t.pass ? "✓" : "✗"} ${t.name}${t.detail ? " → " + t.detail : ""}`)); console.groupEnd();
  }, [actions, privileges, roles, users]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6 space-y-4">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <div className="text-slate-500 text-sm">Built for 100+ Users & 100+ Actions (virtualized lists, scoped editors)</div>
          </div>
          <div className="flex items-center gap-2">
            {/* <Button variant="outline" onClick={exportJSON}><Icon.Download className="w-4 h-4 mr-1"/>Export JSON</Button>
            <Dialog>
              <DialogTrigger asChild><Button variant="secondary"><Icon.Upload className="w-4 h-4 mr-1"/>Import JSON</Button></DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader><DialogTitle>Import Access Mapping JSON</DialogTitle><DialogDescription>Paste JSON exported from this tool.</DialogDescription></DialogHeader>
                <Textarea value={importText} onChange={(e)=>setImportText(e.target.value)} className="min-h-[200px] font-mono text-xs"/>
                <DialogFooter><Button onClick={importJSON}>Import</Button></DialogFooter>
              </DialogContent>
            </Dialog> */}
          </div>
        </header>

        <Tabs defaultValue="roles" className="w-full">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto gap-1">
            <TabsTrigger value="roles" className="flex items-center gap-2"><Icon.Shield className="w-4 h-4"/>Role → Privileges</TabsTrigger>
            <TabsTrigger value="privs" className="flex items-center gap-2"><Icon.Layers className="w-4 h-4"/>Privilege → Actions</TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2"><Icon.Users className="w-4 h-4"/>Bulk Users</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-600">Map role → privileges. Derived actions update automatically.</div>
              <AddRoleDialog onAdd={(name)=>{
                if(!name.trim()) return alert("Role name is required");
                if(roles.some(r=>r.name.toLowerCase()===name.toLowerCase())) return alert("Role already exists");
                const next=[...roles,{ name, privileges: [] }];
                setRoles(next);
              }}/>
            </div>
            <RolePrivilegeEditor roles={roles} setRoles={setRoles} privileges={privileges} actions={actions}/>
          </TabsContent>

          <TabsContent value="privs" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-600">Link privilege → actions. Add actions or privileges as needed.</div>
              <div className="flex gap-2">
                <AddActionDialog onAdd={(action)=>{
                  const id=action.id.trim();
                  if(!id) return alert("Action ID is required");
                  if(actions.some(a=>a.id.toLowerCase()===id.toLowerCase())) return alert("Action ID already exists");
                  setActions([...actions, action]);
                }}/>
                <AddPrivilegeDialog actions={actions} onAdd={(name, selectedActions)=>{
                  if(!name.trim()) return alert("Privilege name is required");
                  if(privileges.some(p=>p.name.toLowerCase()===name.toLowerCase())) return alert("Privilege already exists");
                  setPrivileges([...privileges, { name, actions: selectedActions }]);
                }}/>
              </div>
            </div>
            <PrivilegeActionEditor privileges={privileges} setPrivileges={setPrivileges} actions={actions}/>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-600">Bulk manage users and assign roles.</div>
              <AddUserDialog roles={roles} onAdd={(user)=>{
                if(!user.name.trim()) return alert("User name is required");
                if(users.some(u=>u.name.toLowerCase()===user.name.toLowerCase())) return alert("User already exists");
                setUsers([...users, user]);
              }}/>
            </div>
            <UserRoleBulkAssign users={users} setUsers={setUsers} roles={roles}/>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ------------------------- Role → Privileges Editor -------------------------
function RolePrivilegeEditor({ roles, setRoles, privileges, actions }){
  const { q, setQ, filtered } = useSearchFilter(roles, (r)=>`${r.name}`);
  const firstRole = (filtered[0] && filtered[0].name) || (roles[0] && roles[0].name) || "System Administrator";
  const [roleName, setRoleName] = useState(firstRole);
  useEffect(()=>{ if(!filtered.find(r=>r.name===roleName) && filtered[0]) setRoleName(filtered[0].name); },[q, filtered, roleName]);
  const role = roles.find(r=>r.name===roleName);

  // --- NEW: Editable Context Rules (Dept/Region) per Role (persisted) ---
  const DEFAULT_CONTEXT = useMemo(()=>{
    const obj = {};
    roles.forEach(r=>{ obj[r.name] = (CONTEXT_RULES[r.name] || { dept: "none", region: "none" }); });
    return obj;
  },[roles]);
  const [contextRules, setContextRules] = usePersistedState("contextRules", DEFAULT_CONTEXT);
  useEffect(()=>{
    // When roles list changes (new role added), seed defaults for missing entries
    const next = { ...contextRules };
    roles.forEach(r=>{ if(!next[r.name]) next[r.name] = (CONTEXT_RULES[r.name] || { dept: "none", region: "none" }); });
    setContextRules(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles.length]);

  const RULE_OPTS = ["none","optional","required","all"]; // business semantics
  const setDeptRule = (value)=> setContextRules({ ...contextRules, [role.name]: { ...(contextRules[role.name]||{}), dept: value } });
  const setRegionRule = (value)=> setContextRules({ ...contextRules, [role.name]: { ...(contextRules[role.name]||{}), region: value } });

  const togglePriv = (priv, checked)=>{
    if(!role) return;
    if(checked && (role.name==="Sales User" || role.name==="Sales Manager") && priv==="Collection"){
      const ok = confirm("'Collection' is atypical for Sales roles. Continue?"); if(!ok) return;
    }
    setRoles(roles.map(r=> r.name===role.name ? { ...r, privileges: checked ? Array.from(new Set([...(r.privileges||[]), priv])) : (r.privileges||[]).filter(p=>p!==priv) } : r));
  };

  const currentCtx = (role && contextRules[role.name]) || { dept: "none", region: "none" };
  

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Icon.Shield className="w-5 h-5"/>Role → Privileges</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon.Search className="w-4 h-4 text-slate-500"/>
          {/* <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search roles…"/> */}
          <Select value={roleName} onValueChange={setRoleName}>
            <SelectTrigger className="w-60"><SelectValue placeholder="Select role"/></SelectTrigger>
            <SelectContent>
              {filtered.map((r)=> <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {role ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Privileges</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {privileges.map((p)=>{
                  const has=(role.privileges||[]).includes(p.name);
                  return (
                    <label key={p.name} className="flex items-center gap-2 border rounded-lg px-3 py-2">
                      <Checkbox checked={has} onCheckedChange={(c)=>togglePriv(p.name, !!c)}/>
                      <span className="text-sm">{p.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Derived Actions</div>
              <ScrollArea className="h-64 border rounded-lg p-2">
                {(role.privileges||[]).flatMap((p)=> {
                  const pr = privileges.find((x)=>x.name===p); return (pr && pr.actions) || [];
                }).map((aid)=> {
                  const act = (actions||[]).find(a=>a.id===aid);
                  const label = act ? act.label : aid;
                  return <Pill key={aid} text={label}/>;
                })}
              </ScrollArea>
              <Separator className="my-2"/>
              <div className="text-xs text-slate-600">Context: Dept <Badge variant="outline" className="ml-1">{(CONTEXT_RULES[role.name] && CONTEXT_RULES[role.name].dept) || "—"}</Badge> · Region <Badge variant="outline" className="ml-1">{(CONTEXT_RULES[role.name] && CONTEXT_RULES[role.name].region) || "—"}</Badge></div>
              <Separator className="my-3"/>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Context Rules (per role)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="text-xs text-slate-600">Department</div>
                  <Select value={currentCtx.dept} onValueChange={setDeptRule}>
                    <SelectTrigger><SelectValue placeholder="Dept rule"/></SelectTrigger>
                    <SelectContent>
                      {RULE_OPTS.map(v=> <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-600">Region</div>
                  <Select value={currentCtx.region} onValueChange={setRegionRule}>
                    <SelectTrigger><SelectValue placeholder="Region rule"/></SelectTrigger>
                    <SelectContent>
                      {RULE_OPTS.map(v=> <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                <strong>Note:</strong> These rules define whether a user assigned this role must (or may) have Departments and/or Regions configured.
                <br/>Example: <em>Sample Collecting Staff</em> → Region = <em>required</em>.
              </div>
            </div>
          </div>

                 
          
        ) : <div className="text-sm text-slate-500">No role selected.</div>}
      </CardContent>
    </Card>
  );
}

// ----------------------- Privilege → Actions Editor -----------------------
function PrivilegeActionEditor({ privileges, setPrivileges, actions }){
  const { q, setQ, filtered } = useSearchFilter(privileges, (p)=>`${p.name}`);
  const firstPriv = (filtered[0] && filtered[0].name) || (privileges[0] && privileges[0].name) || "Data Entry";
  const [privName, setPrivName] = useState(firstPriv);
  const priv = privileges.find((p)=>p.name===privName);
  const { q: aq, setQ: setAq, filtered: filteredActions } = useSearchFilter(actions, (a)=>`${a.id} ${a.label} ${a.module}`);

  const toggleAction=(actionId, checked)=>{
    if(!priv) return;
    setPrivileges(privileges.map((p)=> p.name===priv.name ? { ...p, actions: checked ? Array.from(new Set([...(p.actions||[]), actionId])) : (p.actions||[]).filter((a)=>a!==actionId) } : p));
  };

  const Row = ({ index, style })=>{
    const a = filteredActions[index];
    const has = (priv && priv.actions || []).includes(a.id);
    return (
      <div style={style} className="flex items-center justify-between px-3">
        <div className="min-w-0 py-2">
          <div className="text-sm font-medium truncate">{a.label} <span className="text-slate-400 font-normal">({a.id})</span></div>
          <div className="text-xs text-slate-500">{a.module}</div>
        </div>
        <Checkbox checked={has} onCheckedChange={(c)=>toggleAction(a.id, !!c)}/>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Icon.Layers className="w-5 h-5"/>Privilege → Actions</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon.Search className="w-4 h-4 text-slate-500"/>
          {/* <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search privileges…"/> */}
          <Select value={privName} onValueChange={setPrivName}>
            <SelectTrigger className="w-60"><SelectValue placeholder="Select privilege"/></SelectTrigger>
            <SelectContent>
              {filtered.map((p)=> <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {priv ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon.ListFilter className="w-4 h-4 text-slate-500"/>
                <Input value={aq} onChange={(e)=>setAq(e.target.value)} placeholder="Filter actions (id, label, module)…"/>
              </div>
              <div className="border rounded-lg">
                <VirtualList height={360} itemCount={filteredActions.length} itemSize={56} width={"100%"}>
                  {({ index, style }) => Row({ index, style })}
                </VirtualList>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Included Actions</div>
              <ScrollArea className="h-64 border rounded-lg p-2">
                {(priv.actions||[]).map((aid)=>{
                  const act = (actions||[]).find(a=>a.id===aid);
                  const label = act ? act.label : aid;
                  return <Pill key={aid} text={label}/>;
                })}
              </ScrollArea>
            </div>
          </div>
        ) : <div className="text-sm text-slate-500">No privilege selected.</div>}
      </CardContent>
    </Card>
  );
}

// ----------------------------- Creation Dialogs -----------------------------
function AddRoleDialog({ onAdd }){
  const [open,setOpen]=useState(false); const [name,setName]=useState("");
  const save=()=>{ onAdd(name); setName(""); setOpen(false); };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">+ Add Role</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Role</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Input placeholder="Role name (e.g., Lab Level 3)" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddActionDialog({ onAdd }){
  const [open,setOpen]=useState(false); const [id,setId]=useState(""); const [label,setLabel]=useState(""); const [module,setModule]=useState("");
  const save=()=>{ onAdd({ id:id.trim(), label:label.trim()||id.trim(), module:module.trim()||"General" }); setId(""); setLabel(""); setModule(""); setOpen(false); };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">+ Add Action</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Action</DialogTitle></DialogHeader>
        <div className="grid gap-2">
            This is for developers only.  
          <Input placeholder="Action ID (e.g., sample.collect)" value={id} onChange={e=>setId(e.target.value)} />
          <Input placeholder="Label (optional)" value={label} onChange={e=>setLabel(e.target.value)} />
          <Input placeholder="Module (e.g., Field Ops)" value={module} onChange={e=>setModule(e.target.value)} />
        </div>
        <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddPrivilegeDialog({ actions, onAdd }){
  const [open,setOpen]=useState(false); const [name,setName]=useState(""); const [sel,setSel]=useState(new Set());
  const toggle=(id,on)=> setSel(prev=>{ const n=new Set(prev); on?n.add(id):n.delete(id); return n;});
  const save=()=>{ onAdd(name, Array.from(sel)); setName(""); setSel(new Set()); setOpen(false); };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">+ Add Privilege</Button></DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader><DialogTitle>Add Privilege</DialogTitle><DialogDescription>Name the privilege and choose actions.</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Privilege name (e.g., Sample Logistics)" value={name} onChange={e=>setName(e.target.value)} />
          <div className="h-56 border rounded-md p-2 overflow-auto">
            {actions.map((a)=>{
              const has=sel.has(a.id);
              return (
                <label key={a.id} className="flex items-center justify-between border-b py-1 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{a.label} <span className="text-slate-400 font-normal">({a.id})</span></div>
                    <div className="text-xs text-slate-500">{a.module}</div>
                  </div>
                  <Checkbox checked={has} onCheckedChange={(c)=>toggle(a.id, !!c)}/>
                </label>
              );
            })}
          </div>
        </div>
        <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function csvToArray(input){ return input.split(",").map(s=>s.trim()).filter(Boolean); }

function AddUserDialog({ roles, onAdd }){
  const [open,setOpen]=useState(false); const [name,setName]=useState(""); const [sel,setSel]=useState(new Set());
  const [depts,setDepts]=useState(""); const [regs,setRegs]=useState("");
  const [showAdvanced,setShowAdvanced]=useState(false);
  const toggle=(role,on)=> setSel(prev=>{ const n=new Set(prev); on?n.add(role):n.delete(role); return n;});
  const save=()=>{ onAdd({ name:name.trim(), roles:Array.from(sel), departments:csvToArray(depts), regions:csvToArray(regs) }); setName(""); setSel(new Set()); setDepts(""); setRegs(""); setOpen(false); };
  const hydrateFromAdvanced=(payload)=>{
    if(payload.name!==undefined) setName(payload.name);
    if(payload.roles) setSel(new Set(payload.roles));
    if(payload.departments) setDepts(payload.departments.join(", "));
    if(payload.regions) setRegs(payload.regions.join(", "));
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">+ Add User</Button></DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>Enter basics and initial roles. Or open the full User Editor prototype.</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end -mt-2 mb-2">
          <Button type="button" variant="secondary" size="sm" onClick={()=>setShowAdvanced(true)}>Open Advanced User Editor</Button>
        </div>
        <div className="grid gap-3">
          <Input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Roles</div>
              <div className="h-40 border rounded-md p-2 overflow-auto space-y-1">
                {roles.map((r)=>{
                  const has=sel.has(r.name);
                  return (
                    <label key={r.name} className="flex items-center gap-2">
                      <Checkbox checked={has} onCheckedChange={(c)=>toggle(r.name, !!c)}/>
                      <span className="text-sm">{r.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Contexts</div>
              <Input placeholder="Departments (comma-separated)" value={depts} onChange={e=>setDepts(e.target.value)} />
              <Input className="mt-2" placeholder="Regions (comma-separated)" value={regs} onChange={e=>setRegs(e.target.value)} />
              <div className="text-xs text-slate-500 mt-1">Note: Regions required if assigning Sample Collecting Staff.</div>
            </div>
          </div>
        </div>
        <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        {showAdvanced && (
          <AdvancedUserEditorModal
            open={showAdvanced}
            onOpenChange={setShowAdvanced}
            onImportJSON={hydrateFromAdvanced}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Link-out / embed modal to the existing "User Editor – Sample Collector & Regions" prototype
function AdvancedUserEditorModal({ open, onOpenChange, onImportJSON }){
  const [jsonText,setJsonText]=useState("");
  const OPEN_URL = "User Editor – Sample Collector & Regions (previewable)"; // Title reference of the other canvas
  const tryImport=()=>{
    try{
      const data = JSON.parse(jsonText);
      onImportJSON({
        name: data.fullName || data.name,
        roles: data.roles || data.assignedRoles,
        departments: data.departments || data.depts,
        regions: data.regions || data.allowedRegions,
      });
      onOpenChange(false);
    }catch(e){ alert("Invalid JSON pasted from Advanced User Editor export"); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Advanced User Editor</DialogTitle>
          <DialogDescription>
            This links to the previously created prototype <strong>{OPEN_URL}</strong>. Open it, complete the full form (including regions/signature/NATA),
            then paste its exported JSON here to hydrate this Add User dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-slate-700">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Open the existing prototype in a new tab: <em>{OPEN_URL}</em>.</li>
              <li>Fill the full user details and click <strong>Export JSON</strong> there.</li>
              <li>Paste the JSON below and click <strong>Import Into Add User</strong>.</li>
            </ol>
          </div>
          <Textarea placeholder="Paste JSON exported from the Advanced User Editor…" value={jsonText} onChange={e=>setJsonText(e.target.value)} className="min-h-[160px] font-mono text-xs"/>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={()=>window.open("about:blank","_blank")}>Open Advanced Editor</Button>
          <Button onClick={tryImport}>Import Into Add User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------- Bulk Users Panel -----------------------------
function UserRoleBulkAssign({ users, setUsers, roles }){
  const ALL = "__ALL__";
  const [selected, setSelected] = useState(new Set());
  const { q, setQ, filtered } = useSearchFilter(users, (u)=>`${u.name} ${(u.roles||[]).join(" ")}`);
  const [roleFilter, setRoleFilter] = useState(ALL);

  const list = useMemo(()=> filtered.filter((u)=> roleFilter !== ALL ? (u.roles||[]).includes(roleFilter) : true), [filtered, roleFilter]);

  const toggleSelected = (name, on)=>{ setSelected(prev=>{ const n = new Set(prev); on ? n.add(name) : n.delete(name); return n;}); };
  const bulkAddRole = (roleName)=>{ setUsers(users.map((u)=> selected.has(u.name) ? { ...u, roles: Array.from(new Set([...(u.roles||[]), roleName])) } : u)); };
  const bulkRemoveRole = (roleName)=>{ setUsers(users.map((u)=> selected.has(u.name) ? { ...u, roles: (u.roles||[]).filter((r)=> r!==roleName) } : u)); };

  const Row = ({ index, style })=>{
    const u = list[index]; const checked = selected.has(u.name);
    const missingRegion = (u.roles||[]).includes("Sample Collecting Staff") && (!(u.regions && u.regions.length));
    return (
      <div style={style} className="flex items-center justify-between px-3 border-b">
        <div className="flex items-center gap-2 min-w-0 py-2">
          <Checkbox checked={checked} onCheckedChange={(c)=>toggleSelected(u.name, !!c)}/>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate flex items-center gap-2">
              <span>{u.name}</span>
              {missingRegion && <Badge variant="destructive" className="text-[10px] flex items-center gap-1"><Icon.AlertTriangle className="w-3 h-3"/>Regions required</Badge>}
            </div>
            <div className="text-xs text-slate-500 truncate">Roles: {(() => {
              const list = (u.roles||[]).map((rn)=>{
                const rule = (CONTEXT_RULES && CONTEXT_RULES[rn]) || { dept:"none", region:"none" };
                const parts = [];
                if(rule.dept !== "none" && (u.departments && u.departments.length)) parts.push(`Dept: ${u.departments.join("|")}`);
                if(rule.region !== "none" && (u.regions && u.regions.length)) parts.push(`Region: ${u.regions.join("|")}`);
                return parts.length ? `${rn} (${parts.join("; ")})` : rn;
              });
              return list.length ? list.join(", ") : "—";
            })()}</div>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Edit Roles</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Assign Roles</DialogTitle>
              <DialogDescription>Toggle roles for {u.name}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {roles.map((r)=>{
                const has=(u.roles||[]).includes(r.name);
                const toggle=(on)=> setUsers(users.map((x)=> x.name===u.name ? { ...x, roles: on ? Array.from(new Set([...(x.roles||[]), r.name])) : (x.roles||[]).filter((rr)=>rr!==r.name) } : x));
                return (
                  <label key={r.name} className="flex items-center gap-2">
                    <Checkbox checked={has} onCheckedChange={(c)=>toggle(!!c)}/>
                    <span className="text-sm">{r.name}</span>
                  </label>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Icon.Users className="w-5 h-5"/>Bulk Users – Assign Roles</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Icon.Search className="w-4 h-4 text-slate-500"/>
          <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search users (name/roles)…" className="w-64"/>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Filter by role"/></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Roles</SelectItem>
              {roles.map((r)=> <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Separator orientation="vertical" className="h-6"/>
          <Popover>
            {/* <PopoverTrigger asChild><Button variant="secondary"><Icon.Filter className="w-4 h-4 mr-1"/>Bulk Actions</Button></PopoverTrigger> */}
            <PopoverContent className="w-80">
              <div className="text-xs text-slate-500 mb-2">Apply to <strong>{selected.size}</strong> selected users</div>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r)=> (
                  <div key={r.name} className="flex items-center justify-between border rounded-md px-2 py-2">
                    <span className="text-sm truncate pr-2">{r.name}</span>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" onClick={()=>bulkAddRole(r.name)}>Add</Button>
                      <Button size="sm" variant="outline" onClick={()=>bulkRemoveRole(r.name)}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="border rounded-lg">
          <VirtualList height={480} itemCount={list.length} itemSize={64} width={"100%"}>
            {({ index, style }) => Row({ index, style })}
          </VirtualList>
        </div>
      </CardContent>
    </Card>
  );
}
