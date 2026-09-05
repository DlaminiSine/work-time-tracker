import type { ProjectFormValues } from "@/lib/projects/validation";

export function projectValuesToFormData(values: ProjectFormValues, projectId?: string) {
  const formData = new FormData();

  if (projectId) {
    formData.set("id", projectId);
  }

  formData.set("companyId", values.companyId ?? "");
  formData.set("name", values.name ?? "");
  formData.set("description", values.description ?? "");
  formData.set("weeklyTargetHours", values.weeklyTargetHours ?? "");
  formData.set("weeklyTargetMinutes", values.weeklyTargetMinutes ?? "");
  formData.set("hourlyRate", values.hourlyRate ?? "");
  formData.set("currency", values.currency ?? "");
  formData.set("color", values.color ?? "");

  return formData;
}
