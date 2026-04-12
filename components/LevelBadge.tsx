import type { CustomerLevel } from "@/lib/types";

const styles: Record<CustomerLevel, string> = {
  A: "bg-rose-100 text-rose-700 border-rose-200",
  B: "bg-amber-100 text-amber-700 border-amber-200",
  C: "bg-slate-100 text-slate-600 border-slate-200",
};

export function LevelBadge({ level }: { level: CustomerLevel }) {
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${styles[level]}`}
    >
      {level}
    </span>
  );
}
