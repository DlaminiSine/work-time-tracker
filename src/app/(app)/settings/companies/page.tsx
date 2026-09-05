import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";
import { CompanyArchiveButton } from "@/components/companies/company-archive-button";
import { CompanyForm } from "@/components/companies/company-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { isSupabaseConfigured } from "@/lib/env";
import { getCompaniesForUser } from "@/lib/companies/queries";
import { getCurrentUser } from "@/lib/supabase/auth";
import type { Company } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Companies",
};

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CompaniesPage({
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
  let companies: Company[] = [];
  let loadError: string | null = null;

  try {
    companies = await getCompaniesForUser({ userId: user.id, includeArchived });
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load companies.";
  }

  const activeCount = companies.filter((company) => !company.is_archived).length;
  const archivedCount = companies.filter((company) => company.is_archived).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description="Manage the clients, employers, and personal contexts your projects belong to."
      >
        <Button asChild variant="outline">
          <Link href="/settings">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Settings
          </Link>
        </Button>
        <Button asChild variant={includeArchived ? "secondary" : "outline"}>
          <Link href={includeArchived ? "/settings/companies" : "/settings/companies?archived=true"}>
            {includeArchived ? "Hide archived" : "Show archived"}
          </Link>
        </Button>
      </PageHeader>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>New company</CardTitle>
            <CardDescription>Use a short name and a color that will scan well in reports.</CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyForm />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge>{activeCount} active</Badge>
            {includeArchived ? <Badge>{archivedCount} archived</Badge> : null}
          </div>

          {loadError ? (
            <EmptyState title="Companies could not load" description={loadError} />
          ) : companies.length === 0 ? (
            <EmptyState
              title={includeArchived ? "No companies yet" : "No active companies"}
              description="Create a company to start grouping projects for timer and reporting work."
            />
          ) : (
            <div className="grid gap-4">
              {companies.map((company) => (
                <Card key={company.id}>
                  <CardHeader className="gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <span
                            className="size-3 shrink-0 rounded-full"
                            style={{ backgroundColor: company.color }}
                            aria-hidden="true"
                          />
                          <span className="truncate">{company.name}</span>
                        </CardTitle>
                        <CardDescription>{company.description || "No description"}</CardDescription>
                      </div>
                      <div className="flex shrink-0 items-start gap-2">
                        {company.is_archived ? <Badge>Archived</Badge> : null}
                        <CompanyArchiveButton companyId={company.id} isArchived={company.is_archived} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <details className="group rounded-md border bg-background p-3">
                      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium">
                        <Building2 className="size-4 text-primary" aria-hidden="true" />
                        Edit company
                      </summary>
                      <div className="mt-4">
                        <CompanyForm company={company} mode="edit" />
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
