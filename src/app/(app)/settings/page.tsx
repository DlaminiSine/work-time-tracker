import type { Metadata } from "next";
import Link from "next/link";
import { Building2, FolderKanban, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage profile defaults and the company/project structure used by timer and reporting."
      />
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" aria-hidden="true" />
              Companies
            </CardTitle>
            <CardDescription>Create, edit, archive, and restore companies.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/settings/companies">Manage companies</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="size-4 text-primary" aria-hidden="true" />
              Projects
            </CardTitle>
            <CardDescription>Assign projects to companies, targets, rates, and colors.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/settings/projects">Manage projects</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-4 text-primary" aria-hidden="true" />
            Account defaults
          </CardTitle>
          <CardDescription>Stored on the profile created during registration and used by reporting helpers.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div>Timezone: America/New_York</div>
          <div>Clock: 12-hour</div>
          <div>Week starts: Sunday</div>
          <div>Currency: USD</div>
        </CardContent>
      </Card>
    </div>
  );
}
