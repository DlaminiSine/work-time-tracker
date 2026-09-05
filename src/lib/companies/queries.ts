import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Company } from "@/lib/supabase/types";

export type CompanySummary = Pick<Company, "id" | "name" | "color" | "is_archived">;

export async function getCompaniesForUser({
  userId,
  includeArchived = false,
}: {
  userId: string;
  includeArchived?: boolean;
}) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("companies").select("*").eq("user_id", userId);

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query.order("is_archived", { ascending: true }).order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load companies: ${error.message}`);
  }

  return data ?? [];
}

export async function getCompanySummariesForUser(userId: string) {
  const companies = await getCompaniesForUser({ userId, includeArchived: true });

  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    color: company.color,
    is_archived: company.is_archived,
  }));
}
