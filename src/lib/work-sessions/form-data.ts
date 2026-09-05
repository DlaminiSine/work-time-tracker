import type { ClockInFormValues } from "@/lib/work-sessions/validation";

export function clockInValuesToFormData(values: ClockInFormValues) {
  const formData = new FormData();

  formData.set("companyId", values.companyId ?? "");
  formData.set("projectId", values.projectId ?? "");
  formData.set("taskDescription", values.taskDescription ?? "");

  return formData;
}
