export * from "@/lib/types";
export const SOURCES = [
  "Google",
  "WhatsApp",
  "Referral",
  "Dealer",
  "Exhibition",
  "Other",
] as const;

export const PROJECT_STAGES = [
  "New Inquiry",
  "Sampling",
  "Quoting",
  "Negotiating",
  "Closed Won",
  "Closed Lost",
] as const;

export const BUDGET_CLARITY_LEVELS = ["High", "Medium", "Low"] as const;
export const RESPONSE_SPEED_LEVELS = ["Fast", "Medium", "Slow"] as const;
export const CUSTOMER_GRADES = ["A", "B", "C", "D"] as const;

export type Source = (typeof SOURCES)[number];
export type ProjectStage = (typeof PROJECT_STAGES)[number];
export type BudgetClarity = (typeof BUDGET_CLARITY_LEVELS)[number];
export type ResponseSpeed = (typeof RESPONSE_SPEED_LEVELS)[number];
export type CustomerGrade = (typeof CUSTOMER_GRADES)[number];

export interface Customer {
  id: string;
  name: string;
  company: string;
  brand: string;
  country: string;
  email: string;
  whatsapp: string;
  source: Source;
  interestedProducts: string;
  projectStage: ProjectStage;
  estimatedQuantity: number;
  budgetClarity: BudgetClarity;
  responseSpeed: ResponseSpeed;
  lastContactDate: string;
  nextFollowUpDate: string;
  notes: string;
}
