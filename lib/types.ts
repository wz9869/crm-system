export const CUSTOMER_LEVELS = ["A", "B", "C"] as const;
export const CUSTOMER_STATUSES = ["new", "following", "closed", "invalid"] as const;

export type CustomerLevel = (typeof CUSTOMER_LEVELS)[number];
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

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
  level: CustomerLevel;
  status: CustomerStatus;
  last_contacted_at: string | null;
  created_by: string | null;
  owner_id: string | null;
  is_public_pool: boolean;
}

export interface FollowUp {
  id: string;
  customer_id: string;
  content: string;
  next_action: string;
  created_at: string;
  created_by: string | null;
}
