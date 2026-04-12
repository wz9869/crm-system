"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getCustomerById,
  updateCustomer,
  getFollowUps,
  addFollowUp,
} from "@/lib/storage";
import type { Customer, FollowUp } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { LevelBadge } from "@/components/LevelBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { CustomerForm } from "@/components/CustomerForm";

function daysAgo(d: string | null): string {
  if (!d) return "Never";
  const ms = Date.now() - new Date(d).getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-32 shrink-0 font-medium text-slate-500">{label}</span>
      <span className="text-slate-900">{value || "—"}</span>
    </div>
  );
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fuContent, setFuContent] = useState("");
  const [fuAction, setFuAction] = useState("");
  const [fuSaving, setFuSaving] = useState(false);

  const load = useCallback(async () => {
    const [c, fus] = await Promise.all([
      getCustomerById(id),
      getFollowUps(id),
    ]);
    setCustomer(c);
    setFollowUps(fus);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!authLoading && user) void load();
  }, [authLoading, user, load]);

  const handleEdit = async (data: Omit<Customer, "id" | "created_by">) => {
    if (!customer) return;
    setSubmitting(true);
    try {
      await updateCustomer({ ...data, id: customer.id, created_by: customer.created_by });
      await load();
      setEditOpen(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuContent.trim() || !user || !customer) return;
    setFuSaving(true);
    try {
      await addFollowUp({
        customer_id: customer.id,
        content: fuContent.trim(),
        next_action: fuAction.trim(),
        created_by: user.id,
      });
      setFuContent("");
      setFuAction("");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setFuSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl p-6">
          <p className="text-sm text-slate-500">Loading...</p>
        </main>
      </>
    );
  }

  if (!customer) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl p-6">
          <p className="text-sm text-slate-500">Customer not found.</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-3 text-sm text-emerald-600 hover:underline"
          >
            ← Back
          </button>
        </main>
      </>
    );
  }

  const lastDays = customer.last_contacted_at
    ? Math.floor((Date.now() - new Date(customer.last_contacted_at).getTime()) / 86400000)
    : null;
  const stale = lastDays === null || lastDays >= 7;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mb-1 text-sm text-slate-500 hover:text-emerald-600"
            >
              ← Back to list
            </button>
            <h1 className="text-2xl font-semibold text-slate-900">{customer.name}</h1>
            <p className="text-sm text-slate-500">{customer.company}</p>
          </div>
          <div className="flex items-center gap-2">
            <LevelBadge level={customer.level} />
            <StatusBadge status={customer.status} />
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Warning */}
        {stale && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            ⚠️ No follow-up recorded in the last 7 days. Last contact: {daysAgo(customer.last_contacted_at)}
          </div>
        )}

        {/* Customer Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <InfoRow label="Email" value={customer.email} />
          <InfoRow label="Phone" value={customer.phone} />
          <InfoRow label="Position" value={customer.position} />
          <InfoRow label="Business Type" value={customer.business_type} />
          <InfoRow label="Address" value={customer.address} />
          <InfoRow label="Website" value={customer.website} />
          <InfoRow label="Apply Month" value={customer.apply_month} />
          <InfoRow label="Last Contact" value={daysAgo(customer.last_contacted_at)} />
        </div>

        {/* Add Follow-up */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Add Follow-up</h2>
          <form onSubmit={handleAddFollowUp} className="space-y-3">
            <textarea
              value={fuContent}
              onChange={(e) => setFuContent(e.target.value)}
              placeholder="What happened? What was discussed?"
              required
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
            />
            <input
              value={fuAction}
              onChange={(e) => setFuAction(e.target.value)}
              placeholder="Next action (optional)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
            />
            <button
              type="submit"
              disabled={fuSaving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {fuSaving ? "Saving..." : "Save Follow-up"}
            </button>
          </form>
        </div>

        {/* Follow-up Timeline */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Follow-up History ({followUps.length})
          </h2>
          {followUps.length === 0 ? (
            <p className="text-sm text-slate-500">No follow-ups yet.</p>
          ) : (
            <div className="relative space-y-0">
              {followUps.map((fu, idx) => (
                <div key={fu.id} className="relative flex gap-4 pb-6">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full border-2 border-emerald-500 bg-white" />
                    {idx < followUps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 -mt-0.5">
                    <p className="text-xs text-slate-400">
                      {new Date(fu.created_at).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-slate-800">{fu.content}</p>
                    {fu.next_action && (
                      <p className="mt-1 text-xs text-slate-500">
                        Next: {fu.next_action}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <CustomerForm
          open={editOpen}
          mode="edit"
          initialValue={customer}
          onClose={() => setEditOpen(false)}
          onSubmit={handleEdit}
          submitting={submitting}
        />
      </main>
    </>
  );
}
