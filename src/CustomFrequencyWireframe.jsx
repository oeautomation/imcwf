import React, { useMemo, useState } from "react";

const FREQ_OPTIONS = ["Daily", "Weekly", "Monthly", "Yearly", "Fortnight", "One time"];
const DAYS_1_31 = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function isValidDateStr(v) {
  if (!v) return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
}

function toDate(v) {
  return isValidDateStr(v) ? new Date(v) : null;
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return aStart <= bEnd && bStart <= aEnd;
}

export default function CustomFrequencyWireframe() {
  const [jobFrequency, setJobFrequency] = useState("Daily");
  const [rows, setRows] = useState([
    {
      id: uid(),
      start: "",
      end: "",
      freq: "Weekly",
      monthlyDay: "",
      monthlyInterval: "1",
      weeklyDays: [],
      yearlyDay: "",
      yearlyMonth: "",
    },
  ]);

  const [mainMonthlyDay, setMainMonthlyDay] = useState("");
  const [mainMonthlyInterval, setMainMonthlyInterval] = useState("1");
  const [mainWeeklyDays, setMainWeeklyDays] = useState([]);
  const [mainYearlyDay, setMainYearlyDay] = useState("");
  const [mainYearlyMonth, setMainYearlyMonth] = useState("");

  const addRow = () => {
    setRows((r) => [
      ...r,
      {
        id: uid(),
        start: "",
        end: "",
        freq: "Weekly",
        monthlyDay: "",
        monthlyInterval: "1",
        weeklyDays: [],
        yearlyDay: "",
        yearlyMonth: "",
      },
    ]);
  };

  const removeRow = (id) => {
    setRows((r) => r.filter((x) => x.id !== id));
  };

  const toggleRowWeekday = (id, day) => {
    setRows((r) =>
      r.map((x) =>
        x.id === id
          ? {
              ...x,
              weeklyDays: (x.weeklyDays || []).includes(day)
                ? x.weeklyDays.filter((d) => d !== day)
                : [...(x.weeklyDays || []), day],
            }
          : x
      )
    );
  };

  const toggleMainWeekday = (day) => {
    setMainWeeklyDays((arr) =>
      arr.includes(day) ? arr.filter((d) => d !== day) : [...arr, day]
    );
  };

  const updateRow = (id, field, value) => {
    setRows((r) =>
      r.map((x) => {
        if (x.id !== id) return x;
        if (field === "freq" && value === "One time") {
          return { ...x, freq: value, end: x.start };
        }
        if (field === "start") {
          const next = { ...x, start: value };
          if (x.freq === "One time") next.end = value || "";
          return next;
        }
        return { ...x, [field]: value };
      })
    );
  };

  const validation = useMemo(() => {
    const errors = {};
    rows.forEach((row) => {
      const rowErrors = [];
      const s = toDate(row.start);
      const e = row.freq === "One time" ? toDate(row.start) : toDate(row.end);
      if (!row.start) rowErrors.push(row.freq === "One time" ? "Date is required" : "Start date is required");
      if (row.freq !== "One time" && !row.end) rowErrors.push("End date is required");
      if (s && e && e < s) rowErrors.push("End date must be on/after start date");
      if (!FREQ_OPTIONS.includes(row.freq)) rowErrors.push("Pick a frequency");
      if (row.freq === "Monthly") {
        if (!row.monthlyDay) rowErrors.push("Select day of month");
        if (!row.monthlyInterval) rowErrors.push("Select month interval");
      }
      if (row.freq === "Weekly") {
        if (!row.weeklyDays || row.weeklyDays.length === 0) rowErrors.push("Select at least one weekday");
      }
      if (row.freq === "Yearly") {
        if (!row.yearlyDay) rowErrors.push("Select day");
        if (!row.yearlyMonth) rowErrors.push("Select month");
      }
      if (rowErrors.length) errors[row.id] = rowErrors;
    });
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const A = rows[i];
        const B = rows[j];
        const aS = toDate(A.start);
        const aE = A.freq === "One time" ? toDate(A.start) : toDate(A.end);
        const bS = toDate(B.start);
        const bE = B.freq === "One time" ? toDate(B.start) : toDate(B.end);
        if (aS && aE && bS && bE && rangesOverlap(aS, aE, bS, bE)) {
          errors[A.id] = [...(errors[A.id] || []), "Overlaps another range"];
          errors[B.id] = [...(errors[B.id] || []), "Overlaps another range"];
        }
      }
    }
    return errors;
  }, [rows]);

  const hasErrors = Object.keys(validation).length > 0;

  const handleSubmit = () => {
    if (jobFrequency !== "Custom") {
      const mainPayload = { jobFrequency };
      if (jobFrequency === "Monthly") {
        mainPayload.monthly = {
          day: mainMonthlyDay,
          intervalMonths: mainMonthlyInterval,
        };
      }
      if (jobFrequency === "Weekly") {
        mainPayload.weekly = { days: mainWeeklyDays };
      }
      if (jobFrequency === "Yearly") {
        mainPayload.yearly = {
          day: mainYearlyDay,
          month: mainYearlyMonth,
        };
      }
      alert("Saved! Check console for payload.");
      console.log("Payload", mainPayload);
      return;
    }
    if (hasErrors) {
      alert("Please resolve validation issues before saving.");
      return;
    }
    const payload = {
      jobFrequency,
      customRanges: rows.map((r) => ({
        start: r.start,
        end: r.freq === "One time" ? r.start : r.end,
        frequency: r.freq,
        monthly: r.freq === "Monthly" ? { day: r.monthlyDay, intervalMonths: r.monthlyInterval } : undefined,
        weekly: r.freq === "Weekly" ? { days: r.weeklyDays } : undefined,
        yearly: r.freq === "Yearly" ? { day: r.yearlyDay, month: r.yearlyMonth } : undefined,
      })),
    };
    alert("Saved! Check console for payload.");
    console.log("Payload", payload);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl p-6">
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-5 pt-4 pb-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Selected Schedule</h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:gap-3">
              <label className="text-sm text-gray-600 mr-3 min-w-[120px]">Select Mode</label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    className="w-[320px] rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={jobFrequency}
                    onChange={(e) => setJobFrequency(e.target.value)}
                  >
                    {["Daily", "Weekly", "Monthly", "Yearly", "Custom"].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {jobFrequency !== "Custom" && (
              <div className="mt-4 space-y-3 text-sm">
                {jobFrequency === "Monthly" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span>On day</span>
                    <select
                      className="rounded-md border border-gray-300 px-2 py-1"
                      value={mainMonthlyDay}
                      onChange={(e) => setMainMonthlyDay(e.target.value)}
                    >
                      <option value="">Select</option>
                      {DAYS_1_31.map((d) => (
                        <option key={d} value={String(d)}>{d}</option>
                      ))}
                    </select>
                    <span>of every</span>
                    <select
                      className="rounded-md border border-gray-300 px-2 py-1"
                      value={mainMonthlyInterval}
                      onChange={(e) => setMainMonthlyInterval(e.target.value)}
                    >
                      {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <span>month(s)</span>
                  </div>
                )}
                {jobFrequency === "Weekly" && (
                  <div className="flex flex-wrap items-center gap-3">
                    {WEEKDAYS.map((d) => (
                      <label key={d} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${
                        mainWeeklyDays.includes(d) ? "bg-indigo-50 border-indigo-300" : "border-gray-300"
                      }`}>
                        <input
                          type="checkbox"
                          checked={mainWeeklyDays.includes(d)}
                          onChange={() => toggleMainWeekday(d)}
                        />
                        <span>{d}</span>
                      </label>
                    ))}
                  </div>
                )}
                {jobFrequency === "Yearly" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span>On the</span>
                    <select
                      className="rounded-md border border-gray-300 px-2 py-1"
                      value={mainYearlyDay}
                      onChange={(e) => setMainYearlyDay(e.target.value)}
                    >
                      <option value="">Day</option>
                      {DAYS_1_31.map((d) => (
                        <option key={d} value={String(d)}>{d}</option>
                      ))}
                    </select>
                    <span>of</span>
                    <select
                      className="rounded-md border border-gray-300 px-2 py-1"
                      value={mainYearlyMonth}
                      onChange={(e) => setMainYearlyMonth(e.target.value)}
                    >
                      <option value="">Month</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {jobFrequency === "Custom" && (
          <section className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold">Custom Frequency Ranges</h3>
              <button
                onClick={addRow}
                className="inline-flex items-center gap-2 rounded-md border border-indigo-600 text-indigo-700 px-3 py-1.5 text-sm hover:bg-indigo-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Range
              </button>
            </div>
            <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 px-5 py-2">
              <div className="col-span-4">Date Range</div>
              <div className="col-span-4">Frequency</div>
              <div className="col-span-4 text-right">Actions</div>
            </div>
            <div className="px-5 pb-5 space-y-3">
              {rows.map((row) => (
                <div key={row.id} className="rounded-lg border border-gray-200 p-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {row.freq === "One time" ? (
                        <input
                          type="date"
                          value={row.start}
                          onChange={(e) => updateRow(row.id, "start", e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-label="One-time date"
                        />
                      ) : (
                        <>
                          <input
                            type="date"
                            value={row.start}
                            onChange={(e) => updateRow(row.id, "start", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label="Start date"
                          />
                          <input
                            type="date"
                            value={row.end}
                            onChange={(e) => updateRow(row.id, "end", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label="End date"
                          />
                        </>
                      )}
                    </div>
                    <div className="md:col-span-4">
                      <select
                        value={row.freq}
                        onChange={(e) => updateRow(row.id, "freq", e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {FREQ_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-4 flex md:justify-end gap-2">
                      <button
                        onClick={() => removeRow(row.id)}
                        className="inline-flex items-center gap-2 rounded-md border border-red-300 text-red-600 px-3 py-2 text-sm hover:bg-red-50"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        Delete
                      </button>
                    </div>
                  </div>

                  {row.freq === "Monthly" && (
                    <div className="mt-3 text-sm flex flex-wrap items-center gap-2">
                      <span>On day</span>
                      <select
                        className="rounded-md border border-gray-300 px-2 py-1"
                        value={row.monthlyDay}
                        onChange={(e) => updateRow(row.id, "monthlyDay", e.target.value)}
                      >
                        <option value="">Select</option>
                        {DAYS_1_31.map((d) => (
                          <option key={d} value={String(d)}>{d}</option>
                        ))}
                      </select>
                      <span>of every</span>
                      <select
                        className="rounded-md border border-gray-300 px-2 py-1"
                        value={row.monthlyInterval}
                        onChange={(e) => updateRow(row.id, "monthlyInterval", e.target.value)}
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <span>month(s)</span>
                    </div>
                  )}

                  {row.freq === "Weekly" && (
                    <div className="mt-3 text-sm flex flex-wrap items-center gap-3">
                      {WEEKDAYS.map((d) => (
                        <label key={d} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${
                          (row.weeklyDays || []).includes(d) ? "bg-indigo-50 border-indigo-300" : "border-gray-300"
                        }`}>
                          <input
                            type="checkbox"
                            checked={(row.weeklyDays || []).includes(d)}
                            onChange={() => toggleRowWeekday(row.id, d)}
                          />
                          <span>{d}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {row.freq === "Yearly" && (
                    <div className="mt-3 text-sm flex flex-wrap items-center gap-2">
                      <span>On the</span>
                      <select
                        className="rounded-md border border-gray-300 px-2 py-1"
                        value={row.yearlyDay}
                        onChange={(e) => updateRow(row.id, "yearlyDay", e.target.value)}
                      >
                        <option value="">Day</option>
                        {DAYS_1_31.map((d) => (
                          <option key={d} value={String(d)}>{d}</option>
                        ))}
                      </select>
                      <span>of</span>
                      <select
                        className="rounded-md border border-gray-300 px-2 py-1"
                        value={row.yearlyMonth}
                        onChange={(e) => updateRow(row.id, "yearlyMonth", e.target.value)}
                      >
                        <option value="">Month</option>
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {validation[row.id] && (
                    <ul className="mt-2 text-xs text-red-600 list-disc list-inside">
                      {validation[row.id].map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-gray-600">• Ranges must not overlap • End date must be on/after start date</div>
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  className={`rounded-md px-4 py-2 text-white ${hasErrors ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
                  title={hasErrors ? "Fix validation issues to enable saving" : "Save configuration"}
                >
                  Save Configuration
                </button>
                <button
                  className="rounded-md border border-slate-300 text-slate-800 px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Preview Data
                </button>
              </div>
            </div>
          </section>
        )}

        {jobFrequency !== "Custom" && (
          <section className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-5 py-4">
              <div className="text-sm text-gray-700">Selected frequency: <b>{jobFrequency}</b></div>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="rounded-md px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={() => console.log("Preview data", { jobFrequency, mainMonthlyDay, mainMonthlyInterval, mainWeeklyDays, mainYearlyDay, mainYearlyMonth })}
                  className="rounded-md border border-slate-300 text-slate-800 px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Preview Data
                </button>
              </div>
            </div>
          </section>
        )}

        <p className="text-xs text-gray-500 mt-6">This prototype mimics the component/text style: subdued labels, value columns, subtle borders, and action buttons with icons.</p>
      </div>
    </div>
  );
}
