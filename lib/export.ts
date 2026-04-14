import * as XLSX from "xlsx";
import type { Customer } from "./types";
import { categorize } from "./categories";

const COLUMNS: { header: string; key: keyof Customer | "category"; width: number }[] = [
  { header: "Application Date", key: "apply_month", width: 16 },
  { header: "Name", key: "name", width: 20 },
  { header: "Email", key: "email", width: 30 },
  { header: "Company", key: "company", width: 28 },
  { header: "Category", key: "category", width: 20 },
  { header: "Business Type", key: "business_type", width: 24 },
  { header: "Level", key: "level", width: 8 },
  { header: "Status", key: "status", width: 12 },
  { header: "Phone", key: "phone", width: 18 },
  { header: "Position", key: "position", width: 16 },
  { header: "Address", key: "address", width: 32 },
  { header: "Website", key: "website", width: 28 },
  { header: "Last Contact", key: "last_contacted_at", width: 20 },
];

export function exportCustomersToExcel(customers: Customer[], filename?: string) {
  const rows = customers.map((c) => {
    const row: Record<string, string> = {};
    for (const col of COLUMNS) {
      if (col.key === "category") {
        row[col.header] = categorize(c.business_type);
      } else {
        row[col.header] = (c[col.key] as string) ?? "";
      }
    }
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = COLUMNS.map((c) => ({ wch: c.width }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Customers");

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, filename ?? `customers-export-${date}.xlsx`);
}
