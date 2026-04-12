"use client";

import type { Customer } from "@/lib/types";

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onSelect: (customer: Customer) => void;
}

function cell(v: string): string {
  return v.trim() ? v : "—";
}

export function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onSelect,
}: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        暂无客户数据，请先新增客户或调整筛选条件。
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-3 font-medium">name</th>
              <th className="px-3 py-3 font-medium">company</th>
              <th className="px-3 py-3 font-medium">business_type</th>
              <th className="px-3 py-3 font-medium">position</th>
              <th className="px-3 py-3 font-medium">email</th>
              <th className="px-3 py-3 font-medium">phone</th>
              <th className="px-3 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
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
                <td className="max-w-[200px] truncate px-3 py-3 text-slate-700">
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
