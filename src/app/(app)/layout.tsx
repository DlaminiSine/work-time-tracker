import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function ProtectedAppLayout({ children }: { children: ReactNode }) {
  const { isConfigured, user } = await getCurrentUser();

  if (!isConfigured) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-8">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Supabase connection required</CardTitle>
            <CardDescription>The protected workspace is available after environment variables are set.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Copy `.env.example` to `.env.local`, add your Supabase URL and anon key, then restart the dev server.</p>
            <p>Run the migration in `supabase/migrations` before creating the first account.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!user) {
    redirect("/login");
  }

  return <AppShell userEmail={user.email ?? "Signed in"}>{children}</AppShell>;
}
