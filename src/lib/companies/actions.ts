"use server";

import { revalidatePath } from "next/cache";
import { companyFormSchema, companyIdSchema, normalizeCompanyValues } from "@/lib/companies/validation";
import type { FormActionState } from "@/lib/forms/action-state";
import { getStringFormEntries } from "@/lib/forms/form-data";
import { getActionContext } from "@/lib/supabase/action-context";

function fieldErrorState(fieldErrors: Record<string, string[] | undefined>): FormActionState {
  return {
    status: "error",
    message: "Check the highlighted fields and try again.",
    fieldErrors,
  };
}

function revalidateCompanyPaths() {
  revalidatePath("/settings");
  revalidatePath("/settings/companies");
  revalidatePath("/settings/projects");
  revalidatePath("/timer");
}

async function parseCompanyId(formData: FormData) {
  return companyIdSchema.safeParse({ id: formData.get("id") });
}

export async function createCompanyAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const context = await getActionContext();

  if (!context.ok) {
    return { status: "error", message: context.message };
  }

  const parsed = companyFormSchema.safeParse(getStringFormEntries(formData));

  if (!parsed.success) {
    return fieldErrorState(parsed.error.flatten().fieldErrors);
  }

  const { error } = await context.supabase.from("companies").insert({
    ...normalizeCompanyValues(parsed.data),
    user_id: context.userId,
  });

  if (error) {
    return { status: "error", message: `Company could not be created: ${error.message}` };
  }

  revalidateCompanyPaths();

  return { status: "success", message: "Company created." };
}

export async function updateCompanyAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const context = await getActionContext();

  if (!context.ok) {
    return { status: "error", message: context.message };
  }

  const id = await parseCompanyId(formData);
  const values = companyFormSchema.safeParse(getStringFormEntries(formData));

  if (!id.success || !values.success) {
    return fieldErrorState({
      ...(id.success ? {} : id.error.flatten().fieldErrors),
      ...(values.success ? {} : values.error.flatten().fieldErrors),
    });
  }

  const { data, error } = await context.supabase
    .from("companies")
    .update(normalizeCompanyValues(values.data))
    .eq("id", id.data.id)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: `Company could not be updated: ${error.message}` };
  }

  if (!data) {
    return { status: "error", message: "Company not found or you do not have access to it." };
  }

  revalidateCompanyPaths();

  return { status: "success", message: "Company updated." };
}

export async function archiveCompanyAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const context = await getActionContext();

  if (!context.ok) {
    return { status: "error", message: context.message };
  }

  const id = await parseCompanyId(formData);

  if (!id.success) {
    return fieldErrorState(id.error.flatten().fieldErrors);
  }

  const { data, error } = await context.supabase
    .from("companies")
    .update({ is_archived: true })
    .eq("id", id.data.id)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: `Company could not be archived: ${error.message}` };
  }

  if (!data) {
    return { status: "error", message: "Company not found or you do not have access to it." };
  }

  revalidateCompanyPaths();

  return { status: "success", message: "Company archived." };
}

export async function restoreCompanyAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const context = await getActionContext();

  if (!context.ok) {
    return { status: "error", message: context.message };
  }

  const id = await parseCompanyId(formData);

  if (!id.success) {
    return fieldErrorState(id.error.flatten().fieldErrors);
  }

  const { data, error } = await context.supabase
    .from("companies")
    .update({ is_archived: false })
    .eq("id", id.data.id)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: `Company could not be restored: ${error.message}` };
  }

  if (!data) {
    return { status: "error", message: "Company not found or you do not have access to it." };
  }

  revalidateCompanyPaths();

  return { status: "success", message: "Company restored." };
}
