"use client";

import * as React from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { FieldMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialAuthActionState } from "@/lib/auth/action-state";
import { forgotPasswordValuesToFormData } from "@/lib/auth/form-data";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validations/auth";

export function ForgotPasswordForm({ isConfigured }: { isConfigured: boolean }) {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialAuthActionState);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  function submitValidForm(values: ForgotPasswordValues) {
    React.startTransition(() => {
      formAction(forgotPasswordValuesToFormData(values));
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
      <FieldMessage tone={state.status === "success" ? "success" : "error"}>{state.message}</FieldMessage>
      {!isConfigured ? (
        <FieldMessage tone="muted">Add Supabase environment variables to enable password reset emails.</FieldMessage>
      ) : null}
      <Button className="w-full" size="lg" type="submit" disabled={disabled}>
        {isPending ? "Sending..." : "Send reset email"}
      </Button>
    </form>
  );
}
