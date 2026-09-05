import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const { isConfigured, user } = await getCurrentUser();

  if (isConfigured && user) {
    redirect("/timer");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your private time-tracking workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <LoginForm isConfigured={isConfigured} />
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Button asChild variant="link">
            <Link href="/signup">Create an account</Link>
          </Button>
        </p>
      </CardContent>
    </Card>
  );
}
