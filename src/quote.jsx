import React, { useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Italic,
  Upload,
  Underline,
  XCircle,
  CheckCircle2,
  Download,
  Eye,
  List,
  ListOrdered,
  Link2,
  RemoveFormatting,
  Undo2,
  Redo2,
} from "lucide-react";
import { testDetailTemplates } from "./quote-test-templates";

const opportunity = {
  id: "OPP-2026-001",
  status: "Proposal",
  customerName: "CB Richard Ellis Pty Ltd",
  customerCode: "CBR",
  branch: "CBRSA",
  siteAddress: "11, 80, King William Street, ADELAIDE, SA, 5000",
  priceBook: "Standard Itemised",
  createdOn: "28 Mar 2026, 9:32 AM",
  lastModified: "Not specified",
};

const latestJobSnapshot = {
  generatedAt: "28 Mar 2026, 9:40 AM",
  rows: [
    {
      id: "r1",
      jobCode: "CBR10-360",
      sampleType: "Water",
      tests: ["Legionella", "HPC"],
      locationCount: 2,
      frequencyPerYear: 12,
      prices: { Legionella: 40, HPC: 20 },
      matchedDetail: {
        title: "Cooling Tower Legionella + HPC",
        content:
          "Cooling Tower & Condenser Water Systems, Thermostatic Mixing Valves & Water Features\n\nStandard: AS/NZS 3896:2017 & AS 4276.3.2:2003; AS4276.3.1:2007\n\nStatus: This testing is accredited with NATA.",
      },
    },
    {
      id: "r2",
      jobCode: "CBR10-360",
      sampleType: "Water",
      tests: ["HPC"],
      locationCount: 1,
      frequencyPerYear: 12,
      prices: { HPC: 20 },
      matchedDetail: {
        title: "HPC Monitoring",
        content:
          "Heterotrophic Plate Count monitoring for cooling tower systems.\n\nStandard: AS 4276.3.2:2003; AS4276.3.1:2007\n\nStatus: This testing is accredited with NATA.",
      },
    },
  ],
};

const quotationHistorySeed = [];

function money(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(value);
}

function buildRowsFromLatestJob(jobSnapshot) {
  return jobSnapshot.rows.map((row, index) => {
    const testsLabel = row.tests.join(" / ");
    const samplesPA = row.locationCount * row.frequencyPerYear;
    const costPerSample = Object.values(row.prices).reduce((sum, v) => sum + v, 0);
    return {
      id: `gen-${index + 1}`,
      jobCode: row.jobCode,
      sampleType: row.sampleType,
      testsLabel,
      samplesPA,
      costPerSample,
      costPA: samplesPA * costPerSample,
      testDetailsTemplateId: "",
      testDetailsTitle: "",
      testDetails: "",
    };
  });
}

function hydrateQuotationRows(rows) {
  return rows.map((row) => {
    const matchedTemplate =
      testDetailTemplates.find((template) => template.title === row.testDetailsTitle) || null;
    return {
      ...row,
      testDetailsTemplateId: row.testDetailsTemplateId || matchedTemplate?.id || "",
    };
  });
}

function hasTestDetails(row) {
  return Boolean(row.testDetailsTitle?.trim() && row.testDetails?.trim());
}

function badgeClass(status) {
  if (status === "Pending") return "border-[#E8A357] bg-[#FFF4E8] text-[#D17A16]";
  if (status === "Accepted") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function opportunityStatusClass(status) {
  if (status === "Won") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-[#E8A357] bg-[#FFF4E8] text-[#D17A16]";
}

function RuleChip({ label, tone = "slate" }) {
  const styles = {
    slate: "border-slate-200 bg-slate-100 text-slate-700",
    amber: "border-[#E8A357] bg-[#FFF4E8] text-[#D17A16]",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    blue: "border-sky-200 bg-sky-50 text-sky-700",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>
      {label}
    </span>
  );
}

function AppButton({ children, variant = "primary", onClick, disabled = false, icon: Icon, className = "", ...props }) {
  const styles = {
    primary:
      "bg-[#33445E] text-white border border-[#33445E] hover:bg-[#2B3A50]",
    secondary:
      "bg-white text-[#33445E] border border-slate-300 hover:bg-slate-50",
    ghost: "bg-transparent text-[#33445E] border border-transparent hover:bg-slate-100",
    danger: "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50",
    muted: "bg-[#F3F6FA] text-[#33445E] border border-[#D8E0EA] hover:bg-[#EAF0F6]",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...props}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function IconButton({ icon: Icon, label, onClick, variant = "muted", className = "" }) {
  const styles = {
    muted: "border border-[#D8E0EA] bg-[#F3F6FA] text-[#33445E] hover:bg-[#EAF0F6]",
    danger: "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition ${styles[variant]} ${className}`}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function Panel({ title, right, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h3 className="text-[18px] font-semibold text-slate-900">{title}</h3>
          <div>{right}</div>
        </div>
      )}
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}

function LabelValue({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="text-[13px] font-semibold text-slate-900">{label}</div>
      <div className="text-[14px] leading-6 text-slate-800">{value}</div>
    </div>
  );
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeEditorHtml(value = "") {
  if (!value) return "";
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  return escapeHtml(value)
    .replaceAll("\n\n", "</p><p>")
    .replaceAll("\n", "<br />");
}

function FormattedTextarea({ value, onChange, placeholder = "" }) {
  const editorRef = useRef(null);
  const htmlValue = normalizeEditorHtml(value);

  React.useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== htmlValue) {
      editorRef.current.innerHTML = htmlValue;
    }
  }, [htmlValue]);

  function runCommand(command, commandValue = null) {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current.innerHTML);
  }

  function setBlock(block) {
    runCommand("formatBlock", block);
  }

  function setLink() {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const url = window.prompt("Enter link URL");
    if (!url) return;
    runCommand("createLink", url);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1">
          <button
            type="button"
            onClick={() => setBlock("h1")}
            className="rounded-md px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => setBlock("h2")}
            className="rounded-md px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => setBlock("p")}
            className="rounded-md px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            P
          </button>
        </div>

        {[
          { icon: Bold, label: "Bold", command: "bold" },
          { icon: Italic, label: "Italic", command: "italic" },
          { icon: Underline, label: "Underline", command: "underline" },
          { icon: List, label: "Bullets", command: "insertUnorderedList" },
          { icon: ListOrdered, label: "Numbering", command: "insertOrderedList" },
          { icon: AlignLeft, label: "Align left", command: "justifyLeft" },
          { icon: AlignCenter, label: "Align center", command: "justifyCenter" },
          { icon: AlignRight, label: "Align right", command: "justifyRight" },
          { icon: AlignJustify, label: "Justify", command: "justifyFull" },
          { icon: Undo2, label: "Undo", command: "undo" },
          { icon: Redo2, label: "Redo", command: "redo" },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            title={item.label}
            aria-label={item.label}
            onClick={() => runCommand(item.command)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
          >
            <item.icon className="h-4 w-4" strokeWidth={2} />
          </button>
        ))}

        <button
          type="button"
          title="Insert link"
          aria-label="Insert link"
          onClick={setLink}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
        >
          <Link2 className="h-4 w-4" strokeWidth={2} />
        </button>

        <button
          type="button"
          title="Clear formatting"
          aria-label="Clear formatting"
          onClick={() => runCommand("removeFormat")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
        >
          <RemoveFormatting className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="min-h-[240px] w-full overflow-auto px-4 py-3 text-sm leading-6 text-slate-800 outline-none [overflow-wrap:anywhere] break-all empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] [&_a]:text-sky-700 [&_a]:underline [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:ml-5 [&_ul]:list-disc"
      />
    </div>
  );
}

function OpportunitySidebar({ status }) {
  return (
    <Panel title="Opportunity" className="h-fit">
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="text-[13px] font-semibold text-slate-900">Status</div>
          <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${opportunityStatusClass(status)}`}>
            <span>{status}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
        <LabelValue label="Customer Name" value={opportunity.customerName} />
        <LabelValue label="Customer Code" value={opportunity.customerCode} />
        <LabelValue label="Branch" value={opportunity.branch} />
        <LabelValue label="Site Address" value={opportunity.siteAddress} />
        <LabelValue label="Price-book" value={opportunity.priceBook} />
        <LabelValue label="Created On" value={opportunity.createdOn} />
        <LabelValue label="Last Modified" value={opportunity.lastModified} />
      </div>
    </Panel>
  );
}

function JobsPanel({ jobStatus }) {
  const isDraft = jobStatus === "Draft";
  return (
    <Panel
      title="Jobs"
      right={<AppButton icon={Plus}>Add New Job</AppButton>}
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-white text-[#577090]">
            <tr>
              {[
                "Created Date",
                "Job Category",
                "Job Code",
                "Job Purchase Orders",
                "Job Status",
                "Sample Type",
                "Total Price",
              ].map((head) => (
                <th key={head} className="px-5 py-5 font-medium">
                  <div className="flex items-center gap-2">
                    <span>{head}</span>
                    <span className="text-slate-400">↕</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200 bg-white text-slate-800">
              <td className="px-5 py-4">28 Mar 2026, 9:34 AM</td>
              <td className="px-5 py-4">WATER</td>
              <td className="px-5 py-4">CBR10-360</td>
              <td className="px-5 py-4">--</td>
              <td className="px-5 py-4">
                <span className={`rounded-lg border px-3 py-1 text-sm ${isDraft ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#E8A357] bg-[#FFF4E8] text-[#D17A16]"}`}>
                  {jobStatus}
                </span>
              </td>
              <td className="px-5 py-4">--</td>
              <td className="px-5 py-4">70</td>
            </tr>
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-[14px] text-[#577090]">
          <div>Showing 1-1 of 1 records</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-slate-700">
                <span>10</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            <span className="font-semibold text-slate-700">Page 1 of 1</span>
            <div className="flex gap-3 text-slate-400">
              <ChevronsLeft className="h-5 w-5" />
              <span>Prev</span>
              <span>Next</span>
              <ChevronsRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function JobCardsPanel() {
  return (
    <Panel title="Job Cards">
      <div className="w-[236px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-[70px_1fr] gap-y-4 text-[14px] text-slate-800">
          <div className="font-semibold text-slate-900">Location Name</div>
          <div>
            Gordon <u>Corporate Centre</u>
          </div>
          <div className="font-semibold text-slate-900">Customer Code</div>
          <div>CBR</div>
        </div>
        <AppButton icon={Plus} variant="muted" className="mt-5 w-full justify-center">
          Create Job Card
        </AppButton>
      </div>
    </Panel>
  );
}

function QuotationList({ quotations, hasPendingQuotation, hasAcceptedQuotation, onView, onEdit, onDownload, onAccept, onReject, onRegenerate, onGenerate, onShowRules }) {
  return (
    <Panel
      title="Quotation"
      right={
        <div className="flex gap-3">
          <AppButton icon={FileText} variant="ghost" onClick={onShowRules}>
            Business Rules
          </AppButton>
          {!hasAcceptedQuotation && hasPendingQuotation ? (
            <AppButton icon={RefreshCw} variant="secondary" onClick={onRegenerate}>
              Regenerate Quotation
            </AppButton>
          ) : null}
          {!hasAcceptedQuotation && !hasPendingQuotation ? (
            <AppButton icon={RefreshCw} onClick={onGenerate}>
              Generate Quotation
            </AppButton>
          ) : null}
        </div>
      }
    >
      {quotations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
          No quotations available.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-white text-[#577090]">
              <tr>
                {[
                  "Quotation ID",
                  "Version",
                  "Status",
                  "Created Date",
                  "Created By",
                  "Rejection Reason",
                  "Actions",
                ].map((head) => (
                  <th key={head} className="px-5 py-4 font-medium">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id} className="border-t border-slate-200 bg-white align-top text-slate-800">
                  <td className="px-5 py-4 font-semibold text-slate-900">{q.id}</td>
                  <td className="px-5 py-4">{q.version}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-lg border px-3 py-1 text-sm ${badgeClass(q.status)}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">{q.createdDate}</td>
                  <td className="px-5 py-4">{q.createdBy}</td>
                  <td className="px-5 py-4 text-slate-600">{q.rejectionReason || "--"}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <IconButton variant="muted" icon={Eye} label={`View ${q.id}`} onClick={() => onView(q)} />
                      <IconButton variant="muted" icon={Download} label={`Download ${q.id}`} onClick={() => onDownload(q)} />
                      {q.status === "Pending" && (
                        <>
                          <IconButton variant="muted" icon={Pencil} label={`Edit ${q.id}`} onClick={() => onEdit(q)} />
                          <IconButton variant="muted" icon={CheckCircle2} label={`Accept ${q.id}`} onClick={() => onAccept(q)} />
                          <IconButton variant="danger" icon={XCircle} label={`Reject ${q.id}`} onClick={() => onReject(q)} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function BusinessRulesDrawer({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/25">
      <div className="absolute inset-y-0 right-0 w-full max-w-[460px] border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <div className="text-[20px] font-semibold text-slate-900">Business Rules</div>
            <div className="mt-1 text-sm text-slate-500">Prototype flow logic for quotation, opportunity, and job states.</div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="h-full overflow-auto px-6 py-5">
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">Quotation Actions</div>
              <div className="mb-3 flex flex-wrap gap-2">
                <RuleChip label="Generate" tone="blue" />
                <RuleChip label="Regenerate" tone="blue" />
                <RuleChip label="Accepted" tone="green" />
              </div>
              <div className="space-y-2 text-sm leading-6 text-slate-700">
                <div>Show <strong>Generate Quotation</strong> only when there is no pending quotation and no accepted quotation.</div>
                <div>Show <strong>Regenerate Quotation</strong> only when there is one pending quotation and no accepted quotation.</div>
                <div>If a quotation is accepted, hide both actions.</div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">Regeneration Logic</div>
              <div className="mb-3 flex flex-wrap gap-2">
                <RuleChip label="Pending" tone="amber" />
                <RuleChip label="Rejected" tone="red" />
              </div>
              <div className="space-y-2 text-sm leading-6 text-slate-700">
                <div>Regeneration is available only when a pending quotation already exists.</div>
                <div>The existing pending quotation is auto-rejected with reason <strong>Auto Rejected by Regeneration</strong>.</div>
                <div>A fresh quotation generation flow starts using the latest job data.</div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">Acceptance Effects</div>
              <div className="mb-3 flex flex-wrap gap-2">
                <RuleChip label="Accepted" tone="green" />
                <RuleChip label="Won" tone="green" />
                <RuleChip label="Draft" tone="green" />
              </div>
              <div className="space-y-2 text-sm leading-6 text-slate-700">
                <div>Accepting a quotation marks that quotation as <strong>Accepted</strong>.</div>
                <div>The opportunity status changes to <strong>Won</strong> in the top-right status control.</div>
                <div>The job status changes to <strong>Draft</strong> and uses green success styling.</div>
                <div>Signed quotation availability is turned on for the accepted record.</div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">Row Actions</div>
              <div className="mb-3 flex flex-wrap gap-2">
                <RuleChip label="View" tone="slate" />
                <RuleChip label="Download" tone="slate" />
                <RuleChip label="Edit" tone="slate" />
                <RuleChip label="Accept" tone="green" />
                <RuleChip label="Reject" tone="red" />
              </div>
              <div className="space-y-2 text-sm leading-6 text-slate-700">
                <div>All quotations can be viewed and downloaded.</div>
                <div>Only pending quotations can be edited, accepted, or rejected.</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailLinkModal({ row, open, onClose, onSave }) {
  const [templateId, setTemplateId] = useState(row?.testDetailsTemplateId || "");
  const [title, setTitle] = useState(row?.testDetailsTitle || "");
  const [content, setContent] = useState(row?.testDetails || "");
  const [error, setError] = useState("");
  const isQuoteOnly = !templateId;

  React.useEffect(() => {
    setTemplateId(row?.testDetailsTemplateId || "");
    setTitle(row?.testDetailsTitle || "");
    setContent(row?.testDetails || "");
    setError("");
  }, [row]);

  function handleTemplateChange(nextTemplateId) {
    setTemplateId(nextTemplateId);
    const template = testDetailTemplates.find((item) => item.id === nextTemplateId);
    if (!template) return;
    setTitle(template.title);
    setContent(template.content);
    setError("");
  }

  function handleSave() {
    if (!title.trim() || !content.trim()) {
      setError("Select a template or enter a new detail before saving.");
      return;
    }

    onSave({
      title,
      content,
      templateId,
    });
  }

  if (!open || !row) return null;
  return (
    <ModalShell onClose={onClose} title="Test Details" extraWide>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">Built-in template</label>
          <select
            value={templateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
          >
            <option value="">Create quote-only detail</option>
            {testDetailTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.title}
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs text-slate-500">
            Select one of the built-in templates or keep this on quote-only detail and enter custom content below.
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isQuoteOnly ? "Enter quote-only test detail title" : ""}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">Content</label>
          <FormattedTextarea
            value={content}
            onChange={setContent}
            rows={10}
            placeholder={
              isQuoteOnly
                ? "Enter quote-only test details. Supports long unbroken text and lightweight formatting."
                : "Enter test details. Supports long unbroken text and lightweight formatting."
            }
          />
        </div>
        {error ? <div className="text-sm font-medium text-rose-600">{error}</div> : null}
        <div className="flex justify-end gap-3">
          <AppButton variant="secondary" onClick={onClose}>Cancel</AppButton>
          <AppButton onClick={handleSave}>Save</AppButton>
        </div>
      </div>
    </ModalShell>
  );
}

function QuotationFormModal({
  mode,
  quotation,
  open,
  onClose,
  onSubmit,
  customer,
}) {
  const [rows, setRows] = useState([]);
  const [note, setNote] = useState("");
  const [detailRow, setDetailRow] = useState(null);
  const [rowErrors, setRowErrors] = useState({});

  React.useEffect(() => {
    if (!open) return;
    if (mode === "edit" && quotation) {
      setRows(hydrateQuotationRows(quotation.rows));
      setNote(quotation.commonNote || "");
    } else {
      setRows(buildRowsFromLatestJob(latestJobSnapshot));
      setNote("");
    }
    setRowErrors({});
  }, [open, mode, quotation]);

  const total = useMemo(() => rows.reduce((sum, r) => sum + r.costPA, 0), [rows]);

  if (!open) return null;
  const title = mode === "edit" ? `Edit ${quotation?.id}` : "Generate Quotation";

  function setRowValue(rowId, updater) {
    setRows((prev) => prev.map((row) => (row.id === rowId ? updater(row) : row)));
    setRowErrors((prev) => {
      if (!prev[rowId]) return prev;
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  }

  function handleSubmit() {
    const nextErrors = rows.reduce((acc, row) => {
      if (!hasTestDetails(row)) {
        acc[row.id] = "Select a template or create a new detail.";
      }
      return acc;
    }, {});

    if (Object.keys(nextErrors).length) {
      setRowErrors(nextErrors);
      return;
    }

    onSubmit(rows, note);
  }

  return (
    <>
      <ModalShell onClose={onClose} title={title} wide>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div><span className="font-semibold text-slate-900">Customer:</span> {customer.customerName}</div>
            <div><span className="font-semibold text-slate-900">Customer Code:</span> {customer.customerCode}</div>
            <div><span className="font-semibold text-slate-900">Branch:</span> {customer.branch}</div>
            <div><span className="font-semibold text-slate-900">Site Address:</span> {customer.siteAddress}</div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-[#577090]">
                <tr>
                  {[
                    "Job Code",
                    "Sample Type",
                    "Tests to be Performed",
                    "No. of Samples P.A.",
                    "Cost per Sample",
                    "Cost P.A.",
                    "Test Details",
                  ].map((head) => (
                    <th key={head} className="px-4 py-4 font-medium">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-4">{row.jobCode}</td>
                    <td className="px-4 py-4">{row.sampleType}</td>
                    <td className="px-4 py-4">
                      <input
                        value={row.testsLabel}
                        onChange={(e) => {
                          const next = [...rows];
                          next[idx].testsLabel = e.target.value;
                          setRows(next);
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
                      />
                    </td>
                    <td className="px-4 py-4">{row.samplesPA}</td>
                    <td className="px-4 py-4">{money(row.costPerSample)}</td>
                    <td className="px-4 py-4">{money(row.costPA)}</td>
                    <td className="px-4 py-4">
                      <div className="space-y-3">
                        <button
                          type="button"
                          className="font-semibold text-[#33445E] underline decoration-slate-300 underline-offset-4"
                          onClick={() => setDetailRow(row)}
                        >
                          {hasTestDetails(row) ? row.testDetailsTitle : "Add test details"}
                        </button>
                        {rowErrors[row.id] ? (
                          <div className="text-xs font-medium text-rose-600">{rowErrors[row.id]}</div>
                        ) : !hasTestDetails(row) ? (
                          <div className="text-xs text-slate-500">
                            Required. Choose a built-in template or create a quote-only detail in the popup.
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td colSpan={5} className="px-4 py-4 text-right font-semibold text-slate-900">Total</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">{money(total)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">Common Note (Optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
              placeholder="Enter note applicable to the full quotation"
            />
          </div>

          <div className="flex justify-end gap-3">
            <AppButton variant="secondary" onClick={onClose}>Cancel</AppButton>
            <AppButton onClick={handleSubmit}>{mode === "edit" ? "Save" : "Generate Quotation"}</AppButton>
          </div>
        </div>
      </ModalShell>

      <DetailLinkModal
        open={!!detailRow}
        row={detailRow}
        onClose={() => setDetailRow(null)}
        onSave={(updated) => {
          setRowValue(detailRow.id, (row) => ({
            ...row,
            testDetailsTemplateId: updated.templateId || "",
            testDetailsTitle: updated.title,
            testDetails: updated.content,
          }));
          setDetailRow(null);
        }}
      />
    </>
  );
}

function QuotationDetailModal({ quotation, open, onClose, onDownloadGenerated, onDownloadSigned, onEdit, onAccept, onReject }) {
  if (!open || !quotation) return null;
  const total = quotation.rows.reduce((sum, r) => sum + r.costPA, 0);

  return (
    <ModalShell onClose={onClose} title={`Quotation Details — ${quotation.id}`} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-700">
            <div><span className="font-semibold text-slate-900">Opportunity:</span> {opportunity.customerName}</div>
            <div><span className="font-semibold text-slate-900">Status:</span> <span className={`rounded-lg border px-2 py-1 text-xs ${badgeClass(quotation.status)}`}>{quotation.status}</span></div>
            <div><span className="font-semibold text-slate-900">Created Date:</span> {quotation.createdDate}</div>
            <div><span className="font-semibold text-slate-900">Created By:</span> {quotation.createdBy}</div>
            {quotation.rejectionReason ? <div className="col-span-2"><span className="font-semibold text-slate-900">Rejection Reason:</span> {quotation.rejectionReason}</div> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <AppButton variant="secondary" icon={Download} onClick={() => onDownloadGenerated(quotation)}>Download</AppButton>
            {quotation.status === "Pending" ? (
              <>
                <AppButton variant="secondary" icon={Pencil} onClick={() => onEdit(quotation)}>Edit</AppButton>
                <AppButton icon={CheckCircle2} onClick={() => onAccept(quotation)}>Accept</AppButton>
                <AppButton variant="danger" icon={XCircle} onClick={() => onReject(quotation)}>Reject</AppButton>
              </>
            ) : null}
            {quotation.status === "Accepted" && quotation.documents.signedQuotation ? (
              <AppButton variant="secondary" icon={Download} onClick={() => onDownloadSigned(quotation)}>Download Signed</AppButton>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-[#577090]">
              <tr>
                {[
                  "Job Code",
                  "Sample Type",
                  "Tests to be Performed",
                  "No. of Samples P.A.",
                  "Cost per Sample",
                  "Cost P.A.",
                  "Test Details",
                ].map((head) => (
                  <th key={head} className="px-4 py-4 font-medium">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quotation.rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200 align-top">
                  <td className="px-4 py-4">{row.jobCode}</td>
                  <td className="px-4 py-4">{row.sampleType}</td>
                  <td className="px-4 py-4">{row.testsLabel}</td>
                  <td className="px-4 py-4">{row.samplesPA}</td>
                  <td className="px-4 py-4">{money(row.costPerSample)}</td>
                  <td className="px-4 py-4">{money(row.costPA)}</td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-[#33445E]">{row.testDetailsTitle}</div>
                    <div
                      className="mt-2 text-slate-600 [overflow-wrap:anywhere] break-all [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:ml-5 [&_ul]:list-disc"
                      dangerouslySetInnerHTML={{ __html: normalizeEditorHtml(row.testDetails) }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td colSpan={5} className="px-4 py-4 text-right font-semibold text-slate-900">Total</td>
                <td className="px-4 py-4 font-semibold text-slate-900">{money(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 text-sm font-semibold text-slate-900">Common Note</div>
          <div className="text-sm text-slate-700">{quotation.commonNote || "--"}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-slate-900">Documents</div>
          <div className="flex flex-wrap gap-3">
            <AppButton variant="muted" icon={Download} onClick={() => onDownloadGenerated(quotation)}>Generated Quotation</AppButton>
            {quotation.status === "Accepted" && quotation.documents.signedQuotation ? (
              <AppButton variant="muted" icon={Download} onClick={() => onDownloadSigned(quotation)}>Signed Quotation</AppButton>
            ) : null}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function AcceptModal({ quotation, open, onClose, onConfirm }) {
  const [confirmed, setConfirmed] = useState(false);
  if (!open || !quotation) return null;
  return (
    <ModalShell title={`Accept ${quotation.id}`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">Upload Signed Quotation</label>
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            <Upload className="h-4 w-4" />
            Signed quotation file upload placeholder
          </div>
        </div>
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1" />
          <span>I confirm that the signed quotation has been uploaded and the customer has accepted the quotation.</span>
        </label>
        <div className="flex justify-end gap-3">
          <AppButton variant="secondary" onClick={onClose}>Cancel</AppButton>
          <AppButton disabled={!confirmed} onClick={onConfirm}>Accept</AppButton>
        </div>
      </div>
    </ModalShell>
  );
}

function ConfirmModal({ title, message, confirmLabel = "Confirm", open, onClose, onConfirm, danger = false }) {
  if (!open) return null;
  return (
    <ModalShell title={title} onClose={onClose}>
      <div className="space-y-5 text-sm text-slate-700">
        <p>{message}</p>
        <div className="flex justify-end gap-3">
          <AppButton variant="secondary" onClick={onClose}>Cancel</AppButton>
          <AppButton variant={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</AppButton>
        </div>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, children, onClose, wide = false, extraWide = false }) {
  const widthClass = extraWide ? "w-[1120px]" : wide ? "w-[1180px]" : "w-[640px]";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-6">
      <div className={`max-h-[92vh] overflow-auto rounded-3xl bg-white shadow-2xl ${widthClass}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="text-[20px] font-semibold text-slate-900">{title}</div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function QuotationOpportunityPage() {
  const [quotations, setQuotations] = useState(quotationHistorySeed);
  const [formMode, setFormMode] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showAccept, setShowAccept] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [toast, setToast] = useState("");

  const pendingQuotation = quotations.find((q) => q.status === "Pending") || null;
  const acceptedQuotation = quotations.find((q) => q.status === "Accepted") || null;
  const opportunityStatus = acceptedQuotation ? "Won" : opportunity.status;
  const jobStatus = acceptedQuotation ? "Draft" : "Pending";

  function nextVersion() {
    return quotations.length ? Math.max(...quotations.map((q) => q.version)) + 1 : 1;
  }

  function buildQuotationPayload(rows, note) {
    const version = nextVersion();
    return {
      id: `QT-${String(version).padStart(4, "0")}`,
      version,
      status: "Pending",
      createdDate: new Date().toLocaleString("en-AU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      createdBy: "John Tan",
      rejectionReason: "",
      commonNote: note,
      source: "snapshot",
      rows,
      documents: {
        generatedQuotation: true,
        signedQuotation: false,
      },
    };
  }

  function openGenerateFlow() {
    if (acceptedQuotation) return;
    if (pendingQuotation) {
      setConfirmRegenerate(true);
      return;
    }
    setSelectedQuotation(null);
    setFormMode("generate");
  }

  function handleGenerate(rows, note) {
    setQuotations((prev) => [buildQuotationPayload(rows, note), ...prev]);
    setFormMode(null);
    setToast("Quotation generated in Pending status.");
  }

  function handleSaveEdit(rows, note) {
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === selectedQuotation.id
          ? { ...q, rows, commonNote: note }
          : q
      )
    );
    setFormMode(null);
    setSelectedQuotation(null);
    setToast("Pending quotation updated.");
  }

  function handleReject(quotation, reason = "Rejected by User") {
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quotation.id
          ? { ...q, status: "Rejected", rejectionReason: reason }
          : q
      )
    );
    setConfirmReject(false);
    setSelectedQuotation(null);
    setShowDetail(false);
    setToast(reason === "Rejected by User" ? "Quotation rejected." : "Existing pending quotation rejected and regeneration started.");
  }

  function handleAcceptConfirm() {
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === selectedQuotation.id
          ? {
              ...q,
              status: "Accepted",
              documents: { ...q.documents, signedQuotation: true },
            }
          : q
      )
    );
    setShowAccept(false);
    setSelectedQuotation(null);
    setShowDetail(false);
    setToast("Quotation accepted. Opportunity is now won; jobs remain Draft.");
  }

  function startRegenerateFlow() {
    if (acceptedQuotation) return;
    if (pendingQuotation) {
      setQuotations((prev) =>
        prev.map((q) =>
          q.id === pendingQuotation.id
            ? { ...q, status: "Rejected", rejectionReason: "Auto Rejected by Regeneration" }
            : q
        )
      );
    }
    setConfirmRegenerate(false);
    setSelectedQuotation(null);
    setFormMode("generate");
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] px-7 py-5 text-slate-900">
      <div className="mx-auto max-w-[1720px]">
        <h1 className="mb-5 text-[28px] font-semibold tracking-tight text-slate-950">Opportunity</h1>
        <AppButton icon={ArrowLeft} className="mb-5 min-w-[180px] justify-center">Back</AppButton>

        {toast ? (
          <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            {toast}
          </div>
        ) : null}

        <div className="grid grid-cols-[1fr_390px] gap-5">
          <div className="space-y-5">
            <JobsPanel jobStatus={jobStatus} />
            <JobCardsPanel />
            <QuotationList
              quotations={quotations}
              hasPendingQuotation={!!pendingQuotation}
              hasAcceptedQuotation={!!acceptedQuotation}
              onGenerate={openGenerateFlow}
              onRegenerate={() => setConfirmRegenerate(true)}
              onShowRules={() => setShowRules(true)}
              onView={(q) => {
                setSelectedQuotation(q);
                setShowDetail(true);
              }}
              onEdit={(q) => {
                setSelectedQuotation(q);
                setFormMode("edit");
              }}
              onDownload={(q) => {
                setToast(`Downloading ${q.id} generated quotation.`);
              }}
              onAccept={(q) => {
                setSelectedQuotation(q);
                setShowAccept(true);
              }}
              onReject={(q) => {
                setSelectedQuotation(q);
                setConfirmReject(true);
              }}
            />
          </div>

          <OpportunitySidebar status={opportunityStatus} />
        </div>
      </div>

      <QuotationFormModal
        open={formMode === "generate" || formMode === "edit"}
        mode={formMode}
        quotation={selectedQuotation}
        customer={opportunity}
        onClose={() => {
          setFormMode(null);
          setSelectedQuotation(null);
        }}
        onSubmit={(rows, note) => {
          if (formMode === "edit") handleSaveEdit(rows, note);
          else handleGenerate(rows, note);
        }}
      />

      <BusinessRulesDrawer
        open={showRules}
        onClose={() => setShowRules(false)}
      />

      <QuotationDetailModal
        open={showDetail}
        quotation={selectedQuotation}
        onClose={() => {
          setShowDetail(false);
          setSelectedQuotation(null);
        }}
        onDownloadGenerated={(q) => setToast(`Downloading ${q.id} generated quotation.`)}
        onDownloadSigned={(q) => setToast(`Downloading ${q.id} signed quotation.`)}
        onEdit={(q) => {
          setShowDetail(false);
          setSelectedQuotation(q);
          setFormMode("edit");
        }}
        onAccept={(q) => {
          setShowDetail(false);
          setSelectedQuotation(q);
          setShowAccept(true);
        }}
        onReject={(q) => {
          setShowDetail(false);
          setSelectedQuotation(q);
          setConfirmReject(true);
        }}
      />

      <AcceptModal
        open={showAccept}
        quotation={selectedQuotation}
        onClose={() => {
          setShowAccept(false);
          setSelectedQuotation(null);
        }}
        onConfirm={handleAcceptConfirm}
      />

      <ConfirmModal
        open={confirmReject}
        title="Reject Quotation"
        message="Are you sure you want to reject?"
        confirmLabel="Reject"
        danger
        onClose={() => {
          setConfirmReject(false);
          setSelectedQuotation(null);
        }}
        onConfirm={() => handleReject(selectedQuotation)}
      />

      <ConfirmModal
        open={confirmRegenerate}
        title="Regenerate Quotation"
        message={pendingQuotation ? "A pending quotation already exists. Regenerating will automatically reject the existing pending quotation and rebuild a new one using the latest jobs attached to the opportunity. Do you want to continue?" : "Regeneration will rebuild a new quotation using the latest jobs attached to the opportunity. Do you want to continue?"}
        confirmLabel="Continue"
        onClose={() => setConfirmRegenerate(false)}
        onConfirm={startRegenerateFlow}
      />
    </div>
  );
}
