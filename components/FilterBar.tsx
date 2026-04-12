"use client";

export interface FilterState {
  keyword: string;
  region: string;
}

interface FilterBarProps {
  filters: FilterState;
  regionOptions: string[];
  onChange: (next: FilterState) => void;
}

export function FilterBar({ filters, regionOptions, onChange }: FilterBarProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-4">
        <label className="text-sm text-slate-700 md:col-span-3">
          搜索（姓名/公司/邮箱/电话/官网/业务类型/职位）
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
            placeholder="输入关键词..."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          />
        </label>
        <label className="text-sm text-slate-700">
          地区筛选
          <select
            value={filters.region}
            onChange={(e) => onChange({ ...filters, region: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          >
            <option value="ALL">全部地区</option>
            {regionOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
