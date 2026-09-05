"use server";

import { revalidatePath } from "next/cache";
import type { FormActionState } from "@/lib/forms/action-state";
import { getStringFormEntries } from "@/lib/forms/form-data";
import { normalizeProjectValues, projectFormSchema, projectIdSchema } from "@/lib/projects/validation";
import { getActionContext } from "@/lib/supabase/action-context";

function fieldErrorState(fieldErrors: Record<string, string[] | undefined>): FormActionState {
  return {
    status: "error",
    message: "Check the highlighted fields and try again.",
    fieldErrors,
  };
}

function revalidateProjectPaths() {
  revalidatePath("/settings");
  revalidatePath("/settings/projects");
  revalidatePath("/timer");
}

async function parseProjectId(formData: FormData) {
  return projectIdSchema.safeParse({ id: formData.get("id") });
}

async function findCompany(context: Extract<Awaited<ReturnType<typeof getActionContext>>, { ok: true }>, companyId: string) {
  const { data, error } = await context.supabase
    .from("companies")
    .select("id,is_archived")
    .eq("id", companyId)
    .eq("user_id", context.userId)
    .maybeSingle();

  if (error) {
    return { ok: false as const, message: `Company could not be checked: ${error.message}` };
  }

  if (!data) {
    return { ok: false as const, message: "Choose a company you have access to." };
  }

  return { ok: true as const, company: data };
}

export async function createProjectAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const context = await getActionContext();

  if (!context.ok) {
    return { status: "error", message: context.message };
  }

  const parsed = projectFormSchema.safeParse(getStringFormEntries(formData));

  if (!parsed.success) {
    return fieldErrorState(parsed.error.flatten().fieldErrors);
  }

  const company = await findCompany(context, parsed.data.companyId);

  if (!company.ok) {
    return { status: "error", message: company.message };
  }

  if (company.company.is_archived) {
    return { status: "error", message: "New projects can only be created under active companies." };
  }

  const { error } = await context.supabase.from("projects").insert({
    ...normalizeProjectValues(parsed.data),
    user_id: context.userId,
  });

  if (error) {
    return { status: "error", message: `Project could not be created: ${error.message}` };
  }

  revalidateProjectPaths();

  return { status: "success", message: "Project created." };
}

export async function updateProjectAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const context = await getActionContext();

  if (!context.ok) {
    return { status: "error", message: context.message };
  }

  const id = await parseProjectId(formData);
  const values = projectFormSchema.safeParse(getStringFormEntries(formData));

  if (!id.success || !values.success) {
    return fieldErrorState({
      ...(id.success ? {} : id.error.flatten().fieldErrors),
      ...(values.success ? {} : values.error.flatten().fieldErrors),
    });
  }

  const { data: existingProject, error: projectError } = await context.supabase
    .from("projects")
    .select("id,company_id")
    .eq("id", id.data.id)
    .eq("user_id", context.userId)
    .maybeSingle();

  if (projectError) {
    return { status: "error", message: `Project could not be checked: ${projectError.message}` };
  }

  if (!existingProject) {
    return { status: "error", message: "Project not found or you do not have access to it." };
  }

  const company = await findCompany(context, values.data.companyId);

  if (!company.ok) {
    return { status: "error", message: company.message };
  }

  if (company.company.is_archived && company.company.id !== existingProject.company_id) {
    return { status: "error", message: "Projects cannot be moved to an archived company." };
  }

  const { data, error } = await context.supabase
    .from("projects")
    .update(normalizeProjectValues(values.data))
    .eq("id", id.data.id)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: `Project could not be updated: ${error.message}` };
  }

  if (!data) {
    return { status: "error", message: "Project not found or you do not have access to it." };
  }

  revalidateProjectPaths();

  return { status: "success", message: "Project updated." };
}

export async function archiveProjectAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const context = await getActionContext();

  if (!context.ok) {
    return { status: "error", message: context.message };
  }

  const id = await parseProjectId(formData);

  if (!id.success) {
    return fieldErrorState(id.error.flatten().fieldErrors);
  }

  const { data, error } = await context.supabase
    .from("projects")
    .update({ is_archived: true })
    .eq("id", id.data.id)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: `Project could not be archived: ${error.message}` };
  }

  if (!data) {
    return { status: "error", message: "Project not found or you do not have access to it." };
  }

  revalidateProjectPaths();

  return { status: "success", message: "Project archived." };
}

export async function restoreProjectAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const context = await getActionContext();

  if (!context.ok) {
    return { status: "error", message: context.message };
  }

  const id = await parseProjectId(formData);

  if (!id.success) {
    return fieldErrorState(id.error.flatten().fieldErrors);
  }

  const { data, error } = await context.supabase
    .from("projects")
    .update({ is_archived: false })
    .eq("id", id.data.id)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: `Project could not be restored: ${error.message}` };
  }

  if (!data) {
    return { status: "error", message: "Project not found or you do not have access to it." };
  }

  revalidateProjectPaths();

  return { status: "success", message: "Project restored." };
}
