"use server";

import { revalidatePath } from "next/cache";
import type { FormActionState } from "@/lib/forms/action-state";
import { getStringFormEntries } from "@/lib/forms/form-data";
import { getActionContext } from "@/lib/supabase/action-context";
import {
  clockInFormSchema,
  clockOutFormSchema,
  normalizeClockInValues,
  validateClockInProjectSelection,
} from "@/lib/work-sessions/validation";

function fieldErrorState(fieldErrors: Record<string, string[] | undefined>): FormActionState {
  return {
    status: "error",
    message: "Check the highlighted fields and try again.",
    fieldErrors,
  };
}

function revalidateTimerPaths() {
  revalidatePath("/timer");
  revalidatePath("/history");
  revalidatePath("/reports");
}

function alreadyActiveMessage() {
  return "You already have an active work session. Clock out before starting another.";
}

function isUniqueActiveSessionConflict(error: { code?: string; message?: string } | null) {
  return error?.code === "23505" || error?.message?.includes("work_sessions_one_active_per_user");
}

export async function clockInAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const context = await getActionContext();

  if (!context.ok) {
    return { status: "error", message: context.message };
  }

  const parsed = clockInFormSchema.safeParse(getStringFormEntries(formData));

  if (!parsed.success) {
    return fieldErrorState(parsed.error.flatten().fieldErrors);
  }

  const values = normalizeClockInValues(parsed.data);
  const { data: activeSession, error: activeError } = await context.supabase
    .from("work_sessions")
    .select("id")
    .eq("user_id", context.userId)
    .is("clock_out", null)
    .limit(1)
    .maybeSingle();

  if (activeError) {
    return { status: "error", message: "Clock in failed while checking your active session. Please try again." };
  }

  if (activeSession) {
    return { status: "error", message: alreadyActiveMessage() };
  }

  const [{ data: project, error: projectError }, { data: company, error: companyError }] = await Promise.all([
    context.supabase
      .from("projects")
      .select("id,user_id,company_id,is_archived")
      .eq("id", values.projectId)
      .eq("user_id", context.userId)
      .maybeSingle(),
    context.supabase
      .from("companies")
      .select("id,user_id,is_archived")
      .eq("id", values.companyId)
      .eq("user_id", context.userId)
      .maybeSingle(),
  ]);

  if (projectError || companyError) {
    return { status: "error", message: "Clock in failed while checking the selected project. Please try again." };
  }

  const relationshipMessage = validateClockInProjectSelection({
    userId: context.userId,
    companyId: values.companyId,
    projectId: values.projectId,
    project,
    company,
  });

  if (relationshipMessage) {
    return { status: "error", message: relationshipMessage };
  }

  const { error } = await context.supabase.from("work_sessions").insert({
    user_id: context.userId,
    project_id: values.projectId,
    task_description: values.taskDescription,
    clock_in: new Date().toISOString(),
    clock_out: null,
  });

  if (isUniqueActiveSessionConflict(error)) {
    return { status: "error", message: alreadyActiveMessage() };
  }

  if (error) {
    return { status: "error", message: "Clock in failed. Please try again." };
  }

  revalidateTimerPaths();

  return { status: "success", message: "Clocked in." };
}

export async function clockOutAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const context = await getActionContext();

  if (!context.ok) {
    return { status: "error", message: context.message };
  }

  const parsed = clockOutFormSchema.safeParse({
    sessionId: formData.get("sessionId"),
  });

  if (!parsed.success) {
    return fieldErrorState(parsed.error.flatten().fieldErrors);
  }

  const { data, error } = await context.supabase
    .from("work_sessions")
    .update({ clock_out: new Date().toISOString() })
    .eq("id", parsed.data.sessionId)
    .eq("user_id", context.userId)
    .is("clock_out", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: "Clock out failed. Please try again." };
  }

  if (!data) {
    return { status: "error", message: "No active work session was found to clock out." };
  }

  revalidateTimerPaths();

  return { status: "success", message: "Clocked out." };
}
