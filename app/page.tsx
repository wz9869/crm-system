"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCustomers, addCustomer, deleteCustomer, importCustomers } from "@/lib/storage";
import { buildStateOptions, extractStateAbbr } from "@/lib/regions";
import { categorize } from "@/lib/categories";
import { exportCustomersToExcel } from "@/lib/export";
import type { Customer } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { StatsCards } from "@/components/StatsCards";
import { FilterBar, type FilterState } from "@/components/FilterBar";
import { CustomerTable } from "@/components/CustomerTable";
import { CustomerForm } from "@/components/CustomerForm";
import { ImportCustomers } from "@/components/ImportCustomers";

function daysAgo(d: string | null): number | null {
  if (!d) return null;
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({ keyword: "", level: "ALL", status: "ALL", state: "ALL", category: "ALL" });
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      setCustomers(await getCustomers());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) void load();
  }, [authLoading, user, load]);

  const stateOptions = useMemo(
    () => buildStateOptions(customers.map((c) => c.address)),
    [customers],
  );

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (filters.level !== "ALL" && c.level !== filters.level) return false;
      if (filters.status !== "ALL" && c.status !== filters.status) return false;
      if (filters.category !== "ALL" && categorize(c.business_type) !== filters.category) return false;
      if (filters.state !== "ALL" && extractStateAbbr(c.address) !== filters.state) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        const hay = [c.name, c.company, c.email, c.phone, c.address].join(" ").toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [customers, filters]);

  const stats = useMemo(() => {
    const total = customers.length;
    const aCount = customers.filter((c) => c.level === "A").length;
    const followingCount = customers.filter((c) => c.status === "following").length;
    const staleCount = customers.filter((c) => {
      const d = daysAgo(c.last_contacted_at);
      return d === null || d >= 7;
    }).length;
    return { total, aCount, followingCount, staleCount };
  }, [customers]);

  const handleAdd = async (data: Omit<Customer, "id" | "created_by">) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await addCustomer({ ...data, created_by: user.id });
      await load();
      setFormOpen(false);
      setMsg("Customer added.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setMsg("Customer deleted.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleImport = async (rows: Omit<Customer, "id">[]) => {
    if (!user) return;
    const withUser = rows.map((r) => ({ ...r, created_by: user.id }));
    const { inserted, skipped } = await importCustomers(withUser);
    await load();
    setMsg(`Imported ${inserted}, skipped ${skipped} duplicates.`);
  };

  if (authLoading) return null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">SmartWings Dealer CRM System</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => exportCustomersToExcel(filtered)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Export
            </button>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Import
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              + Add Customer
            </button>
          </div>
        </div>

        <StatsCards {...stats} />
        <FilterBar filters={filters} stateOptions={stateOptions} onChange={setFilters} />

        {msg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {msg}
            <button type="button" onClick={() => setMsg("")} className="ml-2 font-medium underline">
              dismiss
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <CustomerTable customers={filtered} onDelete={handleDelete} />
        )}

        <CustomerForm
          open={formOpen}
          mode="create"
          onClose={() => setFormOpen(false)}
          onSubmit={handleAdd}
          submitting={submitting}
        />

        <ImportCustomers
          open={importOpen}
          onClose={() => setImportOpen(false)}
          onImport={handleImport}
        />
      </main>
    </>
  );
}
