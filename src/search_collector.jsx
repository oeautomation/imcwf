import React from "react";

export default function App(){
  return <CollectorAllocation/>;
}

/* ---------- Inline styles (global) ---------- */
const styles = {
  page: {
    display: "grid",
    gridTemplateColumns: "300px 1fr", // Increased from 250px to 300px
    height: "100vh",
    fontFamily: "Inter, system-ui, Arial, sans-serif",
    color: "#111827",
    background: "#f9fafb",
  },
  sidebar: {
    padding: 16,
    borderRight: "1px solid #e5e7eb",
    background: "#fff",
    overflow: "auto",
  },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 16,
  },
  h3: { margin: "8px 0 12px 0" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottom: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  field: { display: "grid", gap: 6, marginBottom: 12 },
  label: { fontSize: 12, color: "#374151", fontWeight: 600 },
  input: {
    height: 32,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "0 10px",
    outline: "none",
  },
  select: {
    height: 32,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "0 8px",
    outline: "none",
    background: "#fff",
  },
  checkboxRow: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  pillTabs: { display: "flex", gap: 6, flexWrap: "wrap" },
  pill: {
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontSize: 12,
  },
  pillActive: { background: "#111827", color: "#fff", borderColor: "#111827" },

  bulkBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
  },
  primaryBtn: {
    height: 34,
    padding: "0 12px",
    background: "#111827",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    cursor: "pointer",
  },

  tableWrap: {
    flex: 1,
    overflow: "auto",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    fontSize: 13, // Reduced from 14
  },
  th: {
    textAlign: "left",
    position: "sticky",
    top: 0,
    background: "#f3f4f6",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 700,
    padding: "6px 8px", // Reduced from "10px 12px"
    fontSize: 11, // Reduced from 12
    color: "#374151",
  },
  td: {
    padding: "6px 8px", // Reduced from "10px 12px"
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "top",
    fontSize: 12, // Increased from 11
  },
  chipPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "2px 8px",
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    borderRadius: 999,
    fontSize: 12,
  },
  xBtn: {
    appearance: "none",
    border: 0,
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
    lineHeight: 1,
  },
  suggestBox: {
    position: "absolute",
    zIndex: 10,
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderTop: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 220,
    overflow: "auto",
  },
  suggestRow: {
    padding: "8px 10px",
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
  },
  weeksWrap: { display:'flex', gap:10, flexWrap:'wrap' },
};

// Row background highlight by status
function rowStyle(status){
  const bg = {
    Pending: "#ffffff",
    Overdue: "#fff1f2", // light red
    Missed: "#fffbeb",  // light amber
    Collected: "#f0fdf4", // light green
    Installed: "#f0fdf4", // light green
  }[status];
  return { background: bg };
}

/* ---------- Small presentational components ---------- */
function Chip({ children, color = "#e5e7eb" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 8px",
        borderRadius: 999,
        background: color + "22",
        border: `1px solid ${color}`,
        color: "#111827",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    Pending: { bg: "#f5f5f5", fg: "#374151" },
    Overdue: { bg: "#fee2e2", fg: "#991b1b" },
    Missed: { bg: "#fff7ed", fg: "#9a3412" },
    Collected: { bg: "#dcfce7", fg: "#166534" },
    Installed: { bg: "#dcfce7", fg: "#166534" },
  };
  const c = map[status] || map.Pending;
  const dot = { Pending: "•", Overdue: "●", Missed: "▲", Collected: "✔",Installed: "✔" }[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 8px",
        borderRadius: 8,
        background: c.bg,
        color: c.fg,
        fontWeight: 700,
        fontSize: 12,
      }}
      title={status}
    >
      <span>{dot}</span>
      {status}
    </span>
  );
}

/* --- Generic Autocomplete (single-select) --- */
function AutoCompleteSingle({
  options, // [{value, label}]
  value,
  onChange,
  placeholder = "Type to search…",
}){
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef(null);
  const boxRef = React.useRef(null);

  const labelFor = (val) => options.find(o=>o.value===val)?.label || "";
  const shownText = query !== "" ? query : labelFor(value);

  const filtered = React.useMemo(()=>{
    const q = (query || labelFor(value) || "").trim().toLowerCase();
    if (!q) return options.slice(0, 100);
    return options.filter(o => o.label.toLowerCase().includes(q) || String(o.value).toLowerCase().includes(q)).slice(0, 100);
  }, [options, query, value]);

  React.useEffect(()=>{
    function onClickOutside(e){
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return ()=> document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const selectVal = (val)=>{ onChange(val); setOpen(false); setQuery(""); };

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) { setOpen(true); return; }
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i=>Math.min(i+1, filtered.length-1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i=>Math.max(i-1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); const row = filtered[activeIndex]; if (row) selectVal(row.value); }
    if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div ref={boxRef} style={{ position:'relative' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'0 8px', height:32, border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }} onClick={()=>{ setOpen(true); inputRef.current && inputRef.current.focus(); }}>
        <input
          ref={inputRef}
          value={shownText}
          onChange={(e)=>{ setQuery(e.target.value); setOpen(true); setActiveIndex(0); }}
          onFocus={()=> setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          style={{ flex:1, height:28, border:0, outline:'none', background:'transparent' }}
        />
        {value && (
          <button aria-label="Clear" style={styles.xBtn} onClick={(e)=>{ e.stopPropagation(); onChange(""); setQuery(""); }}>×</button>
        )}
      </div>
      {open && filtered.length>0 && (
        <div style={styles.suggestBox}>
          {filtered.map((o, idx)=> (
            <div
              key={String(o.value)}
              role="option"
              aria-selected={idx===activeIndex}
              style={{ ...styles.suggestRow, background: idx===activeIndex? '#f3f4f6' : '#fff' }}
              onMouseEnter={()=> setActiveIndex(idx)}
              onMouseDown={(e)=>{ e.preventDefault(); selectVal(o.value); }}
            >
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span>{o.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --- Collector Multi-Search (autocomplete, multi-select, NOT a dropdown) --- */
function CollectorMultiSearch({ allCollectors, selectedIds, onChange, placeholder = "Type to search collectors…", regionFilter = "All" }) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef(null);
  const boxRef = React.useRef(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = allCollectors;
    if (regionFilter && regionFilter !== "All") {
      rows = rows.filter(c => (c.regions||[]).includes(regionFilter));
    }
    if (!q) return rows.slice(0, 50); // cap to 50 for perf
    return rows.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)).slice(0, 50);
  }, [allCollectors, query, regionFilter]);

  React.useEffect(() => {
    function onClickOutside(e){
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const add = (id) => {
    if (!selectedIds.includes(id)) onChange([...selectedIds, id]);
    setQuery("");
    setOpen(false);
    inputRef.current && inputRef.current.focus();
  };
  const remove = (id) => onChange(selectedIds.filter(x => x !== id));

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i+1, filtered.length-1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i-1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); const row = filtered[activeIndex]; if (row) add(row.id); }
    if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 6, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }} onClick={() => inputRef.current && inputRef.current.focus()}>
        {selectedIds.map(id => {
          const c = allCollectors.find(x => x.id === id);
          return (
            <span key={id} style={styles.chipPill}>
              {c ? c.name : id}
              <button aria-label={`Remove ${c?c.name:id}`} style={styles.xBtn} onClick={() => remove(id)}>×</button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          value={query}
          onChange={(e)=>{ setQuery(e.target.value); setOpen(true); setActiveIndex(0); }}
          onKeyDown={onKeyDown}
          onFocus={()=> setOpen(true)}
          placeholder={placeholder}
          style={{ flex: 1, minWidth: 120, height: 26, border: 0, outline: 'none' }}
        />
      </div>
      {open && filtered.length > 0 && (
        <div style={styles.suggestBox}>
          {filtered.map((c, idx) => (
            <div
              key={c.id}
              role="option"
              aria-selected={idx===activeIndex}
              style={{ ...styles.suggestRow, background: idx===activeIndex? '#f3f4f6' : '#fff' }}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseDown={(e) => { e.preventDefault(); add(c.id); }}
            >
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span>{c.name}</span>
                <span style={{ fontSize: 12, color:'#6b7280' }}>{c.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Main component ---------- */
function CollectorAllocation(){
  // ----- Mock reference data -----
  const REGIONS = ["NSW Territory 1", "NSW Territory 2", "NSW Territory 3", "QLD North", "Victoria SA"];
  const JOB_TYPES = ["Microbiology", "Corrosion", "IAQ"];
  const COLLECTORS = [
    { id: "u1", name: "Khan",   regions: ["NSW Territory 1", "NSW Territory 2"] },
    { id: "u2", name: "Sly",    regions: ["NSW Territory 2", "NSW Territory 3"] },
    { id: "u3", name: "Brad",   regions: ["NSW Territory 1"] },
    { id: "u4", name: "Koll",   regions: ["QLD North"] },
    { id: "u5", name: "Riya",   regions: ["Victoria SA"] },
    // more mock entries to simulate a big list
    ...Array.from({length: 120}, (_,i)=>({ id: `ux${i+10}`, name: `Collector ${i+10}`, regions: i%2? ["NSW Territory 2"] : ["NSW Territory 1"] }))
  ];

  // Helpers for date handling
  const d = (str) => new Date(str + "T00:00:00");
  const addDays = (base, n) => { const t = new Date(base); t.setDate(t.getDate()+n); return t; };
  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth()+1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const daysDiff = (a,b) => Math.floor((a-b)/(1000*60*60*24));
  // Week-of-month helper (Monday-start). Returns 1..5
  const weekOfMonth = (date) => {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDow = (first.getDay() || 7); // Mon=1..Sun=7
    const idx = Math.floor((date.getDate() + firstDow - 2) / 7) + 1;
    return Math.min(5, Math.max(1, idx));
  };

  // ----- Mock schedules -----
  const [schedules, setSchedules] = React.useState([
    { id: "sch1", date: "2025-10-10", region: "NSW Territory 1", jobCode: "IAM10-007", customer: "IAM10", jobType: "Microbiology", location: "60, Martin Place, SYDNEY NSW", testSummary: "RCS", collectorId: "", collected: false, notes: "" },
    { id: "sch2", date: "2025-10-14", region: "NSW Territory 2", jobCode: "KNI10-152", customer: "KNI10", jobType: "Microbiology", location: "113, Wicks Road, Macquarie Park, NSW", testSummary: "Mild Steel/Copper", collectorId: "u2", collected: false, notes: "Site Con" },
    { id: "sch3", date: "2025-10-16", region: "NSW Territory 1", jobCode: "PRG10-001", customer: "PRG10", jobType: "Microbiology", location: "Sydney Airport, NSW", testSummary: "Misc", collectorId: "", collected: false, notes: "Confirm PO" },
    { id: "sch4", date: "2025-10-18", region: "NSW Territory 2", jobCode: "CAW10-011", customer: "CAW10", jobType: "Corrosion", location: "Westpac Place, 275 Kent St, Sydney NSW", testSummary: "Mild Steel/Copper", collectorId: "u1", collected: false, notes: "" },
    { id: "sch5", date: "2025-10-05", region: "NSW Territory 2", jobCode: "CAW10-021", customer: "CAW10", jobType: "Corrosion", location: "453-463, Kent St, Sydney NSW", testSummary: "Mild Steel/Copper", collectorId: "", collected: false, notes: "" },
    { id: "sch6", date: "2025-10-20", region: "NSW Territory 1", jobCode: "CBR10-150", customer: "CBR10", jobType: "Microbiology", location: "77 King St, Sydney NSW", testSummary: "601/602", collectorId: "u3", collected: false, notes: "SO7168277_227388" },
    { id: "sch7", date: "2025-10-12", region: "NSW Territory 1", jobCode: "CBR10-302", customer: "CBR10", jobType: "Microbiology", location: "160 Sussex St, Sydney NSW", testSummary: "Mild Steel/Copper", collectorId: "u3", collected: true, notes: "" },
    { id: "sch8", date: "2025-10-12", region: "NSW Territory 2", jobCode: "CAW10-015", customer: "CAW10", jobType: "Corrosion", location: "Westpac Place, 275 Kent St, Sydney NSW", testSummary: "Mild Steel/Copper", collectorId: "u1", collected: true, notes: "" }, 
]);

  // ----- Filters / UI state -----
  const today = React.useMemo(() => new Date(new Date().toDateString()), []);

  // Date filters simplified: two modes → 'range' and 'ymw' (Year → Month → Week)
  const [dateMode, setDateMode] = React.useState('ymw');
  const [range, setRange] = React.useState({ from: formatDate(addDays(today, -7)), to: formatDate(addDays(today, 14)) });
  const years = React.useMemo(()=> Array.from({length:11}, (_,i)=> today.getFullYear()-5+i), [today]);
  const [ySel, setYSel] = React.useState(today.getFullYear());
  const [mSel, setMSel] = React.useState(today.getMonth()+1); // 1..12
  const [weeksSelected, setWeeksSelected] = React.useState([]); // [] means all weeks

  const [region, setRegion] = React.useState("All");
  const [jobType, setJobType] = React.useState("All");
  const [statusPill, setStatusPill] = React.useState('All'); // Keep this state for the new pills
  const [selectedCollectorForBulk, setSelectedCollectorForBulk] = React.useState("");
  const [applyFutureForBulk, setApplyFutureForBulk] = React.useState(false);
  const [selectedRowIds, setSelectedRowIds] = React.useState(new Set());
  const [collectorFilterIds, setCollectorFilterIds] = React.useState([]); // multi-select filter

  // Compute status for a schedule
  const getStatus = (s) => {
    if (s.jobType === "Corrosion" && s.jobCode === "CAW10-015") return "Installed";

    if (s.collected) return "Collected";
    const sd = d(s.date);
    if (sd < today) {
      const diff = daysDiff(today, sd);
      if (diff > 10) return "Missed";
      //return "Overdue";
    }
    if (s.jobType === "Corrosion" && s.jobCode === "CAW10-021")  return "Installation Pending";
    return "Collection Pending";
  };

  const statusCounts = React.useMemo(() => {
    const acc = { Pending: 0, Missed: 0, Collected: 0 };
    schedules.forEach((s) => (acc[getStatus(s)] += 1));
    return acc;
  }, [schedules]);

  const collectorsFor = (regionName) => {
    if (!regionName || regionName === "All") return COLLECTORS;
    return COLLECTORS.filter((c) => c.regions.includes(regionName));
  };

  const datePasses = (dateStr) => {
    const dt = d(dateStr);
    if (dateMode === 'range') {
      const from = d(range.from), to = d(range.to);
      return dt >= from && dt <= to;
    }
    // ymw mode (Year → Month → Week checkboxes)
    const y = dt.getFullYear();
    const m = dt.getMonth()+1;
    if (y !== Number(ySel)) return false;
    if (m !== Number(mSel)) return false;
    if (weeksSelected.length === 0) return true; // All weeks
    const wom = weekOfMonth(dt);
    return weeksSelected.includes(wom);
  };

  const visibleRows = React.useMemo(() => {
    return schedules.filter((s) => {
      const st = getStatus(s);
      if (statusPill !== 'All' && st !== statusPill) return false;
      if (!datePasses(s.date)) return false;
      if (region !== "All" && s.region !== region) return false;
      if (jobType !== "All" && s.jobType !== jobType) return false;
      if (collectorFilterIds.length > 0 && !collectorFilterIds.includes(s.collectorId)) return false;
      return true;
    });
  }, [schedules, dateMode, range, ySel, mSel, weeksSelected, region, jobType, statusPill, collectorFilterIds]);

  // ----- Row edit handlers -----
  const updateCollector = (rowId, newCollectorId, applyToFuture) => {
    setSchedules((prev) => {
      const rows = [...prev];
      const row = rows.find((r) => r.id === rowId);
      if (!row) return prev;
      row.collectorId = newCollectorId;
      if (applyToFuture) {
        rows.forEach((r) => {
          if (r.jobCode === row.jobCode && r.location === row.location && d(r.date) > d(row.date)) {
            r.collectorId = newCollectorId;
          }
        });
      }
      return rows;
    });
  };

  const updateNotes = (rowId, newNotes) => {
    setSchedules((prev) => prev.map((r) => (r.id === rowId ? { ...r, notes: newNotes } : r)));
  };

  const updateDate = (rowId, newDate) => {
    // Accepts YYYY-MM-DD from <input type="date">
    setSchedules(prev => prev.map(r => (r.id === rowId ? { ...r, date: newDate } : r)));
  };

  const toggleRowSelected = (rowId) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId); else next.add(rowId);
      return next;
    });
  };

  const bulkAssign = () => {
    if (!selectedCollectorForBulk) return;
    setSchedules((prev) => {
      const rows = [...prev];
      visibleRows.forEach((row) => {
        if (selectedRowIds.has(row.id)) {
          const newCollectorId = selectedCollectorForBulk;
          const target = rows.find((r) => r.id === row.id);
          if (!target) return;
          target.collectorId = newCollectorId;
          if (applyFutureForBulk) {
            rows.forEach((r) => {
              if (r.jobCode === target.jobCode && r.location === target.location && d(r.date) > d(target.date)) {
                r.collectorId = newCollectorId;
              }
            });
          }
        }
      });
      return rows;
    });
  };

  /* ---------- Dev tests (non-blocking) ---------- */
  React.useEffect(() => {
    // Status buckets should all have at least one row with current mock seed.
    console.assert(statusCounts.Pending > 0, "Expected at least one Pending job");
    console.assert(statusCounts.Overdue > 0, "Expected at least one Overdue job");
    console.assert(statusCounts.Missed > 0, "Expected at least one Missed job");
    console.assert(statusCounts.Collected > 0, "Expected at least one Collected job");

    // Date filter sanity
    const someRow = schedules[0];
    console.assert(typeof datePasses(someRow.date) === 'boolean', 'datePasses should return boolean');

    // weekOfMonth tests (Monday-start)
    const dt1 = new Date(2025, 9, 1); // 2025-10-01
    const dt2 = new Date(2025, 9, 31);
    const w1 = weekOfMonth(dt1);
    const w2 = weekOfMonth(dt2);
    console.assert(w1>=1 && w1<=5, 'weekOfMonth in range 1..5');
    console.assert(w2>=1 && w2<=5, 'weekOfMonth in range 1..5');

    // Status pill filter smoke test
    const countPending = schedules.filter(s=> getStatus(s)==='Pending').length;
    const countViaPredicate = schedules.filter(s=>{
      const st = getStatus(s);
      if ('Pending' !== 'All' && st !== 'Pending') return false;
      return true;
    }).length;
    console.assert(countViaPredicate === countPending, 'Status pill predicate should match manual count for Pending');

    // Date edit simulation (does not mutate state): moving a past date into the future should flip status to Pending
    const rowPast = { ...schedules[0] };
    const futureDate = formatDate(addDays(today, 10));
    const simulatedStatus = getStatus({ ...rowPast, date: futureDate });
    if (d(rowPast.date) < today) {
      console.assert(simulatedStatus === 'Pending', 'Editing a past date to future should yield Pending status');
    }
  }, [statusCounts, schedules]);

  // Build autocomplete option sets
  const regionOptions = React.useMemo(()=> [{ value:"All", label:"All" }, ...REGIONS.map(r=>({ value:r, label:r }))], []);
  const jobTypeOptions = React.useMemo(()=> [{ value:"All", label:"All" }, ...JOB_TYPES.map(j=>({ value:j, label:j }))], []);
  const collectorOptionsForRegion = React.useMemo(()=> collectorsFor(region).map(c=>({ value:c.id, label:c.name })), [region]);

  // Year/Month option sets (standard dropdowns)
  const yearOptions = React.useMemo(()=> years, [years]);
  const monthOptions = [
    {value:1,label:'January'},{value:2,label:'February'},{value:3,label:'March'},{value:4,label:'April'},
    {value:5,label:'May'},{value:6,label:'June'},{value:7,label:'July'},{value:8,label:'August'},
    {value:9,label:'September'},{value:10,label:'October'},{value:11,label:'November'},{value:12,label:'December'},
  ];

  return (
    <div style={styles.page}>
      {/* Left filters */}
      <aside style={styles.sidebar}>
        <h3 style={styles.h3}>Filters</h3>


        {dateMode==='ymw' && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Year</label>
              {/* Standard dropdown for year */}
              <select style={styles.select} value={ySel} onChange={(e)=> setYSel(Number(e.target.value))}>
                {yearOptions.map(y => (<option key={y} value={y}>{y}</option>))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Month</label>
              {/* Standard dropdown for month */}
              <select style={styles.select} value={mSel} onChange={(e)=> setMSel(Number(e.target.value))}>
                {monthOptions.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Weeks (tick one or more)</label>
              <div style={styles.weeksWrap}>
                {[1,2,3,4,5].map(w => (
                  <label key={w} style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={weeksSelected.includes(w)}
                      onChange={(e)=> {
                        const checked = e.target.checked;
                        setWeeksSelected(prev => {
                          if (checked) return [...new Set([...prev, w])];
                          return prev.filter(x => x !== w);
                        });
                      }}
                    />
                    <span>Week {w}</span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={()=> setWeeksSelected([])}
                  style={{ ...styles.pill }}
                  title="Clear weeks (treat as all weeks)"
                >
                  Clear (All weeks)
                </button>
              </div>
              <div style={{fontSize:12,color:'#6b7280'}}>No week selected = All weeks in the chosen month.</div>
            </div>
          </>
        )}

        {dateMode==='range' && (
          <div style={styles.field}>
            <label style={styles.label}>Date Range</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="date" value={range.from} onChange={(e)=>setRange(x=>({...x, from:e.target.value}))} style={styles.input} />
              <span>→</span>
              <input type="date" value={range.to} onChange={(e)=>setRange(x=>({...x, to:e.target.value}))} style={styles.input} />
            </div>
          </div>
        )}

        <div style={styles.field}>
          <label style={styles.label}>Region</label>
          <AutoCompleteSingle
            options={regionOptions}
            value={region}
            onChange={setRegion}
            placeholder="Type a region…"
          />
          
        </div>


        



        {/* Collector multi-search filter */}
        <div style={styles.field}>
          <label style={styles.label}>Collectors (multi-select)</label>
          <CollectorMultiSearch
            allCollectors={COLLECTORS}
            selectedIds={collectorFilterIds}
            onChange={setCollectorFilterIds}
            regionFilter={region}
            placeholder="Type a name or ID…"
          />
          {collectorFilterIds.length>0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
              Filtering by {collectorFilterIds.length} collector{collectorFilterIds.length>1?'s':''}
            </div>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <h4 style={{ margin: "12px 0 8px 0" }}>Summary</h4>
          <div style={styles.pillTabs}>
            {['All', 'Collection Pending','Installation Pending', 'Missed', 'Collected', 'Installed'].map(st => (
              <button
                key={st}
                onClick={() => setStatusPill(st)}
                style={{ ...styles.pill, ...(statusPill === st ? styles.pillActive : {}) }}
              >
                {st}: {statusCounts[st] || 0}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h2 style={{ margin: 0 }}>Sample Collector Allocation</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{visibleRows.length} result{visibleRows.length!==1?"s":""}</span>
          </div>
        </header>

        {/* Bulk assign bar */}
        <section style={styles.bulkBar}>
          <span style={{ fontWeight: 600 }}>Bulk Assign</span>
          <AutoCompleteSingle
            options={collectorOptionsForRegion}
            value={selectedCollectorForBulk}
            onChange={setSelectedCollectorForBulk}
            placeholder="Type a collector…"
          />
          <label style={styles.checkboxRow}>
            <input type="checkbox" checked={applyFutureForBulk} onChange={(e)=>setApplyFutureForBulk(e.target.checked)} />
            <span>Apply to future schedules</span>
          </label>
          <button style={styles.primaryBtn} onClick={bulkAssign} disabled={!selectedCollectorForBulk || selectedRowIds.size===0}>
            Assign to {selectedRowIds.size} selected
          </button>
        </section>

        {/* Table */}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}></th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Region</th>
                <th style={styles.th}>Job Code</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Job Type</th>
                <th style={styles.th}>Job Location</th>
                <th style={styles.th}>Test</th>
                <th style={styles.th}>Collector</th>
                <th style={styles.th}>Notes</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row)=>{
                const st = getStatus(row);
                const perRowCollectorOptions = collectorsFor(row.region).map(c=>({ value:c.id, label:c.name }));
                return (
                  <tr key={row.id} style={rowStyle(st)}>
                    <td style={styles.td}><input type="checkbox" checked={selectedRowIds.has(row.id)} onChange={()=>toggleRowSelected(row.id)} /></td>
                    <td style={styles.td}>
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e)=> updateDate(row.id, e.target.value)}
                        style={styles.input}
                        aria-label={`Change date for ${row.jobCode}`}
                      />
                    </td>
                    <td style={styles.td}>{row.region}</td>
                    <td style={styles.td}>{row.jobCode}</td>
                    <td style={styles.td}>{row.customer}</td>
                    <td style={styles.td}>{row.jobType}</td>
                    <td style={styles.td}>{row.location}</td>
                    <td style={styles.td}>{row.testSummary}</td>
                    <td style={styles.td}>
                      {/* Row-level collector assignment via autocomplete */}
                      <RowCollectorAuto
                        value={row.collectorId}
                        options={perRowCollectorOptions}
                        onChange={(val, applyFuture)=> updateCollector(row.id, val, applyFuture)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input value={row.notes} onChange={(e)=>updateNotes(row.id, e.target.value)} placeholder="Add note…" style={styles.input} />
                    </td>
                    <td style={styles.td}><StatusBadge status={st} /></td>
                  </tr>
                );
              })}
              {visibleRows.length===0 && (
                <tr>
                  <td style={styles.td} colSpan={11}>
                    <div style={{ textAlign: "center", color: "#6b7280", padding: 24 }}>No results</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

/* --- Row Collector Autocomplete with "apply to future" companion --- */
function RowCollectorAuto({ value, options, onChange }){
  const [applyFuture, setApplyFuture] = React.useState(false);
  return (
    <div style={{ display:'grid', gap:6 }}>
      <AutoCompleteSingle
        options={options}
        value={value}
        onChange={(val)=> onChange(val, applyFuture)}
        placeholder="Type collector…"
      />
      <label style={styles.checkboxRow}>
        <input type="checkbox" checked={applyFuture} onChange={e=> setApplyFuture(e.target.checked)} />
        <span style={{ fontSize: 12 }}>Apply to future schedules</span>
      </label>
    </div>
  );
}
