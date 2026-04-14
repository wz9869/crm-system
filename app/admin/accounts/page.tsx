"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getProfiles, type Profile } from "@/lib/storage";
import { Navbar } from "@/components/Navbar";

export default function AccountsPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setProfiles(await getProfiles());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || role !== "admin") {
      router.replace("/");
      return;
    }
    void load();
  }, [authLoading, user, role, router, load]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete account ${email}?`)) return;
    setMsg(null);
    try {
      const res = await fetch("/api/admin/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "err", text: data.error ?? "Failed to delete" });
        return;
      }
      setMsg({ type: "ok", text: `Account ${email} deleted` });
      await load();
    } catch {
      setMsg({ type: "err", text: "Network error" });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: "err", text: data.error ?? "Failed to create account" });
        return;
      }

      setMsg({ type: "ok", text: `Account created: ${data.email}` });
      setEmail("");
      setPassword("");
      await load();
    } catch {
      setMsg({ type: "err", text: "Network error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || role !== "admin") return null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Staff Accounts</h1>

        {/* Create form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-800">Create Staff Account</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm text-slate-700">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
                placeholder="staff@example.com"
              />
            </label>
            <label className="flex-1 text-sm text-slate-700">
              Password
              <input
                type="text"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
                placeholder="Min 6 characters"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </form>

          {msg && (
            <p
              className={`mt-3 rounded-lg p-2 text-sm ${
                msg.type === "ok"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {msg.text}
            </p>
          )}
        </div>

        {/* Accounts list */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">EMAIL</th>
                <th className="px-4 py-3 font-medium">ROLE</th>
                <th className="px-4 py-3 font-medium">CREATED AT</th>
                <th className="px-4 py-3 font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No accounts yet.
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900">{p.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.role === "admin"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {p.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {p.role !== "admin" && (
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.email)}
                          className="rounded-md border border-rose-300 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
