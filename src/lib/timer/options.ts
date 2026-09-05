import "server-only";

import { getCompaniesForUser, type CompanySummary } from "@/lib/companies/queries";
import { getProjectsForUser } from "@/lib/projects/queries";
import type { Project } from "@/lib/supabase/types";

export type ProjectOption = Pick<Project, "id" | "name" | "company_id" | "color">;

export type CompanyProjectOption = CompanySummary & {
  projects: ProjectOption[];
};

export async function getActiveCompanyProjectOptions(userId: string): Promise<CompanyProjectOption[]> {
  const [companies, projects] = await Promise.all([
    getCompaniesForUser({ userId, includeArchived: false }),
    getProjectsForUser({ userId, includeArchived: false }),
  ]);
  const activeCompanies = companies.filter((company) => !company.is_archived);
  const activeCompanyIds = new Set(activeCompanies.map((company) => company.id));
  const projectsByCompanyId = new Map<string, ProjectOption[]>();

  projects
    .filter((project) => activeCompanyIds.has(project.company_id))
    .forEach((project) => {
      const options = projectsByCompanyId.get(project.company_id) ?? [];
      options.push({
        id: project.id,
        name: project.name,
        company_id: project.company_id,
        color: project.color,
      });
      projectsByCompanyId.set(project.company_id, options);
    });

  return activeCompanies.map((company) => ({
    id: company.id,
    name: company.name,
    color: company.color,
    is_archived: company.is_archived,
    projects: projectsByCompanyId.get(company.id) ?? [],
  }));
}
