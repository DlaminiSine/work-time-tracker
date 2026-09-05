import { describe, expect, it } from "vitest";
import {
  forgotPasswordValuesToFormData,
  signInValuesToFormData,
  signUpValuesToFormData,
} from "@/lib/auth/form-data";

function formDataEntries(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

describe("auth form data mapping", () => {
  it("maps signup values to the server action field names", () => {
    const formData = signUpValuesToFormData({
      fullName: "Sine Dlamini",
      email: "sine@example.com",
      password: "correct horse battery",
    });

    expect(formDataEntries(formData)).toEqual({
      fullName: "Sine Dlamini",
      email: "sine@example.com",
      password: "correct horse battery",
    });
  });

  it("maps login values to the server action field names", () => {
    const formData = signInValuesToFormData({
      email: "sine@example.com",
      password: "correct horse battery",
    });

    expect(formDataEntries(formData)).toEqual({
      email: "sine@example.com",
      password: "correct horse battery",
    });
  });

  it("maps forgot-password values to the server action field names", () => {
    const formData = forgotPasswordValuesToFormData({
      email: "sine@example.com",
    });

    expect(formDataEntries(formData)).toEqual({
      email: "sine@example.com",
    });
  });
});
