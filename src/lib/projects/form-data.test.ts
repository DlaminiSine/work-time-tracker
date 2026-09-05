import { describe, expect, it } from "vitest";
import { projectValuesToFormData } from "@/lib/projects/form-data";

function entries(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

describe("project form data mapping", () => {
  it("maps create values to project action fields", () => {
    const formData = projectValuesToFormData({
      companyId: "11111111-1111-4111-8111-111111111111",
      name: "Research",
      description: "Weekly reports",
      weeklyTargetHours: "12",
      weeklyTargetMinutes: "30",
      hourlyRate: "75",
      currency: "usd",
      color: "#2563eb",
    });

    expect(entries(formData)).toEqual({
      companyId: "11111111-1111-4111-8111-111111111111",
      name: "Research",
      description: "Weekly reports",
      weeklyTargetHours: "12",
      weeklyTargetMinutes: "30",
      hourlyRate: "75",
      currency: "usd",
      color: "#2563eb",
    });
  });

  it("includes id for edit submissions", () => {
    const formData = projectValuesToFormData(
      {
        companyId: "11111111-1111-4111-8111-111111111111",
        name: "Research",
        description: "",
        weeklyTargetHours: "",
        weeklyTargetMinutes: "",
        hourlyRate: "",
        currency: "USD",
        color: "#2563eb",
      },
      "22222222-2222-4222-8222-222222222222",
    );

    expect(entries(formData)).toEqual({
      id: "22222222-2222-4222-8222-222222222222",
      companyId: "11111111-1111-4111-8111-111111111111",
      name: "Research",
      description: "",
      weeklyTargetHours: "",
      weeklyTargetMinutes: "",
      hourlyRate: "",
      currency: "USD",
      color: "#2563eb",
    });
  });
});
