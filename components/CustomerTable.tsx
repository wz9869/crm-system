"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Customer } from "@/lib/types";
import { LevelBadge } from "./LevelBadge";
import { StatusBadge } from "./StatusBadge";

type SortDir = "asc" | "desc" | null;

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

function parseDate(v: string): number {
  if (!v.trim()) return 0;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

const PAGE_SIZE = 50;

export function CustomerTable({ customers, onDelete }: Props) {
  const [dateSort, setDateSort] = useState<SortDir>(null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!dateSort) return customers;
    return [...customers].sort((a, b) => {
      const diff = parseDate(a.apply_month) - parseDate(b.apply_month);
      return dateSort === "asc" ? diff : -diff;
    });
  }, [customers, dateSort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  // Reset to page 0 when customer list changes (filters)
  useMemo(() => setPage(0), [customers]);

  const toggleSort = () => {
    setDateSort((prev) => {
      if (prev === null) return "desc";
      if (prev === "desc") return "asc";
      return null;
    });
    setPage(0);
  };

  const sortIcon = dateSort === "asc" ? " ↑" : dateSort === "desc" ? " ↓" : " ↕";

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
            <th className="px-4 py-3 font-medium">
              <button type="button" onClick={toggleSort} className="inline-flex items-center gap-1 hover:text-slate-900">
                APPLICATION DATE<span className="text-xs">{sortIcon}</span>
              </button>
            </th>
            <th className="px-4 py-3 font-medium">NAME</th>
            <th className="px-4 py-3 font-medium">EMAIL</th>
            <th className="px-4 py-3 font-medium">COMPANY</th>
            <th className="px-4 py-3 font-medium">LEVEL</th>
            <th className="px-4 py-3 font-medium">STATUS</th>
            <th className="px-4 py-3 font-medium">LAST CONTACT</th>
            <th className="px-4 py-3 font-medium">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {paged.map((c) => {
            const days = daysAgo(c.last_contacted_at);
            const stale = days !== null && days >= 7;
            return (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700">{c.apply_month || "—"}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/customers/${c.id}`}
                    className="font-medium text-slate-900 hover:text-emerald-600 hover:underline"
                  >
                    {c.name || "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-700 break-all">{c.email || "—"}</td>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500">
            {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="flex items-center px-2 text-xs text-slate-500">
              {safePage + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(safePage + 1)}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
