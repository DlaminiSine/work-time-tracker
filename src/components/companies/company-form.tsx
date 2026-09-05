"use client";

import * as React from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { createCompanyAction, updateCompanyAction } from "@/lib/companies/actions";
import { companyValuesToFormData } from "@/lib/companies/form-data";
import { companyColorDefault, companyFormSchema, type CompanyFormValues } from "@/lib/companies/validation";
import { initialFormActionState } from "@/lib/forms/action-state";
import { Button } from "@/components/ui/button";
import { FieldMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Company } from "@/lib/supabase/types";

export function CompanyForm({
  company,
  mode = "create",
}: {
  company?: Company;
  mode?: "create" | "edit";
}) {
  const action = mode === "edit" ? updateCompanyAction : createCompanyAction;
  const [state, formAction, isPending] = useActionState(action, initialFormActionState);
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: company?.name ?? "",
      description: company?.description ?? "",
      color: company?.color ?? companyColorDefault,
    },
  });

  function submitValidForm(values: CompanyFormValues) {
    React.startTransition(() => {
      formAction(companyValuesToFormData(values, company?.id));
    });
  }

  return (
    <form onSubmit={form.handleSubmit(submitValidForm)} className="space-y-4">
      {company ? <input type="hidden" name="id" value={company.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor={`${mode}-company-name-${company?.id ?? "new"}`}>Name</Label>
        <Input
          id={`${mode}-company-name-${company?.id ?? "new"}`}
          autoComplete="organization"
          disabled={isPending}
          {...form.register("name")}
        />
        <FieldMessage>{form.formState.errors.name?.message ?? state.fieldErrors?.name?.[0]}</FieldMessage>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${mode}-company-description-${company?.id ?? "new"}`}>Description</Label>
        <Textarea
          id={`${mode}-company-description-${company?.id ?? "new"}`}
          disabled={isPending}
          {...form.register("description")}
        />
        <FieldMessage>
          {form.formState.errors.description?.message ?? state.fieldErrors?.description?.[0]}
        </FieldMessage>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${mode}-company-color-${company?.id ?? "new"}`}>Color</Label>
        <div className="flex items-center gap-3">
          <Input
            id={`${mode}-company-color-${company?.id ?? "new"}`}
            type="color"
            className="h-10 w-14 shrink-0 p-1"
            disabled={isPending}
            {...form.register("color")}
          />
        </div>
        <FieldMessage>{form.formState.errors.color?.message ?? state.fieldErrors?.color?.[0]}</FieldMessage>
      </div>
      <FieldMessage tone={state.status === "success" ? "success" : "error"}>{state.message}</FieldMessage>
      <Button type="submit" disabled={isPending}>
        {mode === "create" ? <Plus className="size-4" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
        {isPending ? "Saving..." : mode === "create" ? "Create company" : "Save company"}
      </Button>
    </form>
  );
}
