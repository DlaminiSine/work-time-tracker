import "server-only";

import { getCompanySummariesForUser, type CompanySummary } from "@/lib/companies/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, Project } from "@/lib/supabase/types";

export type ProjectWithCompany = Project & {
  company: CompanySummary | null;
};

export type ProjectManagementData = {
  projects: ProjectWithCompany[];
  companies: CompanySummary[];
  activeCompanies: CompanySummary[];
  defaultCurrency: string;
};

export async function getDefaultCurrencyForUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("default_currency")
    .eq("id", userId)
    .maybeSingle<Pick<Profile, "default_currency">>();

  if (error) {
    throw new Error(`Unable to load profile defaults: ${error.message}`);
  }

  return data?.default_currency ?? "USD";
}

export async function getProjectsForUser({
  userId,
  includeArchived = false,
  companyId,
}: {
  userId: string;
  includeArchived?: boolean;
  companyId?: string;
}) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("projects").select("*").eq("user_id", userId);

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query.order("is_archived", { ascending: true }).order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load projects: ${error.message}`);
  }

  return data ?? [];
}

export async function getProjectManagementData({
  userId,
  includeArchived = false,
  companyId,
}: {
  userId: string;
  includeArchived?: boolean;
  companyId?: string;
}): Promise<ProjectManagementData> {
  const [companies, defaultCurrency, projects] = await Promise.all([
    getCompanySummariesForUser(userId),
    getDefaultCurrencyForUser(userId),
    getProjectsForUser({ userId, includeArchived, companyId }),
  ]);
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const activeCompanies = companies.filter((company) => !company.is_archived);

  return {
    companies,
    activeCompanies,
    defaultCurrency,
    projects: projects.map((project) => ({
      ...project,
      company: companyById.get(project.company_id) ?? null,
    })),
  };
}
