export const CUSTOMER_GRADES = ["A", "B", "C", "D"] as const;
export type CustomerGrade = (typeof CUSTOMER_GRADES)[number];

/** 与 Supabase `customers` 表一致（snake_case） */
export interface Customer {
  id: string;
  name: string;
  business_type: string;
  company: string;
  address: string;
  website: string;
  apply_month: string;
  phone: string;
  position: string;
  email: string;
}

export interface CustomerRow {
  id: string;
  name: string | null;
  business_type: string | null;
  company: string | null;
  address: string | null;
  website: string | null;
  apply_month: string | null;
  phone: string | null;
  position: string | null;
  email: string | null;
}

export type CustomerInsertRow = Omit<CustomerRow, "id">;
