import { z } from "zod";
import { colorSchema } from "@/lib/companies/validation";

export const projectColorDefault = "#2563eb";

const nonNegativeIntegerText = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d+$/.test(value), "Use a whole number.")
  .refine((value) => value === "" || Number(value) >= 0, "Value cannot be negative.");

const optionalRateText = z
  .string()
  .trim()
  .refine((value) => value === "" || Number.isFinite(Number(value)), "Enter a valid rate.")
  .refine((value) => value === "" || Number(value) >= 0, "Hourly rate cannot be negative.");

export const projectFormSchema = z.object({
  companyId: z.string().uuid("Choose a company."),
  name: z.string().trim().min(1, "Project name is required.").max(120, "Keep names under 120 characters."),
  description: z.string().trim().max(1000, "Keep descriptions under 1,000 characters.").optional().default(""),
  weeklyTargetHours: nonNegativeIntegerText.default(""),
  weeklyTargetMinutes: nonNegativeIntegerText
    .default("")
    .refine((value) => value === "" || Number(value) <= 59, "Minutes must be between 0 and 59."),
  hourlyRate: optionalRateText.default(""),
  currency: z
    .string()
    .trim()
    .min(3, "Use a 3-letter currency code.")
    .max(3, "Use a 3-letter currency code.")
    .regex(/^[a-zA-Z]{3}$/, "Use letters only.")
    .default("USD"),
  color: colorSchema.default(projectColorDefault),
});

export const projectIdSchema = z.object({
  id: z.string().uuid("Invalid project identifier."),
});

export type ProjectFormValues = z.input<typeof projectFormSchema>;

export function weeklyTargetToMinutes(hoursInput: string, minutesInput: string) {
  const hours = hoursInput.trim() === "" ? 0 : Number(hoursInput);
  const minutes = minutesInput.trim() === "" ? 0 : Number(minutesInput);
  const total = hours * 60 + minutes;

  return total > 0 ? total : null;
}

export function weeklyTargetFields(totalMinutes: number | null) {
  if (!totalMinutes) {
    return {
      weeklyTargetHours: "",
      weeklyTargetMinutes: "",
    };
  }

  return {
    weeklyTargetHours: String(Math.floor(totalMinutes / 60)),
    weeklyTargetMinutes: String(totalMinutes % 60),
  };
}

export function parseOptionalHourlyRate(value: string) {
  const trimmed = value.trim();

  if (trimmed === "") {
    return null;
  }

  return Number(trimmed);
}

export function normalizeProjectValues(values: z.output<typeof projectFormSchema>) {
  return {
    company_id: values.companyId,
    name: values.name,
    description: values.description ? values.description : null,
    weekly_target_minutes: weeklyTargetToMinutes(values.weeklyTargetHours, values.weeklyTargetMinutes),
    hourly_rate: parseOptionalHourlyRate(values.hourlyRate),
    currency: values.currency.toUpperCase(),
    color: values.color.toLowerCase(),
  };
}
