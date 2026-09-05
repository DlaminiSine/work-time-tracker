"use client";

import * as React from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { createProjectAction, updateProjectAction } from "@/lib/projects/actions";
import { projectValuesToFormData } from "@/lib/projects/form-data";
import {
  projectColorDefault,
  projectFormSchema,
  type ProjectFormValues,
  weeklyTargetFields,
} from "@/lib/projects/validation";
import { initialFormActionState } from "@/lib/forms/action-state";
import { Button } from "@/components/ui/button";
import { FieldMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CompanySummary } from "@/lib/companies/queries";
import type { ProjectWithCompany } from "@/lib/projects/queries";

export function ProjectForm({
  project,
  companies,
  defaultCurrency,
  mode = "create",
}: {
  project?: ProjectWithCompany;
  companies: CompanySummary[];
  defaultCurrency: string;
  mode?: "create" | "edit";
}) {
  const action = mode === "edit" ? updateProjectAction : createProjectAction;
  const targetFields = weeklyTargetFields(project?.weekly_target_minutes ?? null);
  const [state, formAction, isPending] = useActionState(action, initialFormActionState);
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      companyId: project?.company_id ?? companies[0]?.id ?? "",
      name: project?.name ?? "",
      description: project?.description ?? "",
      weeklyTargetHours: targetFields.weeklyTargetHours,
      weeklyTargetMinutes: targetFields.weeklyTargetMinutes,
      hourlyRate: project?.hourly_rate == null ? "" : String(project.hourly_rate),
      currency: project?.currency ?? defaultCurrency,
      color: project?.color ?? projectColorDefault,
    },
  });

  function submitValidForm(values: ProjectFormValues) {
    React.startTransition(() => {
      formAction(projectValuesToFormData(values, project?.id));
    });
  }

  const hasCompanies = companies.length > 0;

  return (
    <form onSubmit={form.handleSubmit(submitValidForm)} className="space-y-4">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor={`${mode}-project-company-${project?.id ?? "new"}`}>Company</Label>
        <Select
          id={`${mode}-project-company-${project?.id ?? "new"}`}
          disabled={isPending || !hasCompanies}
          {...form.register("companyId")}
        >
          {!hasCompanies ? <option value="">Create a company first</option> : null}
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
              {company.is_archived ? " (archived)" : ""}
            </option>
          ))}
        </Select>
        <FieldMessage>{form.formState.errors.companyId?.message ?? state.fieldErrors?.companyId?.[0]}</FieldMessage>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${mode}-project-name-${project?.id ?? "new"}`}>Project name</Label>
        <Input id={`${mode}-project-name-${project?.id ?? "new"}`} disabled={isPending} {...form.register("name")} />
        <FieldMessage>{form.formState.errors.name?.message ?? state.fieldErrors?.name?.[0]}</FieldMessage>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${mode}-project-description-${project?.id ?? "new"}`}>Description</Label>
        <Textarea
          id={`${mode}-project-description-${project?.id ?? "new"}`}
          disabled={isPending}
          {...form.register("description")}
        />
        <FieldMessage>
          {form.formState.errors.description?.message ?? state.fieldErrors?.description?.[0]}
        </FieldMessage>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${mode}-project-target-hours-${project?.id ?? "new"}`}>Weekly target hours</Label>
          <Input
            id={`${mode}-project-target-hours-${project?.id ?? "new"}`}
            inputMode="numeric"
            disabled={isPending}
            {...form.register("weeklyTargetHours")}
          />
          <FieldMessage>
            {form.formState.errors.weeklyTargetHours?.message ?? state.fieldErrors?.weeklyTargetHours?.[0]}
          </FieldMessage>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${mode}-project-target-minutes-${project?.id ?? "new"}`}>Weekly target minutes</Label>
          <Input
            id={`${mode}-project-target-minutes-${project?.id ?? "new"}`}
            inputMode="numeric"
            disabled={isPending}
            {...form.register("weeklyTargetMinutes")}
          />
          <FieldMessage>
            {form.formState.errors.weeklyTargetMinutes?.message ?? state.fieldErrors?.weeklyTargetMinutes?.[0]}
          </FieldMessage>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${mode}-project-rate-${project?.id ?? "new"}`}>Hourly rate</Label>
          <Input
            id={`${mode}-project-rate-${project?.id ?? "new"}`}
            inputMode="decimal"
            disabled={isPending}
            {...form.register("hourlyRate")}
          />
          <FieldMessage>{form.formState.errors.hourlyRate?.message ?? state.fieldErrors?.hourlyRate?.[0]}</FieldMessage>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${mode}-project-currency-${project?.id ?? "new"}`}>Currency</Label>
          <Input
            id={`${mode}-project-currency-${project?.id ?? "new"}`}
            maxLength={3}
            autoCapitalize="characters"
            disabled={isPending}
            {...form.register("currency")}
          />
          <FieldMessage>{form.formState.errors.currency?.message ?? state.fieldErrors?.currency?.[0]}</FieldMessage>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${mode}-project-color-${project?.id ?? "new"}`}>Color</Label>
        <div className="flex items-center gap-3">
          <Input
            id={`${mode}-project-color-${project?.id ?? "new"}`}
            type="color"
            className="h-10 w-14 shrink-0 p-1"
            disabled={isPending}
            {...form.register("color")}
          />
        </div>
        <FieldMessage>{form.formState.errors.color?.message ?? state.fieldErrors?.color?.[0]}</FieldMessage>
      </div>
      <FieldMessage tone={state.status === "success" ? "success" : "error"}>{state.message}</FieldMessage>
      <Button type="submit" disabled={isPending || !hasCompanies}>
        {mode === "create" ? <Plus className="size-4" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
        {isPending ? "Saving..." : mode === "create" ? "Create project" : "Save project"}
      </Button>
    </form>
  );
}
