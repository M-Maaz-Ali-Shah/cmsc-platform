import * as z from "zod";

export const LoginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  password: z.string().min(1, { error: "Enter your password." }),
});

export type LoginFormState =
  | {
      error?: string;
    }
  | undefined;

export const SetupSchema = z.object({
  token: z.string().min(1, { error: "Missing setup token." }),
  name: z.string().trim().min(2, { error: "Enter the administrator's full name." }),
  email: z.email({ error: "Enter a valid email address." }),
  password: z
    .string()
    .min(10, { error: "Password must be at least 10 characters." }),
});

export type SetupFormState =
  | {
      error?: string;
    }
  | undefined;

export const ForgotPasswordSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
});

export type ForgotPasswordFormState =
  | { error?: string }
  | { success: true }
  | undefined;

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, { error: "Missing reset token." }),
    password: z.string().min(10, { error: "Password must be at least 10 characters." }),
    confirmPassword: z.string().min(1, { error: "Confirm your new password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
  });

export type ResetPasswordFormState =
  | { error?: string }
  | { success: true }
  | undefined;
