"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, signOut } = useAuth();
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
          CRM Lite
        </button>
        <div className="flex items-center gap-4 text-sm">
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
