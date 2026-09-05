import { z } from "zod";

export const companyColorDefault = "#0f766e";

export const colorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a valid hex color.");

export const companyFormSchema = z.object({
  name: z.string().trim().min(1, "Company name is required.").max(120, "Keep names under 120 characters."),
  description: z.string().trim().max(1000, "Keep descriptions under 1,000 characters.").optional().default(""),
  color: colorSchema.default(companyColorDefault),
});

export const companyIdSchema = z.object({
  id: z.string().uuid("Invalid company identifier."),
});

export type CompanyFormValues = z.input<typeof companyFormSchema>;

export function normalizeCompanyValues(values: z.output<typeof companyFormSchema>) {
  return {
    name: values.name,
    description: values.description ? values.description : null,
    color: values.color.toLowerCase(),
  };
}
