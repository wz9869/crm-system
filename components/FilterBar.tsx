"use client";

import { CUSTOMER_LEVELS, CUSTOMER_STATUSES } from "@/lib/types";
import { stateFullName } from "@/lib/regions";

export interface FilterState {
  keyword: string;
  level: string;
  status: string;
  state: string;
}

interface FilterBarProps {
  filters: FilterState;
  stateOptions: string[];
  onChange: (next: FilterState) => void;
}

const sel =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring";

export function FilterBar({ filters, stateOptions, onChange }: FilterBarProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          value={filters.state}
          onChange={(e) => onChange({ ...filters, state: e.target.value })}
          className={sel}
        >
          <option value="ALL">All States</option>
          {stateOptions.map((abbr) => (
            <option key={abbr} value={abbr}>{abbr} - {stateFullName(abbr)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
