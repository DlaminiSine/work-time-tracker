"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, FolderKanban, Play } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldMessage } from "@/components/ui/form-message";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { initialFormActionState } from "@/lib/forms/action-state";
import { getInitialTimerSelection, getNextProjectSelection, getProjectsForCompany } from "@/lib/timer/selectors";
import { clockInValuesToFormData } from "@/lib/work-sessions/form-data";
import { clockInFormSchema, type ClockInFormValues } from "@/lib/work-sessions/validation";
import { clockInAction } from "@/lib/work-sessions/actions";
import type { CompanyProjectOption } from "@/lib/timer/options";

export function ClockInForm({ options }: { options: CompanyProjectOption[] }) {
  const router = useRouter();
  const initialSelection = React.useMemo(() => getInitialTimerSelection(options), [options]);
  const [state, formAction, isPending] = useActionState(clockInAction, initialFormActionState);
  const [selection, setSelection] = React.useState(initialSelection);
  const form = useForm<ClockInFormValues>({
    resolver: zodResolver(clockInFormSchema),
    defaultValues: {
      companyId: initialSelection.companyId,
      projectId: initialSelection.projectId,
      taskDescription: "",
    },
  });
  const projects = getProjectsForCompany(options, selection.companyId);
  const hasCompanies = options.length > 0;
  const hasProjects = projects.length > 0;

  React.useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  function changeCompany(event: React.ChangeEvent<HTMLSelectElement>) {
    const companyId = event.target.value;
    const nextProjectId = getNextProjectSelection(options, companyId, selection.projectId);

    setSelection({ companyId, projectId: nextProjectId });
    form.setValue("companyId", companyId, { shouldDirty: true, shouldValidate: true });
    form.setValue("projectId", nextProjectId, { shouldDirty: true, shouldValidate: true });
  }

  function changeProject(event: React.ChangeEvent<HTMLSelectElement>) {
    const projectId = event.target.value;

    setSelection((current) => ({ ...current, projectId }));
    form.setValue("projectId", projectId, { shouldDirty: true, shouldValidate: true });
  }

  function submitValidForm(values: ClockInFormValues) {
    React.startTransition(() => {
      formAction(clockInValuesToFormData(values));
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Play className="size-5 text-primary" aria-hidden="true" />
          Clock in
        </CardTitle>
        <CardDescription>Choose an active company and project before starting the timer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!hasCompanies ? (
          <div className="space-y-3 rounded-md border bg-background p-4 text-sm text-muted-foreground">
            <p>No active companies yet.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/settings/companies">
                <Building2 className="size-4" aria-hidden="true" />
                Add company
              </Link>
            </Button>
          </div>
        ) : null}

        {hasCompanies && !hasProjects ? (
          <div className="space-y-3 rounded-md border bg-background p-4 text-sm text-muted-foreground">
            <p>The selected company has no active projects.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/settings/projects">
                <FolderKanban className="size-4" aria-hidden="true" />
                Add project
              </Link>
            </Button>
          </div>
        ) : null}

        <form onSubmit={form.handleSubmit(submitValidForm)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timer-company">Company</Label>
              <Select
                id="timer-company"
                disabled={isPending || !hasCompanies}
                {...form.register("companyId")}
                value={selection.companyId}
                onChange={changeCompany}
              >
                {!hasCompanies ? <option value="">Create a company first</option> : null}
                {options.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </Select>
              <FieldMessage>{form.formState.errors.companyId?.message ?? state.fieldErrors?.companyId?.[0]}</FieldMessage>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timer-project">Project</Label>
              <Select
                id="timer-project"
                disabled={isPending || !hasProjects}
                {...form.register("projectId")}
                value={selection.projectId}
                onChange={changeProject}
              >
                {!hasProjects ? <option value="">Create a project first</option> : null}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
              <FieldMessage>{form.formState.errors.projectId?.message ?? state.fieldErrors?.projectId?.[0]}</FieldMessage>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timer-task">Task</Label>
            <Textarea
              id="timer-task"
              placeholder="What are you working on?"
              disabled={isPending}
              {...form.register("taskDescription")}
            />
            <FieldMessage>
              {form.formState.errors.taskDescription?.message ?? state.fieldErrors?.taskDescription?.[0]}
            </FieldMessage>
          </div>

          <FieldMessage tone={state.status === "success" ? "success" : "error"}>{state.message}</FieldMessage>

          <Button type="submit" size="lg" className="w-full" disabled={isPending || !hasCompanies || !hasProjects}>
            <Play className="size-4" aria-hidden="true" />
            {isPending ? "Clocking in..." : "Clock In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
