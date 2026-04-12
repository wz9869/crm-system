"use client";

import { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";
import type { Customer } from "@/lib/types";

const CUSTOMER_FIELDS: { key: keyof Omit<Customer, "id">; label: string }[] = [
  { key: "name", label: "姓名 / Name" },
  { key: "company", label: "公司 / Company" },
  { key: "business_type", label: "业务类型 / Business Type" },
  { key: "position", label: "职位 / Position" },
  { key: "email", label: "邮箱 / Email" },
  { key: "phone", label: "电话 / Phone" },
  { key: "address", label: "地址 / Address" },
  { key: "website", label: "官网 / Website" },
  { key: "apply_month", label: "申请月份 / Apply Month" },
];

const AUTO_MAP: Record<string, keyof Omit<Customer, "id">> = {
  name: "name",
  姓名: "name",
  company: "company",
  公司: "company",
  "company name": "company",
  business_type: "business_type",
  "business type": "business_type",
  业务类型: "business_type",
  position: "position",
  职位: "position",
  title: "position",
  email: "email",
  邮箱: "email",
  "e-mail": "email",
  phone: "phone",
  电话: "phone",
  telephone: "phone",
  address: "address",
  地址: "address",
  city: "address",
  state: "address",
  website: "website",
  官网: "website",
  url: "website",
  apply_month: "apply_month",
  "apply month": "apply_month",
  申请月份: "apply_month",
  month: "apply_month",
};

function autoMapColumns(
  headers: string[],
): Record<number, keyof Omit<Customer, "id">> {
  const mapping: Record<number, keyof Omit<Customer, "id">> = {};
  const used = new Set<string>();

  for (let i = 0; i < headers.length; i++) {
    const normalized = headers[i].trim().toLowerCase();
    const match = AUTO_MAP[normalized];
    if (match && !used.has(match)) {
      mapping[i] = match;
      used.add(match);
    }
  }
  return mapping;
}

interface ImportCustomersProps {
  open: boolean;
  onClose: () => void;
  onImport: (customers: Omit<Customer, "id">[]) => Promise<void>;
}

export function ImportCustomers({
  open,
  onClose,
  onImport,
}: ImportCustomersProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<
    Record<number, keyof Omit<Customer, "id">>
  >({});
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const reset = useCallback(() => {
    setHeaders([]);
    setRows([]);
    setMapping({});
    setFileName("");
    setError("");
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: string[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
          raw: false,
        });

        if (json.length < 2) {
          setError("文件至少需要包含表头行和一行数据。");
          return;
        }

        const hdr = json[0].map((h) => String(h).trim());
        const body = json.slice(1).filter((r) => r.some((c) => String(c).trim()));
        setHeaders(hdr);
        setRows(body);
        setMapping(autoMapColumns(hdr));
      } catch {
        setError("文件解析失败，请确保是有效的 Excel 或 CSV 文件。");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const updateMapping = (colIdx: number, field: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (field === "") {
        delete next[colIdx];
      } else {
        next[colIdx] = field as keyof Omit<Customer, "id">;
      }
      return next;
    });
  };

  const usedFields = new Set(Object.values(mapping));

  const buildCustomers = (): Omit<Customer, "id">[] => {
    return rows.map((row) => {
      const customer: Record<string, string> = {};
      for (const f of CUSTOMER_FIELDS) {
        customer[f.key] = "";
      }
      for (const [colStr, field] of Object.entries(mapping)) {
        const col = Number(colStr);
        const val = String(row[col] ?? "").trim();
        if (customer[field] && val) {
          customer[field] += ", " + val;
        } else if (val) {
          customer[field] = val;
        }
      }
      return customer as unknown as Omit<Customer, "id">;
    });
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    const mappedCount = Object.keys(mapping).length;
    if (mappedCount === 0) {
      setError("请至少映射一个字段。");
      return;
    }
    setImporting(true);
    setError("");
    try {
      const customers = buildCustomers();
      await onImport(customers);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "导入失败，请稍后重试。",
      );
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            导入客户（Excel / CSV）
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Step 1: File upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              选择文件
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
            />
            {fileName && (
              <p className="mt-1 text-xs text-slate-500">
                已选择: {fileName}（{rows.length} 行数据）
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Step 2: Column mapping */}
          {headers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">
                字段映射（文件列 → CRM 字段）
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {headers.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                      {h || `(列 ${i + 1})`}
                    </span>
                    <span className="text-slate-400">→</span>
                    <select
                      value={mapping[i] ?? ""}
                      onChange={(e) => updateMapping(i, e.target.value)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm outline-none ring-emerald-200 focus:ring"
                    >
                      <option value="">跳过</option>
                      {CUSTOMER_FIELDS.map((f) => (
                        <option
                          key={f.key}
                          value={f.key}
                          disabled={
                            usedFields.has(f.key) && mapping[i] !== f.key
                          }
                        >
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {headers.length > 0 && rows.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">
                数据预览（前 5 行）
              </h3>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} className="whitespace-nowrap px-3 py-2 font-medium">
                          {h || `(列 ${i + 1})`}
                          {mapping[i] && (
                            <span className="ml-1 text-emerald-600">
                              → {mapping[i]}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.slice(0, 5).map((row, ri) => (
                      <tr key={ri}>
                        {headers.map((_, ci) => (
                          <td
                            key={ci}
                            className={`whitespace-nowrap px-3 py-2 ${
                              mapping[ci]
                                ? "text-slate-900"
                                : "text-slate-400"
                            }`}
                          >
                            {String(row[ci] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-500">
            {rows.length > 0
              ? `共 ${rows.length} 行，已映射 ${Object.keys(mapping).length} 个字段`
              : "请先上传文件"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || rows.length === 0}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {importing ? "导入中..." : `确认导入 (${rows.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
