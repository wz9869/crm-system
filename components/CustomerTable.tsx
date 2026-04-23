"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Customer } from "@/lib/types";
import type { Profile } from "@/lib/storage";
import { categorize, categoryColor } from "@/lib/categories";
import { LevelBadge } from "./LevelBadge";
import { StatusBadge } from "./StatusBadge";

type SortDir = "asc" | "desc" | null;

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

interface Props {
  customers: Customer[];
  page: number;
  onPageChange: (p: number) => void;
  onDelete?: (id: string) => void;
  onAssign?: (customerId: string, ownerId: string) => void;
  onUnassign?: (customerId: string) => void;
  onBulkAssign?: (customerIds: string[], ownerId: string) => void;
  staffList?: Profile[];
}

export function CustomerTable({ customers, page, onPageChange, onDelete, onAssign, onUnassign, onBulkAssign, staffList }: Props) {
  const [dateSort, setDateSort] = useState<SortDir>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkOwnerId, setBulkOwnerId] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const isAdmin = !!onAssign;

  const staffMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of staffList ?? []) m.set(s.id, s.email);
    return m;
  }, [staffList]);

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


  const toggleSort = () => {
    setDateSort((prev) => {
      if (prev === null) return "desc";
      if (prev === "desc") return "asc";
      return null;
    });
    onPageChange(0);
  };

  const sortIcon = dateSort === "asc" ? " ↑" : dateSort === "desc" ? " ↓" : " ↕";

  // Bulk selection helpers — only pool customers on the current page can be bulk-assigned
  const selectableIds = useMemo(
    () => paged.filter((c) => c.is_public_pool).map((c) => c.id),
    [paged],
  );
  const allPageSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        selectableIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        selectableIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAssign = async () => {
    if (!bulkOwnerId || selectedIds.size === 0 || !onBulkAssign) return;
    setBulkLoading(true);
    try {
      await onBulkAssign(Array.from(selectedIds), bulkOwnerId);
      setSelectedIds(new Set());
      setBulkOwnerId("");
    } finally {
      setBulkLoading(false);
    }
  };

  if (customers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        No customers found.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">

      {/* Bulk action bar */}
      {isAdmin && onBulkAssign && selectedIds.size > 0 && staffList && staffList.length > 0 && (
        <div className="flex items-center gap-3 border-b border-emerald-200 bg-emerald-50 px-4 py-2.5">
          <span className="text-sm font-medium text-emerald-800">
            {selectedIds.size} selected
          </span>
          <select
            value={bulkOwnerId}
            onChange={(e) => setBulkOwnerId(e.target.value)}
            className="rounded-md border border-emerald-300 px-2 py-1 text-sm text-emerald-700 bg-white"
          >
            <option value="">Assign to…</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.email.split("@")[0]}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!bulkOwnerId || bulkLoading}
            onClick={handleBulkAssign}
            className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            {bulkLoading ? "Assigning…" : "Confirm Assign"}
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Clear selection
          </button>
        </div>
      )}

      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            {isAdmin && onBulkAssign && (
              <th className="px-3 py-3 w-8">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleSelectAll}
                  disabled={selectableIds.length === 0}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  title="Select all pool customers on this page"
                />
              </th>
            )}
            <th className="px-4 py-3 font-medium">
              <button type="button" onClick={toggleSort} className="inline-flex items-center gap-1 hover:text-slate-900">
                APPLICATION DATE<span className="text-xs">{sortIcon}</span>
              </button>
            </th>
            <th className="px-4 py-3 font-medium">NAME</th>
            <th className="px-4 py-3 font-medium">EMAIL</th>
            <th className="px-4 py-3 font-medium">COMPANY</th>
            <th className="px-4 py-3 font-medium">CATEGORY</th>
            <th className="px-4 py-3 font-medium">LEVEL</th>
            <th className="px-4 py-3 font-medium">STATUS</th>
            {isAdmin && <th className="px-4 py-3 font-medium">OWNER</th>}
            <th className="px-4 py-3 font-medium">LAST CONTACT</th>
            {(onDelete || isAdmin) && <th className="px-4 py-3 font-medium">ACTIONS</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {paged.map((c) => {
            const days = daysAgo(c.last_contacted_at);
            const stale = days !== null && days >= 7;
            const ownerEmail = c.owner_id ? staffMap.get(c.owner_id) : null;

            return (
              <tr key={c.id} className={`hover:bg-slate-50 ${selectedIds.has(c.id) ? "bg-emerald-50" : ""}`}>
                {isAdmin && onBulkAssign && (
                  <td className="px-3 py-3">
                    {c.is_public_pool ? (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c.id)}
                        onChange={() => toggleRow(c.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    ) : (
                      <span className="block w-4" />
                    )}
                  </td>
                )}
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
                  {(() => {
                    const cat = categorize(c.business_type);
                    return (
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor(cat)}`}>
                        {cat}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-4 py-3">
                  <LevelBadge level={c.level} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    {c.is_public_pool ? (
                      <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                        Public Pool
                      </span>
                    ) : ownerEmail ? (
                      <span className="text-xs text-slate-600" title={ownerEmail}>
                        {ownerEmail.split("@")[0]}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                )}
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
                {(onDelete || isAdmin) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {isAdmin && c.is_public_pool && onAssign && staffList && staffList.length > 0 && (
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              onAssign(c.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="rounded-md border border-emerald-300 px-1.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        >
                          <option value="">Assign →</option>
                          {staffList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.email.split("@")[0]}
                            </option>
                          ))}
                        </select>
                      )}
                      {isAdmin && !c.is_public_pool && c.owner_id && onUnassign && (
                        <button
                          type="button"
                          onClick={() => onUnassign(c.id)}
                          className="rounded-md border border-amber-300 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
                        >
                          Unassign
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Delete this customer?")) onDelete(c.id);
                          }}
                          className="rounded-md border border-rose-300 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
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
              onClick={() => onPageChange(safePage - 1)}
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
              onClick={() => onPageChange(safePage + 1)}
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
