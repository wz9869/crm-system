"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getCustomers,
  getMyCustomers,
  addCustomer,
  deleteCustomer,
  importCustomers,
  assignCustomer,
  unassignCustomer,
  getProfiles,
  type Profile,
} from "@/lib/storage";
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

type PoolTab = "all" | "pool" | "assigned";

function daysAgo(d: string | null): number | null {
  if (!d) return null;
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
}

export default function HomePage() {
  const { user, role, loading: authLoading } = useAuth();
  const isAdmin = role === "admin";
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staffList, setStaffList] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({ keyword: "", level: "ALL", status: "ALL", state: "ALL", category: "ALL" });
  const [poolTab, setPoolTab] = useState<PoolTab>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      if (isAdmin) {
        const [custs, profiles] = await Promise.all([getCustomers(), getProfiles()]);
        setCustomers(custs);
        setStaffList(profiles.filter((p) => p.role === "staff"));
      } else if (user) {
        setCustomers(await getMyCustomers(user.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user]);

  useEffect(() => {
    if (!authLoading && user) void load();
  }, [authLoading, user, load]);

  const stateOptions = useMemo(
    () => buildStateOptions(customers.map((c) => c.address)),
    [customers],
  );

  const tabbed = useMemo(() => {
    if (!isAdmin) return customers;
    if (poolTab === "pool") return customers.filter((c) => c.is_public_pool);
    if (poolTab === "assigned") return customers.filter((c) => !c.is_public_pool && c.owner_id);
    return customers;
  }, [customers, poolTab, isAdmin]);

  const filtered = useMemo(() => {
    return tabbed.filter((c) => {
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
  }, [tabbed, filters]);

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

  const handleAdd = async (data: Omit<Customer, "id" | "created_by" | "owner_id" | "is_public_pool">) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await addCustomer({ ...data, created_by: user.id, owner_id: null, is_public_pool: true });
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
    const withUser = rows.map((r) => ({ ...r, created_by: user.id, owner_id: null as string | null, is_public_pool: true }));
    const { inserted, skipped } = await importCustomers(withUser);
    await load();
    setMsg(`Imported ${inserted}, skipped ${skipped} duplicates.`);
  };

  const handleAssign = async (customerId: string, ownerId: string) => {
    try {
      await assignCustomer(customerId, ownerId);
      await load();
      setMsg("Customer assigned.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleUnassign = async (customerId: string) => {
    try {
      await unassignCustomer(customerId);
      await load();
      setMsg("Customer returned to public pool.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    }
  };

  if (authLoading) return null;

  const poolCounts = isAdmin
    ? {
        all: customers.length,
        pool: customers.filter((c) => c.is_public_pool).length,
        assigned: customers.filter((c) => !c.is_public_pool && c.owner_id).length,
      }
    : null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">
            {isAdmin ? "SmartWings Dealer CRM" : "My Customers"}
          </h1>
          <div className="flex gap-2">
            {isAdmin && (
              <>
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
              </>
            )}
          </div>
        </div>

        <StatsCards {...stats} />

        {/* Admin pool tabs */}
        {isAdmin && poolCounts && (
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm w-fit">
            {(["all", "pool", "assigned"] as const).map((tab) => {
              const labels: Record<PoolTab, string> = {
                all: `All (${poolCounts.all})`,
                pool: `Public Pool (${poolCounts.pool})`,
                assigned: `Assigned (${poolCounts.assigned})`,
              };
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPoolTab(tab)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    poolTab === tab
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        )}

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
          <CustomerTable
            customers={filtered}
            onDelete={isAdmin ? handleDelete : undefined}
            onAssign={isAdmin ? handleAssign : undefined}
            onUnassign={isAdmin ? handleUnassign : undefined}
            staffList={isAdmin ? staffList : undefined}
          />
        )}

        {isAdmin && (
          <>
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
          </>
        )}
      </main>
    </>
  );
}
