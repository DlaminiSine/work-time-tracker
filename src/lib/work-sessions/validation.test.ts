import { describe, expect, it } from "vitest";
import {
  clockInFormSchema,
  normalizeClockInValues,
  validateClockInProjectSelection,
} from "@/lib/work-sessions/validation";

const userId = "user-1";
const company = {
  id: "company-1",
  user_id: userId,
  is_archived: false,
};
const project = {
  id: "project-1",
  user_id: userId,
  company_id: company.id,
  is_archived: false,
};

describe("clock-in validation", () => {
  it("validates required company and project ids", () => {
    const result = clockInFormSchema.safeParse({
      companyId: "",
      projectId: "",
      taskDescription: "",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes optional task text", () => {
    const parsed = clockInFormSchema.parse({
      companyId: "11111111-1111-4111-8111-111111111111",
      projectId: "22222222-2222-4222-8222-222222222222",
      taskDescription: "  Data cleaning  ",
    });

    expect(normalizeClockInValues(parsed)).toEqual({
      companyId: "11111111-1111-4111-8111-111111111111",
      projectId: "22222222-2222-4222-8222-222222222222",
      taskDescription: "Data cleaning",
    });
  });

  it("accepts a project that belongs to the selected active company and user", () => {
    expect(
      validateClockInProjectSelection({
        userId,
        companyId: company.id,
        projectId: project.id,
        company,
        project,
      }),
    ).toBeNull();
  });

  it("rejects project and company relationship mismatches", () => {
    expect(
      validateClockInProjectSelection({
        userId,
        companyId: "company-2",
        projectId: project.id,
        company: { ...company, id: "company-2" },
        project,
      }),
    ).toBe("Choose a project that belongs to the selected company.");
  });

  it("rejects archived projects and companies", () => {
    expect(
      validateClockInProjectSelection({
        userId,
        companyId: company.id,
        projectId: project.id,
        company: { ...company, is_archived: true },
        project,
      }),
    ).toBe("Choose an active company before clocking in.");

    expect(
      validateClockInProjectSelection({
        userId,
        companyId: company.id,
        projectId: project.id,
        company,
        project: { ...project, is_archived: true },
      }),
    ).toBe("Choose an active project before clocking in.");
  });
});
