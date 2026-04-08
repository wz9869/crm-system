import { supabase } from "@/src/lib/supabase";
import type { Customer, CustomerInsertRow, CustomerRow } from "./types";

const TABLE = "customers";

function normalizeDate(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeNumber(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value);
}

function toInsertRow(customer: Customer): CustomerInsertRow {
  return {
    name: normalizeText(customer.name),
    company: normalizeText(customer.company),
    brand: normalizeText(customer.brand),
    country: normalizeText(customer.country),
    email: normalizeText(customer.email),
    whatsapp: normalizeText(customer.whatsapp),
    source: customer.source,
    interested_products: normalizeText(customer.interestedProducts),
    project_stage: customer.projectStage,
    estimated_quantity: normalizeNumber(customer.estimatedQuantity),
    budget_clarity: customer.budgetClarity,
    response_speed: customer.responseSpeed,
    last_contact_date: normalizeDate(customer.lastContactDate),
    next_follow_up_date: normalizeDate(customer.nextFollowUpDate),
    notes: normalizeText(customer.notes),
  };
}

function normalizeSource(value: CustomerRow["source"]): Customer["source"] {
  return value ?? "Other";
}

function normalizeProjectStage(
  value: CustomerRow["project_stage"],
): Customer["projectStage"] {
  return value ?? "New Inquiry";
}

function normalizeBudget(
  value: CustomerRow["budget_clarity"],
): Customer["budgetClarity"] {
  return value ?? "Medium";
}

function normalizeSpeed(
  value: CustomerRow["response_speed"],
): Customer["responseSpeed"] {
  return value ?? "Medium";
}

function fromRow(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name ?? "",
    company: row.company ?? "",
    brand: row.brand ?? "",
    country: row.country ?? "",
    email: row.email ?? "",
    whatsapp: row.whatsapp ?? "",
    source: normalizeSource(row.source),
    interestedProducts: row.interested_products ?? "",
    projectStage: normalizeProjectStage(row.project_stage),
    estimatedQuantity: row.estimated_quantity ?? 0,
    budgetClarity: normalizeBudget(row.budget_clarity),
    responseSpeed: normalizeSpeed(row.response_speed),
    lastContactDate: row.last_contact_date ?? "",
    nextFollowUpDate: row.next_follow_up_date ?? "",
    notes: row.notes ?? "",
  };
}

async function listRows(): Promise<CustomerRow[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("next_follow_up_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`);
  }

  return (data ?? []) as CustomerRow[];
}

export async function getCustomers(): Promise<Customer[]> {
  const rows = await listRows();
  return rows.map(fromRow);
}

export async function saveCustomers(customers: Customer[]): Promise<void> {
  if (customers.length === 0) return;

  const payload = customers.map(toInsertRow);
  const { error } = await supabase.from(TABLE).insert(payload);

  if (error) {
    throw new Error(`Failed to save customers: ${error.message}`);
  }
}

export async function addCustomer(customer: Customer): Promise<Customer> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(toInsertRow(customer))
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add customer: ${error.message}`);
  }

  return fromRow(data as CustomerRow);
}

export async function updateCustomer(updatedCustomer: Customer): Promise<Customer[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(toInsertRow(updatedCustomer))
    .eq("id", updatedCustomer.id)
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to update customer: ${error.message}`);
  }
  if (!data?.id) {
    throw new Error("Failed to update customer: no matching record found.");
  }
  return getCustomers();
}

export async function deleteCustomer(customerId: string): Promise<Customer[]> {
  const { error, count } = await supabase
    .from(TABLE)
    .delete({ count: "exact" })
    .eq("id", customerId);
  if (error) {
    throw new Error(`Failed to delete customer: ${error.message}`);
  }
  if ((count ?? 0) === 0) {
    throw new Error("Failed to delete customer: no matching record found.");
  }
  return getCustomers();
}
