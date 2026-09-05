import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Database, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function Home() {
  const { isConfigured, user } = await getCurrentUser();

  if (isConfigured && user) {
    redirect("/timer");
  }

  if (isConfigured) {
    redirect("/login");
  }

  return (
    <main className="min-h-dvh bg-background px-5 py-8 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-5xl flex-col justify-center gap-8">
        <section className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1 text-sm text-muted-foreground">
            <LockKeyhole className="size-4 text-primary" aria-hidden="true" />
            Supabase connection required
          </div>
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
            Clockwise
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Phase 1 is ready to connect to Supabase. Add your public Supabase URL and anon key, apply the migration, then sign in to reach the protected workspace.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">
                Open login
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/signup">Create account</Link>
            </Button>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Database First</CardTitle>
              <CardDescription>Supabase PostgreSQL is the source of truth.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              The first migration creates profiles, companies, projects, work sessions, RLS policies, and the one-active-session guard.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Protected Routes</CardTitle>
              <CardDescription>App pages require a valid Supabase session.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Middleware refreshes sessions, auth pages handle sign up, login, logout, and password reset requests.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Runnable Setup</CardTitle>
              <CardDescription>Missing environment variables are explicit.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-start gap-3 text-sm text-muted-foreground">
              <Database className="mt-0.5 size-4 text-primary" aria-hidden="true" />
              No local storage fallback is used for work data.
            </CardContent>
          </Card>
        </section>
      </div>
      </main>
  );
}
