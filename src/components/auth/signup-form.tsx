"use client";

import * as React from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { FieldMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialAuthActionState } from "@/lib/auth/action-state";
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth";

export function SignupForm({ isConfigured }: { isConfigured: boolean }) {
  const [state, formAction, isPending] = useActionState(signUpAction, initialAuthActionState);
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  function submitValidForm(_values: SignUpValues, event?: React.BaseSyntheticEvent) {
    const formElement = event?.currentTarget;

    if (!(formElement instanceof HTMLFormElement)) {
      return;
    }

    const formData = new FormData(formElement);

    React.startTransition(() => {
      formAction(formData);
    });
  }

  const disabled = isPending || !isConfigured;

  return (
    <form onSubmit={form.handleSubmit(submitValidForm)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="fullName">Name</Label>
        <Input id="fullName" autoComplete="name" disabled={disabled} {...form.register("fullName")} />
        <FieldMessage>{form.formState.errors.fullName?.message ?? state.fieldErrors?.fullName?.[0]}</FieldMessage>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" disabled={disabled} {...form.register("email")} />
        <FieldMessage>{form.formState.errors.email?.message ?? state.fieldErrors?.email?.[0]}</FieldMessage>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" disabled={disabled} {...form.register("password")} />
        <FieldMessage>{form.formState.errors.password?.message ?? state.fieldErrors?.password?.[0]}</FieldMessage>
      </div>
      <FieldMessage tone={state.status === "success" ? "success" : "error"}>{state.message}</FieldMessage>
      {!isConfigured ? (
        <FieldMessage tone="muted">Add Supabase environment variables to enable registration.</FieldMessage>
      ) : null}
      <Button className="w-full" size="lg" type="submit" disabled={disabled}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
