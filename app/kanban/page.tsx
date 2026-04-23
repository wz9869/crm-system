"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getCustomers, getMyCustomers, updateCustomer } from "@/lib/storage";
import type { Customer, CustomerStatus } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { LevelBadge } from "@/components/LevelBadge";

const COLUMNS: { status: CustomerStatus; label: string; color: string; headerColor: string }[] = [
  { status: "new",       label: "New",        color: "bg-slate-50 border-slate-200",   headerColor: "bg-slate-100 text-slate-700" },
  { status: "following", label: "Following",  color: "bg-blue-50 border-blue-200",     headerColor: "bg-blue-100 text-blue-700" },
  { status: "closed",    label: "Closed",     color: "bg-emerald-50 border-emerald-200", headerColor: "bg-emerald-100 text-emerald-700" },
  { status: "invalid",   label: "Invalid",    color: "bg-red-50 border-red-200",       headerColor: "bg-red-100 text-red-700" },
];

function daysAgo(d: string | null): string {
  if (!d) return "Never";
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export default function KanbanPage() {
  const { user, role, loading: authLoading } = useAuth();
  const isAdmin = role === "admin";

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<CustomerStatus | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const data = isAdmin ? await getCustomers() : await getMyCustomers(user.id);
    setCustomers(data);
    setLoading(false);
  }, [user, isAdmin]);

  useEffect(() => {
    if (!authLoading && user) void load();
  }, [authLoading, user, load]);

  const byStatus = (status: CustomerStatus) =>
    customers.filter((c) => c.status === status);

  // ── Drag handlers ──
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent, status: CustomerStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverCol(status);
  };

  const handleDrop = async (e: React.DragEvent, status: CustomerStatus) => {
    e.preventDefault();
    setOverCol(null);
    if (!draggingId) return;
    const c = customers.find((x) => x.id === draggingId);
    if (!c || c.status === status) { setDraggingId(null); return; }

    // Optimistic update
    setCustomers((prev) =>
      prev.map((x) => (x.id === draggingId ? { ...x, status } : x)),
    );
    setDraggingId(null);
    try {
      await updateCustomer({ ...c, status });
    } catch {
      await load(); // rollback on error
    }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverCol(null);
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="p-6 text-sm text-slate-500">Loading pipeline...</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-screen-xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Pipeline</h1>
          <span className="text-sm text-slate-500">{customers.length} total customers</span>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {COLUMNS.map(({ status, label, color, headerColor }) => {
            const cards = byStatus(status);
            const isOver = overCol === status;

            return (
              <div
                key={status}
                onDragOver={(e) => handleDragOver(e, status)}
                onDrop={(e) => handleDrop(e, status)}
                onDragLeave={() => setOverCol(null)}
                className={`flex flex-col rounded-xl border-2 transition-colors ${color} ${isOver ? "ring-2 ring-emerald-400 ring-offset-1" : ""}`}
              >
                {/* Column header */}
                <div className={`flex items-center justify-between rounded-t-xl px-3 py-2.5 ${headerColor}`}>
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-medium">
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 p-2 min-h-[120px]">
                  {cards.map((c) => {
                    const reminderDue = c.next_follow_up_at
                      ? new Date(c.next_follow_up_at).getTime() <= Date.now()
                      : false;
                    const isDragging = draggingId === c.id;

                    return (
                      <div
                        key={c.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, c.id)}
                        onDragEnd={handleDragEnd}
                        className={`rounded-lg border border-white bg-white p-3 shadow-sm cursor-grab active:cursor-grabbing select-none transition-opacity ${isDragging ? "opacity-40" : "opacity-100"}`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <Link
                            href={`/customers/${c.id}`}
                            className="text-sm font-medium text-slate-900 hover:text-emerald-600 hover:underline leading-snug"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {c.name}
                            {reminderDue && <span className="ml-1 text-red-500 text-xs">🔔</span>}
                          </Link>
                          <LevelBadge level={c.level} />
                        </div>
                        {c.company && (
                          <p className="mt-0.5 text-xs text-slate-500 truncate">{c.company}</p>
                        )}
                        <p className="mt-1.5 text-xs text-slate-400">
                          Last contact: {daysAgo(c.last_contacted_at)}
                        </p>
                      </div>
                    );
                  })}

                  {cards.length === 0 && (
                    <p className="py-4 text-center text-xs text-slate-400">Drop cards here</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
