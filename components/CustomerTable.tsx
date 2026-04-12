"use client";

import { useMemo, useState } from "react";
import type { Customer } from "@/lib/types";

type SortDir = "asc" | "desc" | null;

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onSelect: (customer: Customer) => void;
}

function cell(v: string): string {
  return v.trim() ? v : "—";
}

function parseDate(v: string): number {
  if (!v.trim()) return 0;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

export function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onSelect,
}: CustomerTableProps) {
  const [dateSort, setDateSort] = useState<SortDir>(null);

  const sorted = useMemo(() => {
    if (!dateSort) return customers;
    return [...customers].sort((a, b) => {
      const diff = parseDate(a.apply_month) - parseDate(b.apply_month);
      return dateSort === "asc" ? diff : -diff;
    });
  }, [customers, dateSort]);

  const toggleDateSort = () => {
    setDateSort((prev) => {
      if (prev === null) return "desc";
      if (prev === "desc") return "asc";
      return null;
    });
  };

  const sortIcon = dateSort === "asc" ? " ↑" : dateSort === "desc" ? " ↓" : " ↕";

  if (customers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        暂无客户数据，请先新增客户或调整筛选条件。
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
      <div>
        <table className="w-full text-sm table-fixed">
          <thead className="bg-slate-50 text-left text-slate-600 uppercase">
            <tr>
              <th className="w-[10%] px-3 py-3 font-medium">
                <button
                  type="button"
                  onClick={toggleDateSort}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  APPLICATION DATE
                  <span className="text-xs">{sortIcon}</span>
                </button>
              </th>
              <th className="w-[10%] px-3 py-3 font-medium">NAME</th>
              <th className="w-[14%] px-3 py-3 font-medium">COMPANY</th>
              <th className="w-[12%] px-3 py-3 font-medium">BUSINESS TYPE</th>
              <th className="w-[9%] px-3 py-3 font-medium">POSITION</th>
              <th className="w-[22%] px-3 py-3 font-medium">EMAIL</th>
              <th className="w-[13%] px-3 py-3 font-medium">PHONE</th>
              <th className="w-[10%] px-3 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-3 py-3 text-slate-700">{cell(c.apply_month)}</td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onSelect(c)}
                    className="text-left font-medium text-slate-900 underline-offset-2 hover:underline"
                  >
                    {cell(c.name)}
                  </button>
                </td>
                <td className="px-3 py-3 text-slate-700">{cell(c.company)}</td>
                <td className="px-3 py-3 text-slate-700">{cell(c.business_type)}</td>
                <td className="px-3 py-3 text-slate-700">{cell(c.position)}</td>
                <td className="px-3 py-3 text-slate-700 break-all min-w-[180px]">
                  {cell(c.email)}
                </td>
                <td className="px-3 py-3 text-slate-700">{cell(c.phone)}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(c)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(c.id)}
                      className="rounded-md border border-rose-300 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
