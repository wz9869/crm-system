"use client";

interface StatsCardsProps {
  total: number;
  aCount: number;
  followingCount: number;
  staleCount: number;
}

const card =
  "rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow";

export function StatsCards({ total, aCount, followingCount, staleCount }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className={card}>
        <p className="text-sm text-slate-500">Total Customers</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{total}</p>
      </div>
      <div className={card}>
        <p className="text-sm text-slate-500">A-Level</p>
        <p className="mt-2 text-3xl font-semibold text-rose-600">{aCount}</p>
      </div>
      <div className={card}>
        <p className="text-sm text-slate-500">Following</p>
        <p className="mt-2 text-3xl font-semibold text-emerald-600">{followingCount}</p>
      </div>
      <div className={card}>
        <p className="text-sm text-slate-500">No Contact 7d+</p>
        <p className="mt-2 text-3xl font-semibold text-amber-600">{staleCount}</p>
      </div>
    </div>
  );
}
