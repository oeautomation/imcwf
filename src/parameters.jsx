import React, { useMemo, useState } from "react";

// Types
 type FieldRole = "ADORNMENT" | "SUPPORTING";
 type FieldType = "boolean" | "integer" | "decimal" | "enum" | "datetime" | "text" | "attachment";
 type Visibility = "COA_INLINE" | "COA_FOOTNOTE" | "WORKSHEET_ONLY";

 type MethodAnalyteLite = { id: string; code: string; label: string };

 type AdornmentForm = {
   parent_ma_id?: string;
   visibility?: Visibility;
   adorn_print_label?: string;
   adorn_show_label?: boolean;
   adorn_print_order?: number;
   adorn_format?: string;
 };

 type SupportingForm = {
   supp_bind_key?: string;
   supp_default_value?: string;
   supp_carry_forward?: boolean;
   supp_precision?: number;
   validator_min?: number | undefined;
   validator_max?: number | undefined;
 };

 type CommonForm = {
   key: string;
   label: string;
   field_type: FieldType;
   role: FieldRole;
   required: boolean;
   enum_options?: string; // CSV when type=enum
 };

 type FormState = CommonForm & { adornment?: AdornmentForm; supporting?: SupportingForm };

 // Seed data (M×A options for Adornment wiring)
 const seedMAs: MethodAnalyteLite[] = [
   { id: "ma-212-1-ct", code: "2.12.1", label: "Legionella spp (enumeration) — CT" },
   { id: "ma-212-2-ct", code: "2.12.2", label: "L. pneumophila SG1 (confirm) — CT" },
   { id: "ma-24-1-gen", code: "2.4.1", label: "Total Coliform (MPN) — GEN" },
 ];

 // UI primitives
 function classNames(...xs: (string | false | undefined)[]) { return xs.filter(Boolean).join(" "); }
 function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
   return (
     <div className="mb-6">
       <div className="mb-3 flex items-center justify-between">
         <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
         {right}
       </div>
       <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">{children}</div>
     </div>
   );
 }
 function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
   return (
     <label className="grid gap-1 text-sm">
       <span className="font-medium text-slate-700">{label}</span>
       {children}
       {hint && <span className="text-xs text-slate-500">{hint}</span>}
     </label>
   );
 }
 function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
   return <input {...props} className={classNames("w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300", props.className)} />;
 }
 function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
   return <textarea {...props} className={classNames("w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300", props.className)} />;
 }
 function Select({ options, value, onChange }: { options: { label: string; value: string }[]; value?: string; onChange: (v: string) => void }) {
   return (
     <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300">
       {options.map((o) => (
         <option key={o.value} value={o.value}>{o.label}</option>
       ))}
     </select>
   );
 }
 function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
   return (
     <button type="button" onClick={() => onChange(!checked)} className={classNames("h-6 w-10 rounded-full transition flex items-center px-1", checked ? "bg-slate-900" : "bg-slate-300")}>
       <span className={classNames("h-4 w-4 rounded-full bg-white transition", checked ? "translate-x-4" : "translate-x-0")} />
     </button>
   );
 }
 function Button({ children, onClick, variant = "primary", type = "button" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "ghost"; type?: "button" | "submit" }) {
   const styles = variant === "primary" ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50";
   return (
     <button type={type} onClick={onClick} className={classNames("rounded-xl px-3 py-2 text-sm font-medium shadow-sm transition", styles)}>{children}</button>
   );
 }

 // Role-specific editors
 function AdornmentEditor({ value, onChange, mas }: { value: AdornmentForm; onChange: (v: AdornmentForm) => void; mas: MethodAnalyteLite[] }) {
   const v = value || {};
   return (
     <div className="grid grid-cols-2 gap-4">
       <Field label="Parent Method×Analyte">
         <Select value={v.parent_ma_id || ""} onChange={(x) => onChange({ ...v, parent_ma_id: x })} options={[{ label: "Select…", value: "" }, ...mas.map(m => ({ label: `${m.code} — ${m.label}`, value: m.id }))]} />
       </Field>
       <Field label="Visibility">
         <Select value={v.visibility || "COA_INLINE"} onChange={(x) => onChange({ ...v, visibility: x as Visibility })} options={[{ value: "COA_INLINE", label: "CoA inline" }, { value: "COA_FOOTNOTE", label: "CoA footnote" }, { value: "WORKSHEET_ONLY", label: "Worksheet only" }]} />
       </Field>
       <Field label="Print label override"><Input value={v.adorn_print_label || ""} onChange={(e) => onChange({ ...v, adorn_print_label: e.target.value })} /></Field>
       <Field label="Show label on CoA"><Toggle checked={v.adorn_show_label ?? true} onChange={(b) => onChange({ ...v, adorn_show_label: b })} /></Field>
       <Field label="Print order under parent"><Input type="number" value={typeof v.adorn_print_order === "number" ? v.adorn_print_order : 0} onChange={(e) => onChange({ ...v, adorn_print_order: Number(e.target.value) })} /></Field>
       <Field label="Format (tokens: {label} {value})"><Input placeholder="{label}: {value}" value={v.adorn_format || ""} onChange={(e) => onChange({ ...v, adorn_format: e.target.value })} /></Field>
     </div>
   );
 }

 function SupportingEditor({ value, onChange, fieldType }: { value: SupportingForm; onChange: (v: SupportingForm) => void; fieldType: FieldType }) {
   const v = value || {};
   const numeric = fieldType === "integer" || fieldType === "decimal";
   return (
     <div className="grid grid-cols-2 gap-4">
       <Field label="Bind key for calculations"><Input value={v.supp_bind_key || ""} onChange={(e) => onChange({ ...v, supp_bind_key: e.target.value })} /></Field>
       <Field label="Default value"><Input value={v.supp_default_value || ""} onChange={(e) => onChange({ ...v, supp_default_value: e.target.value })} /></Field>
       <Field label="Carry forward to repeats"><Toggle checked={!!v.supp_carry_forward} onChange={(b) => onChange({ ...v, supp_carry_forward: b })} /></Field>
       <Field label="Precision (decimals)"><Input type="number" value={typeof v.supp_precision === "number" ? v.supp_precision : (numeric ? 2 : 0)} onChange={(e) => onChange({ ...v, supp_precision: Number(e.target.value) })} /></Field>
       {numeric && (
         <>
           <Field label="Min"><Input type="number" value={typeof v.validator_min === "number" ? v.validator_min : (fieldType === "integer" ? 0 : 0)} onChange={(e) => onChange({ ...v, validator_min: Number(e.target.value) })} /></Field>
           <Field label="Max"><Input type="number" value={typeof v.validator_max === "number" ? v.validator_max : (fieldType === "integer" ? 300 : 999999)} onChange={(e) => onChange({ ...v, validator_max: Number(e.target.value) })} /></Field>
         </>
       )}
     </div>
   );
 }

 // Preview blocks
 function COAPreview({ form, mas }: { form: FormState; mas: MethodAnalyteLite[] }) {
   if (form.role !== "ADORNMENT") return null;
   const a = form.adornment || {};
   const parent = mas.find(m => m.id === a.parent_ma_id);
   const label = (a.adorn_show_label === false ? "" : (a.adorn_print_label || form.label)).trim();
   const val = "{value}";
   const formatted = (a.adorn_format || (label ? `${label}: ${val}` : val)).replace("{label}", label).replace("{value}", val);
   return (
     <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
       <div className="mb-1 text-slate-600">CoA line preview</div>
       <div className="font-medium text-slate-800">{parent ? `${parent.code} — ${parent.label}` : "Select parent MA"}</div>
       <div className="mt-1 text-slate-700">• {formatted} <span className="text-slate-400">({a.visibility || "COA_INLINE"})</span></div>
     </div>
   );
 }
 function WorksheetPreview({ form }: { form: FormState }) {
   return (
     <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
       <div className="mb-2 text-slate-600">Worksheet input preview</div>
       <div className="grid gap-2">
         <div className="text-slate-800">{form.label}{form.required ? " *" : ""}</div>
         {form.field_type === "enum" ? (
           <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
             {(form.enum_options || "").split(",").filter(Boolean).map((o) => <option key={o.trim()}>{o.trim()}</option>)}
           </select>
         ) : form.field_type === "boolean" ? (
           <div className="flex items-center gap-2"><input type="checkbox" /><span className="text-slate-700">Yes</span></div>
         ) : form.field_type === "attachment" ? (
           <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center">Drop file or click to upload</div>
         ) : (
           <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder={form.field_type === "decimal" ? "0.00" : ""} />
         )}
       </div>
     </div>
   );
 }

 // Main wireframe
 export default function AdornmentSupportingWireframe() {
   const [form, setForm] = useState<FormState>({
     key: "",
     label: "",
     field_type: "text",
     role: "ADORNMENT",
     required: false,
     enum_options: "",
     adornment: { visibility: "COA_INLINE", adorn_show_label: true, adorn_print_order: 0, adorn_format: "{label}: {value}" },
     supporting: { supp_carry_forward: false, supp_precision: 2 },
   });

   const canSave = useMemo(() => {
     if (!form.key || !form.label) return false;
     if (form.field_type === "enum" && !form.enum_options?.trim()) return false;
     if (form.role === "ADORNMENT") {
       const a = form.adornment || {};
       if (!a.parent_ma_id) return false;
     }
     return true;
   }, [form]);

   function save() {
     const payload = {
       key: form.key,
       label: form.label,
       field_type: form.field_type,
       role: form.role,
       required: form.required,
       enum_options: form.field_type === "enum" ? form.enum_options : undefined,
       // Role attrs
       ...(form.role === "ADORNMENT" ? { ...form.adornment } : {}),
       ...(form.role === "SUPPORTING" ? { ...form.supporting } : {}),
     };
     alert("Saved as\n" + JSON.stringify(payload, null, 2));
   }

   return (
     <div className="mx-auto max-w-6xl p-6">
       <div className="mb-6">
         <div className="text-2xl font-bold text-slate-900">Worksheet Field Wireframe</div>
         <div className="text-slate-600">Configure fields for roles <span className="font-medium">Adornment</span> and <span className="font-medium">Supporting</span>.</div>
       </div>

       <div className="grid grid-cols-2 gap-6">
         <Section title="Configure field" right={<span className="text-sm text-slate-500">Role: {form.role}</span>}>
           <div className="grid gap-4 p-4">
             <div className="grid grid-cols-2 gap-4">
               <Field label="Key"><Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="dilution / selected_plate" /></Field>
               <Field label="Label"><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Dilution factor" /></Field>
               <Field label="Type">
                 <Select value={form.field_type} onChange={(v) => setForm({ ...form, field_type: v as FieldType })} options={["boolean","integer","decimal","enum","datetime","text","attachment"].map(t => ({ value: t, label: t }))} />
               </Field>
               <Field label="Role">
                 <div className="flex gap-2">
                   {(["ADORNMENT","SUPPORTING"] as FieldRole[]).map(r => (
                     <button key={r} type="button" onClick={() => setForm({ ...form, role: r })} className={classNames("rounded-xl px-3 py-2 text-sm font-medium border", form.role === r ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200")}>{r}</button>
                   ))}
                 </div>
               </Field>
               <Field label="Required"><Toggle checked={form.required} onChange={(b) => setForm({ ...form, required: b })} /></Field>
               {form.field_type === "enum" && (
                 <Field label="Enum options (CSV)"><Textarea rows={2} value={form.enum_options} onChange={(e) => setForm({ ...form, enum_options: e.target.value })} placeholder="Direct,Acid,Heat" /></Field>
               )}
             </div>

             {form.role === "ADORNMENT" && (
               <Section title="Adornment details">
                 <div className="p-4">
                   <AdornmentEditor value={form.adornment || {}} onChange={(v) => setForm({ ...form, adornment: v })} mas={seedMAs} />
                 </div>
               </Section>
             )}

             {form.role === "SUPPORTING" && (
               <Section title="Supporting details">
                 <div className="p-4">
                   <SupportingEditor value={form.supporting || {}} onChange={(v) => setForm({ ...form, supporting: v })} fieldType={form.field_type} />
                 </div>
               </Section>
             )}

             <div className="flex items-center justify-end gap-3">
               <Button variant="ghost" onClick={() => window.location.reload()}>Reset</Button>
               <Button onClick={save} type="button">Save</Button>
             </div>
           </div>
         </Section>

         <Section title="Live preview">
           <div className="grid gap-4 p-4">
             <WorksheetPreview form={form} />
             <COAPreview form={form} mas={seedMAs} />
             <div className="rounded-xl border border-slate-200 p-3 text-xs text-slate-600">
               <div className="mb-2 font-semibold text-slate-700">Payload</div>
               <pre className="overflow-auto whitespace-pre-wrap">{JSON.stringify({
                 key: form.key,
                 label: form.label,
                 field_type: form.field_type,
                 role: form.role,
                 required: form.required,
                 enum_options: form.field_type === "enum" ? form.enum_options : undefined,
                 ...(form.role === "ADORNMENT" ? { ...form.adornment } : {}),
                 ...(form.role === "SUPPORTING" ? { ...form.supporting } : {}),
               }, null, 2)}</pre>
             </div>
           </div>
         </Section>
       </div>
     </div>
   );
 }
