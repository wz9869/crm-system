"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

const roleBadge: Record<string, string> = {
  admin: "bg-amber-100 text-amber-700",
  staff: "bg-slate-100 text-slate-600",
};

export function Navbar() {
  const { user, role, signOut } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <nav className="border-b border-slate-200 bg-white px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-lg font-semibold text-slate-900 hover:text-emerald-600"
        >
          SmartWings Dealer CRM
        </button>
        <div className="flex items-center gap-3 text-sm">
          {role && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge[role] ?? roleBadge.staff}`}
            >
              {role.toUpperCase()}
            </span>
          )}
          <span className="text-slate-500">{user.email}</span>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
