import type { Customer } from "./types";

function toDateOnly(input: string): Date | null {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function todayDateOnly(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function isFollowUpDue(customer: Customer): boolean {
  const nextDate = toDateOnly(customer.nextFollowUpDate);
  if (!nextDate) return false;
  return nextDate.getTime() <= todayDateOnly().getTime();
}

export function isFollowUpToday(customer: Customer): boolean {
  const nextDate = toDateOnly(customer.nextFollowUpDate);
  if (!nextDate) return false;
  return nextDate.getTime() === todayDateOnly().getTime();
}
