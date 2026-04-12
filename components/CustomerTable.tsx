"use client";

import Link from "next/link";
import type { Customer } from "@/lib/types";
import { LevelBadge } from "./LevelBadge";
import { StatusBadge } from "./StatusBadge";

interface Props {
  customers: Customer[];
  onDelete: (id: string) => void;
}

function daysAgo(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

export function CustomerTable({ customers, onDelete }: Props) {
  if (customers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        No customers found.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Level</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Last Contact</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {customers.map((c) => {
            const days = daysAgo(c.last_contacted_at);
            const stale = days !== null && days >= 7;
            return (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/customers/${c.id}`}
                    className="font-medium text-slate-900 hover:text-emerald-600 hover:underline"
                  >
                    {c.name || "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-700">{c.company || "—"}</td>
                <td className="px-4 py-3">
                  <LevelBadge level={c.level} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3">
                  {days === null ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    <span className={stale ? "font-medium text-amber-600" : "text-slate-700"}>
                      {days === 0 ? "Today" : `${days}d ago`}
                      {stale && " ⚠️"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this customer?")) onDelete(c.id);
                    }}
                    className="rounded-md border border-rose-300 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
