import { describe, expect, it } from "vitest";
import { clockInValuesToFormData } from "@/lib/work-sessions/form-data";

function entries(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

describe("work session form data mapping", () => {
  it("maps clock-in values to work-session action fields", () => {
    const formData = clockInValuesToFormData({
      companyId: "11111111-1111-4111-8111-111111111111",
      projectId: "22222222-2222-4222-8222-222222222222",
      taskDescription: "Dashboard polish",
    });

    expect(entries(formData)).toEqual({
      companyId: "11111111-1111-4111-8111-111111111111",
      projectId: "22222222-2222-4222-8222-222222222222",
      taskDescription: "Dashboard polish",
    });
  });
});
