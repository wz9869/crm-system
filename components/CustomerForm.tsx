"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  BUDGET_CLARITY_LEVELS,
  PROJECT_STAGES,
  RESPONSE_SPEED_LEVELS,
  SOURCES,
  type Customer,
} from "@/lib/types";

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
  company: "",
  brand: "",
  country: "",
  email: "",
  whatsapp: "",
  source: "Google",
  interestedProducts: "",
  projectStage: "New Inquiry",
  estimatedQuantity: 1,
  budgetClarity: "Medium",
  responseSpeed: "Medium",
  lastContactDate: "",
  nextFollowUpDate: "",
  notes: "",
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
      setForm(rest);
      return;
    }
    setForm(emptyValue);
  }, [open, mode, initialValue]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    console.log("🔥 submit triggered");
    e.preventDefault();
    const customer: Customer = {
      id: mode === "edit" && initialValue ? initialValue.id : "",
      ...form,
      estimatedQuantity: Number(form.estimatedQuantity) || 0,
    };
    if (submitting) return;
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
            客户姓名
            <input
              className={inputClassName()}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label className="text-sm text-slate-700">
            公司
            <input
              className={inputClassName()}
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              required
            />
          </label>

          <label className="text-sm text-slate-700">
            品牌
            <input
              className={inputClassName()}
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="SmartWings / Sombra Shades"
            />
          </label>
          <label className="text-sm text-slate-700">
            国家
            <input
              className={inputClassName()}
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </label>

          <label className="text-sm text-slate-700">
            邮箱
            <input
              type="email"
              className={inputClassName()}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="text-sm text-slate-700">
            WhatsApp
            <input
              className={inputClassName()}
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
          </label>

          <label className="text-sm text-slate-700">
            来源
            <select
              className={inputClassName()}
              value={form.source}
              onChange={(e) =>
                setForm({ ...form, source: e.target.value as Customer["source"] })
              }
            >
              {SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700">
            项目阶段
            <select
              className={inputClassName()}
              value={form.projectStage}
              onChange={(e) =>
                setForm({
                  ...form,
                  projectStage: e.target.value as Customer["projectStage"],
                })
              }
            >
              {PROJECT_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-700">
            预估数量
            <input
              type="number"
              min={0}
              className={inputClassName()}
              value={form.estimatedQuantity}
              onChange={(e) =>
                setForm({ ...form, estimatedQuantity: Number(e.target.value) })
              }
            />
          </label>
          <label className="text-sm text-slate-700">
            预算明确度
            <select
              className={inputClassName()}
              value={form.budgetClarity}
              onChange={(e) =>
                setForm({
                  ...form,
                  budgetClarity: e.target.value as Customer["budgetClarity"],
                })
              }
            >
              {BUDGET_CLARITY_LEVELS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-700">
            响应速度
            <select
              className={inputClassName()}
              value={form.responseSpeed}
              onChange={(e) =>
                setForm({
                  ...form,
                  responseSpeed: e.target.value as Customer["responseSpeed"],
                })
              }
            >
              {RESPONSE_SPEED_LEVELS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-700">
            最后联系日期
            <input
              type="date"
              className={inputClassName()}
              value={form.lastContactDate}
              onChange={(e) => setForm({ ...form, lastContactDate: e.target.value })}
            />
          </label>
          <label className="text-sm text-slate-700">
            下次跟进日期
            <input
              type="date"
              className={inputClassName()}
              value={form.nextFollowUpDate}
              onChange={(e) => setForm({ ...form, nextFollowUpDate: e.target.value })}
            />
          </label>

          <label className="text-sm text-slate-700 md:col-span-2">
            感兴趣产品
            <input
              className={inputClassName()}
              value={form.interestedProducts}
              onChange={(e) =>
                setForm({ ...form, interestedProducts: e.target.value })
              }
              placeholder="Motorized Roller Shades, Woven Shades..."
            />
          </label>

          <label className="text-sm text-slate-700 md:col-span-2">
            备注
            <textarea
              className={inputClassName()}
              rows={4}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
