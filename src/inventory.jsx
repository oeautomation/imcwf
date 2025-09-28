import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Pencil, Search, Filter, BadgeCheck, User, Package2 } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
  } catch {
    return "—";
  }
};

const presetUsers = [
  { id: "u.sam", name: "Sam Perera (Sampler)" },
  { id: "u.asha", name: "Asha Silva (Sampler)" },
  { id: "u.kamal", name: "Kamal Jay (Sampler)" },
];

const currentUser = { id: "admin_user_01", name: "Admin User" };

const StoreContext = createContext(null);
const useCouponStore = (selector) => {
  const ctx = useContext(StoreContext);
  return selector ? selector(ctx) : ctx;
};

function UploadCouponsPage() {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [previewRows, setPreviewRows] = useState([]);
  const [duplicatesInFile, setDuplicatesInFile] = useState([]);
  const addCoupons = useCouponStore((s) => s.addCoupons);

  const onFile = async (file) => {
    setFileName(file.name);
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: undefined, raw: false });
    const normalized = [];
    for (const r of rows) {
      const serialRaw = r?.serialNumber ?? r?.["Serial Number"] ?? r?.serial ?? r?.Serial;
      const typeRaw = r?.couponType ?? r?.["Coupon Type"] ?? r?.type;
      if (typeof serialRaw === "string" && typeof typeRaw === "string") {
        const serial = serialRaw.trim();
        const couponType = typeRaw.trim().toLowerCase();
        if (serial && couponType) normalized.push({ serialNumber: serial, couponType });
      }
    }
    const seen = new Set();
    const dups = [];
    for (const r of normalized) {
      const key = r.serialNumber.toUpperCase();
      if (seen.has(key)) dups.push(r.serialNumber);
      else seen.add(key);
    }
    setDuplicatesInFile(dups);
    setPreviewRows(normalized);
    if (normalized.length === 0) toast("No valid rows found. Ensure columns: serialNumber, couponType");
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  const handleUpload = () => {
    if (!previewRows.length) {
      toast("Nothing to upload.");
      return;
    }
    if (duplicatesInFile.length) {
      toast.error("Duplicate serials found inside the file. Fix & re-upload.");
      return;
    }
    const now = new Date().toISOString();
    const toSave = previewRows.map((r) => ({
      serialNumber: r.serialNumber,
      couponType: r.couponType,
      uploadDate: now,
      uploadedByUserId: currentUser.id,
      status: "available",
      fileName: fileName || "",
    }));
    const { added, skipped } = addCoupons(toSave);
    if (skipped.length) {
      toast.error(`Hard stop: ${skipped.length} serial(s) already exist. Example: ${skipped.slice(0, 3).join(", ")}`);
      return;
    }
    toast.success(`${added} coupon(s) uploaded`);
    setPreviewRows([]);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5"/> Upload Coupons (Excel)</CardTitle>
        <CardDescription>
          Upload an .xlsx file with columns <code>serialNumber</code> and <code>couponType</code>. The system records upload date, sets status to <Badge variant="secondary">available</Badge>, and blocks if any serial already exists.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-2xl p-8 text-center mb-4"
        >
          <Upload className="mx-auto mb-2"/>
          <p className="mb-2">Drag & drop Excel here, or choose a file</p>
          <div className="flex items-center justify-center gap-3">
            <Input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="max-w-sm"/>
            {fileName && <Badge variant="outline">{fileName}</Badge>}
          </div>
        </div>
        <div className="mb-3">
          {duplicatesInFile.length > 0 && (
            <div className="flex items-center gap-2 text-amber-600"><AlertTriangle className="h-4 w-4"/> {duplicatesInFile.length} duplicate serial(s) found within the file.</div>
          )}
        </div>
        {previewRows.length > 0 && (
          <div className="border rounded-xl">
            <div className="px-4 py-3 font-medium bg-muted/50">Preview ({previewRows.length})</div>
            <ScrollArea className="max-h-72">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="text-left border-b">
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Serial Number</th>
                    <th className="px-3 py-2">Coupon Type</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((r, i) => (
                    <tr key={`${r.serialNumber}-${i}`} className="border-b last:border-0">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2 font-mono">{r.serialNumber}</td>
                      <td className="px-3 py-2 capitalize">{r.couponType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button onClick={handleUpload} disabled={!previewRows.length || duplicatesInFile.length > 0}>
            <CheckCircle2 className="h-4 w-4 mr-2"/> Commit Upload
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-4 space-y-1">
          <div>Allowed types today: corrosion, aluminium, mild steel.</div>
          <div>Hard stop on any serial collision against existing records.</div>
        </div>
      </CardContent>
    </Card>
  );
}

function CouponsManagePage() {
  const { coupons, updateCoupon } = useCouponStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [weightFilter, setWeightFilter] = useState("all");
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const toggleOne = (serial) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(serial)) next.delete(serial);
      else next.add(serial);
      return next;
    });

  const uniqueTypes = Array.from(new Set(coupons.map((c) => c.couponType))).sort();

  const filtered = useMemo(() => {
    return coupons
      .filter((c) => (status === "all" ? true : c.status === status))
      .filter((c) => (type === "all" ? true : String(c.couponType).toLowerCase() === String(type).toLowerCase()))
      .filter((c) => {
        if (weightFilter === "all") return true;
        if (weightFilter === "has") return typeof c.weightGrams === "number" && !Number.isNaN(c.weightGrams);
        return !c.weightGrams && c.weightGrams !== 0;
      })
      .filter((c) => !query || String(c.serialNumber).toLowerCase().includes(query.toLowerCase()));
  }, [coupons, status, type, weightFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageSlice = filtered.slice(start, end);

  const allOnPageSelected = pageSlice.length > 0 && pageSlice.every((c) => selected.has(c.serialNumber));

  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageSlice.forEach((c) => next.delete(c.serialNumber));
      else pageSlice.forEach((c) => next.add(c.serialNumber));
      return next;
    });
  };

  const onWeightChange = (serial, val) => {
    const n = Number(val);
    if (val === "") {
      updateCoupon(serial, { weightGrams: undefined });
      return;
    }
    if (Number.isNaN(n) || n < 0) return;
    updateCoupon(serial, { weightGrams: n });
  };

  const [issueDialog, setIssueDialog] = useState({ open: false, count: 0 });
  const [issueUser, setIssueUser] = useState(presetUsers[0].id);

  const openBulkIssue = () => {
    const chosen = coupons.filter((c) => selected.has(c.serialNumber));
    if (chosen.length === 0) {
      toast("Select at least one coupon.");
      return;
    }
    const notAvailable = chosen.filter((c) => c.status !== "available").map((c) => c.serialNumber);
    if (notAvailable.length) {
      toast.error(`Only coupons with status 'available' can be issued. Eg: ${notAvailable.slice(0, 3).join(", ")}`);
      return;
    }
    const missingWeight = chosen.filter((c) => !(typeof c.weightGrams === "number" && !Number.isNaN(c.weightGrams))).map((c) => c.serialNumber);
    if (missingWeight.length) {
      toast.error(`Weight is required before issuing. Missing for: ${missingWeight.slice(0, 3).join(", ")}`);
      return;
    }
    setIssueDialog({ open: true, count: chosen.length });
  };

  const confirmBulkIssue = () => {
    const now = new Date().toISOString();
    coupons.forEach((c) => {
      if (selected.has(c.serialNumber) && c.status === "available") {
        updateCoupon(c.serialNumber, {
          status: "issued",
          dateIssued: now,
          issuedToUserId: issueUser,
          issuedByUserId: currentUser.id,
        });
      }
    });
    setIssueDialog({ open: false, count: 0 });
    toast.success("Selected coupons issued");
  };

  const bulkMarkUsed = () => {
    const chosen = coupons.filter((c) => selected.has(c.serialNumber));
    if (!chosen.length) {
      toast("Select at least one coupon.");
      return;
    }
    const notIssued = chosen.filter((c) => c.status !== "issued").map((c) => c.serialNumber);
    if (notIssued.length) {
      toast.error(`Only coupons with status 'issued' can be marked used. Eg: ${notIssued.slice(0, 3).join(", ")}`);
      return;
    }
    chosen.forEach((c) => updateCoupon(c.serialNumber, { status: "used" }));
    toast.success("Selected coupons marked as used");
  };

  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Package2 className="h-5 w-5"/> View & Edit Coupons</CardTitle>
        <CardDescription>Filter, inline-edit weight, and bulk-issue coupons to sample collectors.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4"/>
            <Input placeholder="Search serial…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-56"/>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4"/>
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={(v) => setType(v)}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Type"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={weightFilter} onValueChange={(v) => setWeightFilter(v)}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Weight"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weights</SelectItem>
                <SelectItem value="has">Weight Entered</SelectItem>
                <SelectItem value="missing">Weight Missing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-28"><SelectValue placeholder="Page size"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm tabular-nums">Page {page} / {totalPages}</div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => setPage(1)} disabled={page === 1}>{"<<"}</Button>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>{"<"}</Button>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{">"}</Button>
              <Button size="sm" variant="outline" onClick={() => setPage(totalPages)} disabled={page === totalPages}>{">>"}</Button>
            </div>
            <div className="text-sm tabular-nums">Selected {selected.size}</div>
            <Button size="sm" variant="default" onClick={openBulkIssue} disabled={selected.size === 0}><User className="h-4 w-4 mr-1"/> Issue Selected</Button>
            <Button size="sm" variant="outline" onClick={bulkMarkUsed} disabled={selected.size === 0}><BadgeCheck className="h-4 w-4 mr-1"/> Mark Used</Button>
          </div>
        </div>
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 w-10">
                  <input type="checkbox" aria-label="Select all on page" checked={allOnPageSelected} onChange={toggleAllOnPage} />
                </th>
                <th className="px-3 py-2">Serial</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Weight (g)</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Upload Date</th>
                <th className="px-3 py-2">Issued</th>
                <th className="px-3 py-2">Issued To</th>
                <th className="px-3 py-2">Issued By</th>
                <th className="px-3 py-2">File</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((c) => (
                <tr key={c.serialNumber} className="border-t">
                  <td className="px-3 py-2">
                    <input type="checkbox" aria-label={`Select ${c.serialNumber}`} checked={selected.has(c.serialNumber)} onChange={() => toggleOne(c.serialNumber)} />
                  </td>
                  <td className="px-3 py-2 font-medium font-mono">{c.serialNumber}</td>
                  <td className="px-3 py-2 capitalize">{c.couponType}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Input value={typeof c.weightGrams === "number" ? String(c.weightGrams) : ""} onChange={(e) => onWeightChange(c.serialNumber, e.target.value)} placeholder="Enter weight" className="w-36" />
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground"/>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {c.status === "available" && <Badge variant="secondary">available</Badge>}
                    {c.status === "issued" && <Badge className="bg-blue-600">issued</Badge>}
                    {c.status === "used" && <Badge className="bg-emerald-600">used</Badge>}
                  </td>
                  <td className="px-3 py-2">{formatDate(c.uploadDate)}</td>
                  <td className="px-3 py-2">{formatDate(c.dateIssued)}</td>
                  <td className="px-3 py-2">{presetUsers.find((u) => u.id === c.issuedToUserId)?.name ?? "—"}</td>
                  <td className="px-3 py-2">{c.issuedByUserId ?? "—"}</td>
                  <td className="px-3 py-2 truncate max-w-[12ch]" title={c.fileName}>{c.fileName || "—"}</td>
                </tr>
              ))}
              {pageSlice.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-muted-foreground">No coupons match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Dialog open={issueDialog.open} onOpenChange={(open) => setIssueDialog({ open, count: issueDialog.count })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Selected Coupons</DialogTitle>
              <DialogDescription>
                Choose a sampler. All selected coupons must be <Badge variant="secondary">available</Badge> and have a weight recorded.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Number of coupons</Label>
                <Input value={issueDialog.count ?? 0} readOnly className="mt-1"/>
              </div>
              <div>
                <Label>Issue To</Label>
                <Select value={issueUser} onValueChange={setIssueUser}>
                  <SelectTrigger className="mt-1 w-full"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {presetUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIssueDialog({ open: false, count: 0 })} variant="outline">Cancel</Button>
              <Button onClick={confirmBulkIssue}><CheckCircle2 className="h-4 w-4 mr-1"/> Confirm Issue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default function App() {
  const [coupons, setCoupons] = useState([]);

  const addCoupons = useCallback((items) => {
    const existing = new Set(coupons.map((c) => String(c.serialNumber).trim().toUpperCase()));
    const next = [];
    const skipped = [];
    for (const it of items) {
      const key = String(it.serialNumber).trim().toUpperCase();
      if (existing.has(key)) skipped.push(it.serialNumber);
      else {
        existing.add(key);
        next.push(it);
      }
    }
    if (next.length) setCoupons((s) => [...s, ...next]);
    return { added: next.length, skipped };
  }, [coupons]);

  const updateCoupon = useCallback((serial, patch) => {
    setCoupons((s) => s.map((c) => (c.serialNumber === serial ? { ...c, ...patch } : c)));
  }, []);

  const replaceAll = useCallback((items) => setCoupons(items), []);

  const storeValue = useMemo(() => ({ coupons, addCoupons, updateCoupon, replaceAll }), [coupons, addCoupons, updateCoupon, replaceAll]);

  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      replaceAll([
        {
          serialNumber: "ABC123456",
          couponType: "corrosion",
          uploadDate: new Date().toISOString(),
          status: "available",
          uploadedByUserId: currentUser.id,
          fileName: "initial-seed.xlsx",
        },
        {
          serialNumber: "DEF987654",
          couponType: "aluminium",
          uploadDate: new Date().toISOString(),
          status: "issued",
          dateIssued: new Date().toISOString(),
          issuedToUserId: presetUsers[0].id,
          issuedByUserId: currentUser.id,
          weightGrams: 12.4,
          uploadedByUserId: currentUser.id,
          fileName: "initial-seed.xlsx",
        },
      ]);
    }
  }, [replaceAll]);

  return (
    <StoreContext.Provider value={storeValue}>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <img src="https://cdn.jsdelivr.net/gh/tabler/tabler-icons/icons/discount-2.svg" className="w-6 h-6"/>
          <h1 className="text-2l font-semibold">Coupon Management Prototype</h1>
        </div>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList>
            <TabsTrigger value="upload">Upload Coupons</TabsTrigger>
            <TabsTrigger value="manage">View & Edit Coupons</TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <UploadCouponsPage />
          </TabsContent>
          <TabsContent value="manage">
            <CouponsManagePage />
          </TabsContent>
        </Tabs>
        <div className="text-xs text-muted-foreground">
          <p>
            Notes: Hard-stop on duplicate serials across system, records upload date & uploaded-by, inline weight entry before issuing, filters by status/type/weight presence, pagination with selection persistence.
          </p>
        </div>
      </div>
    </StoreContext.Provider>
  );
}

