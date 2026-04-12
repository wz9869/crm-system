"use client";

import { useEffect, useMemo, useState } from "react";
import { CustomerForm } from "@/components/CustomerForm";
import { CustomerTable } from "@/components/CustomerTable";
import { FilterBar, type FilterState } from "@/components/FilterBar";
import { StatsCards } from "@/components/StatsCards";
import { ImportCustomers } from "@/components/ImportCustomers";
import {
  addCustomer,
  deleteCustomer,
  getCustomers,
  importCustomers,
  updateCustomer,
} from "@/lib/storage";
import { buildStateOptions, extractStateAbbr } from "@/lib/regions";
import type { Customer } from "@/lib/types";

const defaultFilters: FilterState = {
  keyword: "",
  state: "ALL",
};

function cell(v: string): string {
  return v.trim() ? v : "—";
}

function matchesKeyword(customer: Customer, keyword: string): boolean {
  const term = keyword.trim().toLowerCase();
  if (!term) return true;
  return [
    customer.name,
    customer.company,
    customer.email,
    customer.phone,
    customer.website,
    customer.business_type,
    customer.position,
    customer.address,
    customer.apply_month,
  ]
    .join(" ")
    .toLowerCase()
    .includes(term);
}

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCustomers() {
      try {
        const list = await getCustomers();
        if (!active) return;
        setCustomers(list);
        setErrorMessage("");
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : "加载客户数据失败。";
        setErrorMessage(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCustomers();
    return () => {
      active = false;
    };
  }, []);

  const stateOptions = useMemo(
    () => buildStateOptions(customers.map((c) => c.address)),
    [customers],
  );

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!matchesKeyword(c, filters.keyword)) return false;
      if (filters.state !== "ALL" && extractStateAbbr(c.address) !== filters.state)
        return false;
      return true;
    });
  }, [customers, filters.keyword, filters.state]);

  const stats = useMemo(() => {
    const total = customers.length;
    return { total, aGradeCount: 0, dueCount: 0, todayCount: 0 };
  }, [customers]);

  const openCreateModal = () => {
    setFormMode("create");
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setFormMode("edit");
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const handleDelete = async (customerId: string) => {
    if (deletingId) return;
    const confirmed = window.confirm("确定删除该客户吗？此操作不可撤销。");
    if (!confirmed) return;
    setDeletingId(customerId);
    try {
      const next = await deleteCustomer(customerId);
      setCustomers(next);
      if (selectedCustomer?.id === customerId) setSelectedCustomer(null);
      setErrorMessage("");
      setSuccessMessage("客户已删除。");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "删除客户失败，请稍后重试。";
      setErrorMessage(message);
      setSuccessMessage("");
      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (customer: Customer) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (formMode === "create") {
        const inserted = await addCustomer(customer);
        const latest = await getCustomers();
        setCustomers(latest);
        setFormOpen(false);
        setSelectedCustomer(inserted);
        setErrorMessage("");
        setSuccessMessage("客户新增成功。");
        console.log("save success");
        return;
      }

      const updatedList = await updateCustomer(customer);
      const latest = await getCustomers();
      setCustomers(latest.length > 0 ? latest : updatedList);
      setFormOpen(false);
      setSelectedCustomer(
        (latest.length > 0 ? latest : updatedList).find((c) => c.id === customer.id) ??
          customer,
      );
      setErrorMessage("");
      setSuccessMessage("客户更新成功。");
      console.log("save success");
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "保存客户失败，请稍后重试。";
      setErrorMessage(message);
      setSuccessMessage("");
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImport = async (rows: Omit<Customer, "id">[]) => {
    const { inserted } = await importCustomers(rows);
    const latest = await getCustomers();
    setCustomers(latest);
    setSuccessMessage(`成功导入 ${inserted} 位客户。`);
    setErrorMessage("");
  };

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              客户分级系统 CRM Lite
            </h1>
            <p className="text-sm text-slate-500">
              电动窗帘/智能窗帘销售客户管理后台
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              导入 Excel / CSV
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              + 新增客户
            </button>
          </div>
        </header>

        <StatsCards
          total={stats.total}
          aGradeCount={stats.aGradeCount}
          dueCount={stats.dueCount}
          todayCount={stats.todayCount}
        />

        <FilterBar filters={filters} stateOptions={stateOptions} onChange={setFilters} />

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            正在加载客户数据...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
          <CustomerTable
            customers={filteredCustomers}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onSelect={setSelectedCustomer}
          />

          <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {!selectedCustomer ? (
              <div className="text-sm text-slate-500">
                点击表格中的客户姓名可查看详情。
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {cell(selectedCustomer.name)}
                  </h2>
                  <p className="text-slate-500">{cell(selectedCustomer.company)}</p>
                </div>

                <p>
                  <span className="font-medium text-slate-700">公司：</span>
                  {cell(selectedCustomer.company)}
                </p>
                <p>
                  <span className="font-medium text-slate-700">地址：</span>
                  {cell(selectedCustomer.address)}
                </p>
                <p>
                  <span className="font-medium text-slate-700">官网：</span>
                  {cell(selectedCustomer.website)}
                </p>
                <p>
                  <span className="font-medium text-slate-700">电话：</span>
                  {cell(selectedCustomer.phone)}
                </p>
                <p>
                  <span className="font-medium text-slate-700">邮箱：</span>
                  {cell(selectedCustomer.email)}
                </p>
                <p>
                  <span className="font-medium text-slate-700">职位：</span>
                  {cell(selectedCustomer.position)}
                </p>
                <p>
                  <span className="font-medium text-slate-700">业务类型：</span>
                  {cell(selectedCustomer.business_type)}
                </p>
                <p>
                  <span className="font-medium text-slate-700">申请月份：</span>
                  {cell(selectedCustomer.apply_month)}
                </p>

                <button
                  type="button"
                  onClick={() => openEditModal(selectedCustomer)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
                >
                  编辑当前客户
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>

      <CustomerForm
        open={formOpen}
        mode={formMode}
        initialValue={editingCustomer}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting || deletingId !== null}
      />

      <ImportCustomers
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </main>
  );
}
