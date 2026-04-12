import type { Customer, FollowUp } from "./types";
import { createClient } from "./supabase-browser";

function sb() {
  return createClient();
}

function normalizeText(value: string | undefined | null): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

function toInsertRow(c: Omit<Customer, "id">) {
  return {
    name: normalizeText(c.name),
    business_type: normalizeText(c.business_type),
    company: normalizeText(c.company),
    address: normalizeText(c.address),
    website: normalizeText(c.website),
    apply_month: normalizeText(c.apply_month),
    phone: normalizeText(c.phone),
    position: normalizeText(c.position),
    email: normalizeText(c.email),
    level: c.level || "C",
    status: c.status || "new",
    last_contacted_at: c.last_contacted_at || null,
    created_by: c.created_by,
  };
}

function fromRow(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    name: (row.name as string) ?? "",
    business_type: (row.business_type as string) ?? "",
    company: (row.company as string) ?? "",
    address: (row.address as string) ?? "",
    website: (row.website as string) ?? "",
    apply_month: (row.apply_month as string) ?? "",
    phone: (row.phone as string) ?? "",
    position: (row.position as string) ?? "",
    email: (row.email as string) ?? "",
    level: ((row.level as string) ?? "C") as Customer["level"],
    status: ((row.status as string) ?? "new") as Customer["status"],
    last_contacted_at: (row.last_contacted_at as string) ?? null,
    created_by: (row.created_by as string) ?? null,
  };
}

// ──── Customers ────

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await sb()
    .from("customers")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(fromRow);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const { data, error } = await sb()
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return fromRow(data);
}

export async function addCustomer(
  customer: Omit<Customer, "id">,
): Promise<Customer> {
  const { data, error } = await sb()
    .from("customers")
    .insert(toInsertRow(customer))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return fromRow(data);
}

export async function updateCustomer(customer: Customer): Promise<void> {
  const { error } = await sb()
    .from("customers")
    .update(toInsertRow(customer))
    .eq("id", customer.id);
  if (error) throw new Error(error.message);
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await sb().from("customers").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function importCustomers(
  customers: Omit<Customer, "id">[],
): Promise<{ inserted: number; skipped: number }> {
  if (customers.length === 0) return { inserted: 0, skipped: 0 };

  const existing = await getCustomers();
  const existingEmails = new Set(
    existing.map((c) => c.email.trim().toLowerCase()).filter(Boolean),
  );

  const seen = new Set<string>();
  const unique: Omit<Customer, "id">[] = [];

  for (const c of customers) {
    const email = c.email.trim().toLowerCase();
    if (!email || existingEmails.has(email) || seen.has(email)) continue;
    seen.add(email);
    unique.push(c);
  }

  const skipped = customers.length - unique.length;
  if (unique.length === 0) return { inserted: 0, skipped };

  const BATCH = 200;
  let inserted = 0;
  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH).map(toInsertRow);
    const { error, count } = await sb()
      .from("customers")
      .insert(batch, { count: "exact" });
    if (error) throw new Error(error.message);
    inserted += count ?? batch.length;
  }
  return { inserted, skipped };
}

// ──── Follow-ups ────

export async function getFollowUps(customerId: string): Promise<FollowUp[]> {
  const { data, error } = await sb()
    .from("follow_ups")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as FollowUp[];
}

export async function addFollowUp(
  followUp: Omit<FollowUp, "id" | "created_at">,
): Promise<FollowUp> {
  const { data, error } = await sb()
    .from("follow_ups")
    .insert({
      customer_id: followUp.customer_id,
      content: followUp.content,
      next_action: followUp.next_action || null,
      created_by: followUp.created_by,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  // Update last_contacted_at on customer
  await sb()
    .from("customers")
    .update({ last_contacted_at: new Date().toISOString() })
    .eq("id", followUp.customer_id);

  return data as FollowUp;
}
