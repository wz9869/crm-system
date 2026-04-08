"use client";

import { CUSTOMER_GRADES, PROJECT_STAGES } from "@/lib/types";

export interface FilterState {
  grade: "ALL" | (typeof CUSTOMER_GRADES)[number];
  projectStage: "ALL" | (typeof PROJECT_STAGES)[number];
  keyword: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm text-slate-700">
          搜索（姓名/公司/邮箱/WhatsApp）
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
            placeholder="输入关键词..."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          />
        </label>

        <label className="text-sm text-slate-700">
          等级筛选
          <select
            value={filters.grade}
            onChange={(e) =>
              onChange({
                ...filters,
                grade: e.target.value as FilterState["grade"],
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          >
            <option value="ALL">全部等级</option>
            {CUSTOMER_GRADES.map((grade) => (
              <option key={grade} value={grade}>
                {grade}级
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-700">
          跟进状态筛选
          <select
            value={filters.projectStage}
            onChange={(e) =>
              onChange({
                ...filters,
                projectStage: e.target.value as FilterState["projectStage"],
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          >
            <option value="ALL">全部状态</option>
            {PROJECT_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
