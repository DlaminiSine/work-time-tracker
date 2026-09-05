import { describe, expect, it } from "vitest";
import { companyValuesToFormData } from "@/lib/companies/form-data";

function entries(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

describe("company form data mapping", () => {
  it("maps create values to company action fields", () => {
    const formData = companyValuesToFormData({
      name: "Acme",
      description: "Client work",
      color: "#0f766e",
    });

    expect(entries(formData)).toEqual({
      name: "Acme",
      description: "Client work",
      color: "#0f766e",
    });
  });

  it("includes id for edit submissions", () => {
    const formData = companyValuesToFormData(
      {
        name: "Acme",
        description: "",
        color: "#0f766e",
      },
      "11111111-1111-4111-8111-111111111111",
    );

    expect(entries(formData)).toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      name: "Acme",
      description: "",
      color: "#0f766e",
    });
  });
});
