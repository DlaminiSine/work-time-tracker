import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FolderKanban, SlidersHorizontal } from "lucide-react";
import { ProjectArchiveButton } from "@/components/projects/project-archive-button";
import { ProjectForm } from "@/components/projects/project-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { formatDuration } from "@/lib/time/duration";
import { isSupabaseConfigured } from "@/lib/env";
import type { CompanySummary } from "@/lib/companies/queries";
import { getProjectManagementData, type ProjectWithCompany } from "@/lib/projects/queries";
import { getCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Projects",
};

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getEditableCompanyOptions(project: ProjectWithCompany, activeCompanies: CompanySummary[]) {
  if (!project.company || activeCompanies.some((company) => company.id === project.company_id)) {
    return activeCompanies;
  }

  return [...activeCompanies, project.company];
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const [{ user }, params] = await Promise.all([getCurrentUser(), searchParams]);

  if (!user) {
    redirect("/login");
  }

  const includeArchived = getSearchValue(params.archived) === "true";
  const requestedCompanyId = getSearchValue(params.companyId);
  const selectedCompanyId = requestedCompanyId && requestedCompanyId !== "all" ? requestedCompanyId : undefined;
  let data: Awaited<ReturnType<typeof getProjectManagementData>> | null = null;
  let loadError: string | null = null;

  try {
    data = await getProjectManagementData({
      userId: user.id,
      includeArchived,
      companyId: selectedCompanyId,
    });
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load projects.";
  }

  const activeCompanies = data?.activeCompanies ?? [];
  const projects = data?.projects ?? [];
  const activeProjectCount = projects.filter((project) => !project.is_archived).length;
  const archivedProjectCount = projects.filter((project) => project.is_archived).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Create project buckets under companies for weekly targets, rates, and reporting.">
        <Button asChild variant="outline">
          <Link href="/settings">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Settings
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
            Filters
          </CardTitle>
          <CardDescription>Archived projects stay hidden unless you choose to include them.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-[1fr_auto_auto]" action="/settings/projects">
            <Select name="companyId" defaultValue={selectedCompanyId ?? "all"} aria-label="Filter projects by company">
              <option value="all">All companies</option>
              {(data?.companies ?? []).map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                  {company.is_archived ? " (archived)" : ""}
                </option>
              ))}
            </Select>
            <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
              <input type="checkbox" name="archived" value="true" defaultChecked={includeArchived} />
              Include archived
            </label>
            <Button type="submit">Apply</Button>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>New project</CardTitle>
            <CardDescription>New projects can only be created under active companies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCompanies.length === 0 ? (
              <div className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
                Projects need an active company before they can be created.
              </div>
            ) : null}
            <ProjectForm companies={activeCompanies} defaultCurrency={data?.defaultCurrency ?? "USD"} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge>{activeProjectCount} active</Badge>
            {includeArchived ? <Badge>{archivedProjectCount} archived</Badge> : null}
          </div>

          {loadError ? (
            <EmptyState title="Projects could not load" description={loadError} />
          ) : projects.length === 0 ? (
            <EmptyState
              title={includeArchived ? "No projects yet" : "No active projects"}
              description="Create a project to prepare the Timer page selectors for Phase 3."
            />
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader className="gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <span
                            className="size-3 shrink-0 rounded-full"
                            style={{ backgroundColor: project.color }}
                            aria-hidden="true"
                          />
                          <span className="truncate">{project.name}</span>
                        </CardTitle>
                        <CardDescription>
                          {project.company?.name ?? "Company unavailable"}
                          {project.company?.is_archived ? " (company archived)" : ""}
                        </CardDescription>
                      </div>
                      <div className="flex shrink-0 items-start gap-2">
                        {project.is_archived ? <Badge>Archived</Badge> : null}
                        <ProjectArchiveButton projectId={project.id} isArchived={project.is_archived} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                      <div>
                        <div className="font-medium text-foreground">Weekly target</div>
                        {project.weekly_target_minutes ? formatDuration(project.weekly_target_minutes) : "No target"}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Hourly rate</div>
                        {project.hourly_rate == null ? "No rate" : `${project.currency} ${project.hourly_rate}`}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Description</div>
                        {project.description || "No description"}
                      </div>
                    </div>
                    <details className="group rounded-md border bg-background p-3">
                      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium">
                        <FolderKanban className="size-4 text-primary" aria-hidden="true" />
                        Edit project
                      </summary>
                      <div className="mt-4">
                        <ProjectForm
                          project={project}
                          mode="edit"
                          companies={getEditableCompanyOptions(project, activeCompanies)}
                          defaultCurrency={data?.defaultCurrency ?? "USD"}
                        />
                      </div>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
