import type { CustomerStatus } from "@/lib/types";

const styles: Record<CustomerStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  following: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-600",
  invalid: "bg-rose-50 text-rose-500",
};

const labels: Record<CustomerStatus, string> = {
  new: "New",
  following: "Following",
  closed: "Closed",
  invalid: "Invalid",
};

export function StatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
