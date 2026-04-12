"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Customer } from "@/lib/types";

interface CustomerFormProps {
  open: boolean;
  mode: "create" | "edit";
  initialValue?: Customer | null;
  onClose: () => void;
  onSubmit: (customer: Customer) => void;
  submitting?: boolean;
}

type CustomerFormValue = Omit<Customer, "id">;

const emptyValue: CustomerFormValue = {
  name: "",
  business_type: "",
  company: "",
  address: "",
  website: "",
  apply_month: "",
  phone: "",
  position: "",
  email: "",
};

function inputClassName() {
  return "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring";
}

export function CustomerForm({
  open,
  mode,
  initialValue,
  onClose,
  onSubmit,
  submitting = false,
}: CustomerFormProps) {
  const [form, setForm] = useState<CustomerFormValue>(emptyValue);

  const title = useMemo(
    () => (mode === "create" ? "新增客户" : "编辑客户"),
    [mode],
  );

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialValue) {
      const { id: _id, ...rest } = initialValue;
      setForm({ ...emptyValue, ...rest });
      return;
    }
    setForm(emptyValue);
  }, [open, mode, initialValue]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    console.log("🔥 submit triggered");
    e.preventDefault();
    if (submitting) return;
    const customer: Customer = {
      id: mode === "edit" && initialValue ? initialValue.id : "",
      ...form,
    };
    onSubmit(customer);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            关闭
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            客户姓名 (name)
            <input
              className={inputClassName()}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label className="text-sm text-slate-700">
            公司 (company)
            <input
              className={inputClassName()}
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              required
            />
          </label>
          <label className="text-sm text-slate-700">
            业务类型 (business_type)
            <input
              className={inputClassName()}
              value={form.business_type}
              onChange={(e) => setForm({ ...form, business_type: e.target.value })}
            />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            地址 (address)
            <input
              className={inputClassName()}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>
          <label className="text-sm text-slate-700">
            官网 (website)
            <input
              className={inputClassName()}
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://"
            />
          </label>
          <label className="text-sm text-slate-700">
            电话 (phone)
            <input
              className={inputClassName()}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label className="text-sm text-slate-700">
            职位 (position)
            <input
              className={inputClassName()}
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </label>
          <label className="text-sm text-slate-700">
            申请月份 (apply_month)
            <input
              type="month"
              className={inputClassName()}
              value={form.apply_month}
              onChange={(e) => setForm({ ...form, apply_month: e.target.value })}
            />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            邮箱 (email)
            <input
              type="email"
              className={inputClassName()}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <div className="mt-2 flex justify-end gap-2 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              {submitting ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
