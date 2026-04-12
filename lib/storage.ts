import { supabase } from "@/src/lib/supabase";
import type { Customer, CustomerInsertRow, CustomerRow } from "./types";

const TABLE = "customers";

function normalizeText(value: string | undefined | null): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

function toInsertRow(customer: Omit<Customer, "id">): CustomerInsertRow {
  return {
    name: normalizeText(customer.name),
    business_type: normalizeText(customer.business_type),
    company: normalizeText(customer.company),
    address: normalizeText(customer.address),
    website: normalizeText(customer.website),
    apply_month: normalizeText(customer.apply_month),
    phone: normalizeText(customer.phone),
    position: normalizeText(customer.position),
    email: normalizeText(customer.email),
  };
}

function fromRow(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name ?? "",
    business_type: row.business_type ?? "",
    company: row.company ?? "",
    address: row.address ?? "",
    website: row.website ?? "",
    apply_month: row.apply_month ?? "",
    phone: row.phone ?? "",
    position: row.position ?? "",
    email: row.email ?? "",
  };
}

async function listRows(): Promise<CustomerRow[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("name", { ascending: true });

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

export async function importCustomers(
  customers: Omit<Customer, "id">[],
): Promise<{ inserted: number }> {
  if (customers.length === 0) return { inserted: 0 };

  const BATCH_SIZE = 200;
  let inserted = 0;

  for (let i = 0; i < customers.length; i += BATCH_SIZE) {
    const batch = customers.slice(i, i + BATCH_SIZE).map(toInsertRow);
    const { error, count } = await supabase
      .from(TABLE)
      .insert(batch, { count: "exact" });

    if (error) {
      throw new Error(
        `Failed to import batch ${i + 1}–${i + batch.length}: ${error.message}`,
      );
    }
    inserted += count ?? batch.length;
  }

  return { inserted };
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
