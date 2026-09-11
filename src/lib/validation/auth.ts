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
