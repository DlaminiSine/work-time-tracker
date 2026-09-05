import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Building2, Clock3, Database, FolderKanban, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getActiveCompanyProjectOptions } from "@/lib/timer/options";

export const metadata: Metadata = {
  title: "Timer",
};

export default async function TimerPage() {
  let companyCount = 0;
  let projectCount = 0;

  if (isSupabaseConfigured()) {
    const { user } = await getCurrentUser();

    if (!user) {
      redirect("/login");
    }

    const options = await getActiveCompanyProjectOptions(user.id);
    companyCount = options.length;
    projectCount = options.reduce((total, company) => total + company.projects.length, 0);
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">Timer</h1>
        <p className="max-w-2xl text-muted-foreground">
          The protected workspace is connected. Company, project, and session workflows are the next implementation phases.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="size-4 text-primary" aria-hidden="true" />
              Today
            </CardTitle>
            <CardDescription>Accumulated time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">0h 00m</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" aria-hidden="true" />
              Active companies
            </CardTitle>
            <CardDescription>Prepared for dependent selectors</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{companyCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="size-4 text-primary" aria-hidden="true" />
              Active projects
            </CardTitle>
            <CardDescription>Filtered by active company</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{projectCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-4 text-primary" aria-hidden="true" />
              Storage
            </CardTitle>
            <CardDescription>Supabase PostgreSQL</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Work sessions will be read from the database and calculated from timestamps.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Access
            </CardTitle>
            <CardDescription>Row Level Security</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Database policies scope every table to the signed-in user.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
