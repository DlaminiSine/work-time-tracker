import { describe, expect, it } from "vitest";
import {
  normalizeProjectValues,
  projectFormSchema,
  weeklyTargetFields,
  weeklyTargetToMinutes,
} from "@/lib/projects/validation";

const companyId = "11111111-1111-4111-8111-111111111111";

describe("project validation", () => {
  it("requires a project name and company", () => {
    const result = projectFormSchema.safeParse({
      companyId: "",
      name: " ",
      description: "",
      weeklyTargetHours: "",
      weeklyTargetMinutes: "",
      hourlyRate: "",
      currency: "USD",
      color: "#2563eb",
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative and invalid numeric fields", () => {
    const result = projectFormSchema.safeParse({
      companyId,
      name: "Portfolio",
      description: "",
      weeklyTargetHours: "-1",
      weeklyTargetMinutes: "70",
      hourlyRate: "-10",
      currency: "USD",
      color: "#2563eb",
    });

    expect(result.success).toBe(false);
  });

  it("converts weekly target fields to minutes", () => {
    expect(weeklyTargetToMinutes("3", "30")).toBe(210);
    expect(weeklyTargetToMinutes("", "")).toBeNull();
    expect(weeklyTargetFields(145)).toEqual({
      weeklyTargetHours: "2",
      weeklyTargetMinutes: "25",
    });
  });

  it("normalizes project values for database writes", () => {
    const parsed = projectFormSchema.parse({
      companyId,
      name: " Research Assistant ",
      description: "  Lab work  ",
      weeklyTargetHours: "10",
      weeklyTargetMinutes: "15",
      hourlyRate: "22.5",
      currency: "usd",
      color: "#2563EB",
    });

    expect(normalizeProjectValues(parsed)).toEqual({
      company_id: companyId,
      name: "Research Assistant",
      description: "Lab work",
      weekly_target_minutes: 615,
      hourly_rate: 22.5,
      currency: "USD",
      color: "#2563eb",
    });
  });
});
