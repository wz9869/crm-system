"use client";

import { CUSTOMER_LEVELS, CUSTOMER_STATUSES } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { stateFullName } from "@/lib/regions";
import type { Profile } from "@/lib/storage";

export interface FilterState {
  keyword: string;
  level: string;
  status: string;
  state: string;
  category: string;
  ownerId: string;
}

interface FilterBarProps {
  filters: FilterState;
  stateOptions: string[];
  staffList?: Profile[];
  onChange: (next: FilterState) => void;
}

const sel =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring";

export function FilterBar({ filters, stateOptions, staffList, onChange }: FilterBarProps) {
  const showOwnerFilter = staffList && staffList.length > 0;
  const cols = showOwnerFilter ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" : "sm:grid-cols-2 lg:grid-cols-5";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`grid gap-3 ${cols}`}>
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
          placeholder="Search name, company, email..."
          className={sel}
        />
        <select
          value={filters.level}
          onChange={(e) => onChange({ ...filters, level: e.target.value })}
          className={sel}
        >
          <option value="ALL">All Levels</option>
          {CUSTOMER_LEVELS.map((l) => (
            <option key={l} value={l}>Level {l}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className={sel}
        >
          <option value="ALL">All Statuses</option>
          {CUSTOMER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className={sel}
        >
          <option value="ALL">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filters.state}
          onChange={(e) => onChange({ ...filters, state: e.target.value })}
          className={sel}
        >
          <option value="ALL">All States</option>
          {stateOptions.map((abbr) => (
            <option key={abbr} value={abbr}>{abbr} - {stateFullName(abbr)}</option>
          ))}
        </select>
        {showOwnerFilter && (
          <select
            value={filters.ownerId}
            onChange={(e) => onChange({ ...filters, ownerId: e.target.value })}
            className={sel}
          >
            <option value="ALL">All Staff</option>
            <option value="POOL">Public Pool</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.email.split("@")[0]}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
