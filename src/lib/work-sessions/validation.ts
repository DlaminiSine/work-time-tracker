import { z } from "zod";

export const clockInFormSchema = z.object({
  companyId: z.string().uuid("Choose a company."),
  projectId: z.string().uuid("Choose a project."),
  taskDescription: z.string().trim().max(240, "Keep the task under 240 characters.").optional().default(""),
});

export const clockOutFormSchema = z.object({
  sessionId: z.string().uuid("Invalid work session."),
});

export type ClockInFormValues = z.input<typeof clockInFormSchema>;

export type ClockInProjectRecord = {
  id: string;
  user_id: string;
  company_id: string;
  is_archived: boolean;
};

export type ClockInCompanyRecord = {
  id: string;
  user_id: string;
  is_archived: boolean;
};

export function normalizeClockInValues(values: z.output<typeof clockInFormSchema>) {
  return {
    companyId: values.companyId,
    projectId: values.projectId,
    taskDescription: values.taskDescription ? values.taskDescription : null,
  };
}

export function validateClockInProjectSelection({
  userId,
  companyId,
  projectId,
  project,
  company,
}: {
  userId: string;
  companyId: string;
  projectId: string;
  project: ClockInProjectRecord | null;
  company: ClockInCompanyRecord | null;
}) {
  if (!company || company.id !== companyId || company.user_id !== userId) {
    return "Choose a company you have access to.";
  }

  if (company.is_archived) {
    return "Choose an active company before clocking in.";
  }

  if (!project || project.id !== projectId || project.user_id !== userId) {
    return "Choose a project you have access to.";
  }

  if (project.company_id !== companyId) {
    return "Choose a project that belongs to the selected company.";
  }

  if (project.is_archived) {
    return "Choose an active project before clocking in.";
  }

  return null;
}
