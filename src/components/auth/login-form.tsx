"use client";

import * as React from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signInAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { FieldMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialAuthActionState } from "@/lib/auth/action-state";
import { signInValuesToFormData } from "@/lib/auth/form-data";
import { signInSchema, type SignInValues } from "@/lib/validations/auth";

export function LoginForm({ isConfigured }: { isConfigured: boolean }) {
  const [state, formAction, isPending] = useActionState(signInAction, initialAuthActionState);
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function submitValidForm(values: SignInValues) {
    React.startTransition(() => {
      formAction(signInValuesToFormData(values));
    });
  }

  const disabled = isPending || !isConfigured;

  return (
    <form onSubmit={form.handleSubmit(submitValidForm)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" disabled={disabled} {...form.register("email")} />
        <FieldMessage>{form.formState.errors.email?.message ?? state.fieldErrors?.email?.[0]}</FieldMessage>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password">Password</Label>
          <Button asChild variant="link">
            <Link href="/forgot-password">Forgot password?</Link>
          </Button>
        </div>
        <Input id="password" type="password" autoComplete="current-password" disabled={disabled} {...form.register("password")} />
        <FieldMessage>{form.formState.errors.password?.message ?? state.fieldErrors?.password?.[0]}</FieldMessage>
      </div>
      <FieldMessage tone={state.status === "success" ? "success" : "error"}>{state.message}</FieldMessage>
      {!isConfigured ? (
        <FieldMessage tone="muted">Add Supabase environment variables to enable authentication.</FieldMessage>
      ) : null}
      <Button className="w-full" size="lg" type="submit" disabled={disabled}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
