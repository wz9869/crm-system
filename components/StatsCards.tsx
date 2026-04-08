"use client";

interface StatsCardsProps {
  total: number;
  aGradeCount: number;
  dueCount: number;
  todayCount: number;
}

const cardStyle =
  "rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow";

export function StatsCards({
  total,
  aGradeCount,
  dueCount,
  todayCount,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className={cardStyle}>
        <p className="text-sm text-slate-500">总客户数</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{total}</p>
      </div>
      <div className={cardStyle}>
        <p className="text-sm text-slate-500">A级客户数</p>
        <p className="mt-2 text-3xl font-semibold text-emerald-600">{aGradeCount}</p>
      </div>
      <div className={cardStyle}>
        <p className="text-sm text-slate-500">待跟进客户数</p>
        <p className="mt-2 text-3xl font-semibold text-amber-600">{dueCount}</p>
      </div>
      <div className={cardStyle}>
        <p className="text-sm text-slate-500">今日需跟进</p>
        <p className="mt-2 text-3xl font-semibold text-rose-600">{todayCount}</p>
      </div>
    </div>
  );
}
