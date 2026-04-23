"use client";

import { useEffect, useState } from "react";
import { CUSTOMER_LEVELS, CUSTOMER_STATUSES, type Customer } from "@/lib/types";

type FormValue = Omit<Customer, "id" | "created_by" | "owner_id" | "is_public_pool">;

interface Props {
  open: boolean;
  mode: "create" | "edit";
  initialValue?: Customer | null;
  onClose: () => void;
  onSubmit: (data: FormValue) => void;
  submitting?: boolean;
}

const empty: FormValue = {
  name: "",
  company: "",
  business_type: "",
  address: "",
  website: "",
  phone: "",
  position: "",
  email: "",
  apply_month: "",
  level: "C",
  status: "new",
  last_contacted_at: null,
  next_follow_up_at: null,
};

const inp =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring";

export function CustomerForm({
  open,
  mode,
  initialValue,
  onClose,
  onSubmit,
  submitting = false,
}: Props) {
  const [form, setForm] = useState<FormValue>(empty);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialValue) {
      const { id: _, created_by: __, ...rest } = initialValue;
      setForm({ ...empty, ...rest });
    } else {
      setForm(empty);
    }
  }, [open, mode, initialValue]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "create" ? "Add Customer" : "Edit Customer"}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <label className="text-sm text-slate-700">
            Name *
            <input className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="text-sm text-slate-700">
            Company *
            <input className={inp} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
          </label>
          <label className="text-sm text-slate-700">
            Email
            <input type="email" className={inp} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="text-sm text-slate-700">
            Phone
            <input className={inp} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="text-sm text-slate-700">
            Position
            <input className={inp} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          </label>
          <label className="text-sm text-slate-700">
            Business Type
            <input className={inp} value={form.business_type} onChange={(e) => setForm({ ...form, business_type: e.target.value })} />
          </label>
          <label className="text-sm text-slate-700 sm:col-span-2">
            Address
            <input className={inp} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <label className="text-sm text-slate-700">
            Website
            <input className={inp} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
          </label>
          <label className="text-sm text-slate-700">
            Apply Month
            <input type="month" className={inp} value={form.apply_month} onChange={(e) => setForm({ ...form, apply_month: e.target.value })} />
          </label>
          <label className="text-sm text-slate-700">
            Level
            <select className={inp} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as FormValue["level"] })}>
              {CUSTOMER_LEVELS.map((l) => (
                <option key={l} value={l}>Level {l}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700">
            Status
            <select className={inp} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FormValue["status"] })}>
              {CUSTOMER_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </label>

          <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
