"use client";

import { calculateCustomerGrade } from "@/lib/grading";
import { isFollowUpDue, isFollowUpToday } from "@/lib/followup";
import type { Customer, CustomerGrade } from "@/lib/types";

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onSelect: (customer: Customer) => void;
}

function gradeBadgeClass(grade: CustomerGrade): string {
  if (grade === "A") return "bg-emerald-100 text-emerald-700";
  if (grade === "B") return "bg-blue-100 text-blue-700";
  if (grade === "C") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
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
              <th className="px-4 py-3 font-medium">客户</th>
              <th className="px-4 py-3 font-medium">公司</th>
              <th className="px-4 py-3 font-medium">等级</th>
              <th className="px-4 py-3 font-medium">跟进状态</th>
              <th className="px-4 py-3 font-medium">下次跟进</th>
              <th className="px-4 py-3 font-medium">联系方式</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => {
              const grade = calculateCustomerGrade(customer);
              const dueToday = isFollowUpToday(customer);
              const dueAny = isFollowUpDue(customer);

              return (
                <tr key={customer.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onSelect(customer)}
                      className="text-left font-medium text-slate-900 underline-offset-2 hover:underline"
                    >
                      {customer.name}
                    </button>
                    <p className="text-xs text-slate-500">{customer.country}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{customer.company}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${gradeBadgeClass(grade)}`}
                    >
                      {grade}级
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{customer.projectStage}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`${
                        dueToday
                          ? "font-semibold text-rose-600"
                          : dueAny
                            ? "font-medium text-amber-600"
                            : "text-slate-700"
                      }`}
                    >
                      {customer.nextFollowUpDate || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <p>{customer.email}</p>
                    <p className="text-xs text-slate-500">{customer.whatsapp}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(customer)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(customer.id)}
                        className="rounded-md border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
