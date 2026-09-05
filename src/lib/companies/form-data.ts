import type { CompanyFormValues } from "@/lib/companies/validation";

export function companyValuesToFormData(values: CompanyFormValues, companyId?: string) {
  const formData = new FormData();

  if (companyId) {
    formData.set("id", companyId);
  }

  formData.set("name", values.name ?? "");
  formData.set("description", values.description ?? "");
  formData.set("color", values.color ?? "");

  return formData;
}
