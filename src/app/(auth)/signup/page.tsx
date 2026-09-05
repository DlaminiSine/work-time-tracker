import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Create Account",
};

export default async function SignupPage() {
  const { isConfigured, user } = await getCurrentUser();

  if (isConfigured && user) {
    redirect("/timer");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Profiles are created automatically after registration.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SignupForm isConfigured={isConfigured} />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button asChild variant="link">
            <Link href="/login">Sign in</Link>
          </Button>
        </p>
      </CardContent>
    </Card>
  );
}
