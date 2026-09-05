import type { ForgotPasswordValues, SignInValues, SignUpValues } from "@/lib/validations/auth";

export function signUpValuesToFormData(values: SignUpValues) {
  const formData = new FormData();

  formData.set("fullName", values.fullName);
  formData.set("email", values.email);
  formData.set("password", values.password);

  return formData;
}

export function signInValuesToFormData(values: SignInValues) {
  const formData = new FormData();

  formData.set("email", values.email);
  formData.set("password", values.password);

  return formData;
}

export function forgotPasswordValuesToFormData(values: ForgotPasswordValues) {
  const formData = new FormData();

  formData.set("email", values.email);

  return formData;
}
