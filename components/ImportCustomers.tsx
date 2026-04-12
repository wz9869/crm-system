"use client";

import { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";
import type { Customer } from "@/lib/types";

type ImportField = keyof Pick<
  Customer,
  "name" | "company" | "business_type" | "position" | "email" | "phone" | "address" | "website" | "apply_month"
>;

const FIELDS: { key: ImportField; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "company", label: "Company" },
  { key: "business_type", label: "Business Type" },
  { key: "position", label: "Position" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "website", label: "Website" },
  { key: "apply_month", label: "Apply Month" },
];

const AUTO_MAP: Record<string, ImportField> = {
  name: "name", company: "company", "company name": "company",
  business_type: "business_type", "business type": "business_type",
  position: "position", title: "position",
  email: "email", "e-mail": "email",
  phone: "phone", telephone: "phone",
  address: "address", city: "address", state: "address",
  website: "website", url: "website",
  apply_month: "apply_month", "apply month": "apply_month", month: "apply_month",
};

function autoMap(headers: string[]): Record<number, ImportField> {
  const m: Record<number, ImportField> = {};
  const used = new Set<string>();
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i].trim().toLowerCase();
    const f = AUTO_MAP[key];
    if (f && !used.has(f)) { m[i] = f; used.add(f); }
  }
  return m;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (customers: Omit<Customer, "id">[]) => Promise<void>;
}

export function ImportCustomers({ open, onClose, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, ImportField>>({});
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const reset = useCallback(() => {
    setHeaders([]); setRows([]); setMapping({}); setFileName(""); setError(""); setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleClose = () => { reset(); onClose(); };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const json: string[][] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: "", raw: false });
        if (json.length < 2) { setError("File needs at least a header row and one data row."); return; }
        const hdr = json[0].map((h) => String(h).trim());
        const body = json.slice(1).filter((r) => r.some((c) => String(c).trim()));
        setHeaders(hdr); setRows(body); setMapping(autoMap(hdr));
      } catch { setError("Failed to parse file."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const usedFields = new Set(Object.values(mapping));

  const build = (): Omit<Customer, "id">[] =>
    rows.map((row) => {
      const c: Record<string, string | null> = {
        name: "", company: "", business_type: "", position: "", email: "",
        phone: "", address: "", website: "", apply_month: "",
        level: "C", status: "new", last_contacted_at: null, created_by: null,
      };
      for (const [col, field] of Object.entries(mapping)) {
        const val = String(row[Number(col)] ?? "").trim();
        if (val) c[field] = c[field] ? c[field] + ", " + val : val;
      }
      return c as unknown as Omit<Customer, "id">;
    });

  const handleImport = async () => {
    if (Object.keys(mapping).length === 0) { setError("Map at least one field."); return; }
    setImporting(true); setError("");
    try { await onImport(build()); handleClose(); }
    catch (e) { setError(e instanceof Error ? e.message : "Import failed."); }
    finally { setImporting(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Import Customers (Excel / CSV)</h2>
          <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile}
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" />
            {fileName && <p className="mt-1 text-xs text-slate-500">{fileName} — {rows.length} rows</p>}
          </div>

          {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

          {headers.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{h || `Col ${i + 1}`}</span>
                  <span className="text-slate-400">→</span>
                  <select value={mapping[i] ?? ""} onChange={(e) => {
                    setMapping((prev) => {
                      const n = { ...prev };
                      if (e.target.value === "") delete n[i]; else n[i] = e.target.value as ImportField;
                      return n;
                    });
                  }} className="rounded-md border border-slate-300 px-2 py-1 text-sm">
                    <option value="">Skip</option>
                    {FIELDS.map((f) => (
                      <option key={f.key} value={f.key} disabled={usedFields.has(f.key) && mapping[i] !== f.key}>{f.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {rows.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>{headers.map((h, i) => <th key={i} className="whitespace-nowrap px-3 py-2 font-medium">{h}{mapping[i] ? <span className="ml-1 text-emerald-600">→ {mapping[i]}</span> : null}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.slice(0, 5).map((row, ri) => (
                    <tr key={ri}>{headers.map((_, ci) => <td key={ci} className={`whitespace-nowrap px-3 py-2 ${mapping[ci] ? "text-slate-900" : "text-slate-400"}`}>{String(row[ci] ?? "")}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-500">{rows.length} rows, {Object.keys(mapping).length} fields mapped</p>
          <div className="flex gap-2">
            <button type="button" onClick={handleClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Cancel</button>
            <button type="button" onClick={handleImport} disabled={importing || rows.length === 0}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
              {importing ? "Importing..." : `Import (${rows.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
