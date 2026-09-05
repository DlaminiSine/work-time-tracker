import { z } from "zod";

const email = z.string().trim().email("Enter a valid email address.");
const password = z.string().min(8, "Use at least 8 characters.");

export const signInSchema = z.object({
  email,
  password,
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name.").max(120, "Keep the name under 120 characters."),
  email,
  password,
});

export const forgotPasswordSchema = z.object({
  email,
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
