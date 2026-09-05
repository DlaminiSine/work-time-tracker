import { describe, expect, it } from "vitest";
import { companyFormSchema, normalizeCompanyValues } from "@/lib/companies/validation";

describe("company validation", () => {
  it("requires a non-empty trimmed name", () => {
    const result = companyFormSchema.safeParse({
      name: "   ",
      description: "",
      color: "#0f766e",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes optional description and color", () => {
    const result = companyFormSchema.parse({
      name: " Northeastern University ",
      description: "   ",
      color: "#0F766E",
    });

    expect(normalizeCompanyValues(result)).toEqual({
      name: "Northeastern University",
      description: null,
      color: "#0f766e",
    });
  });
});
