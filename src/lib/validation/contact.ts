import * as z from "zod";

export const ContactSchema = z.object({
  name: z.string().trim().min(2, { error: "Enter your full name." }).max(200),
  email: z.email({ error: "Enter a valid email address." }),
  subject: z.string().trim().min(2, { error: "Enter a subject." }).max(200),
  message: z.string().trim().min(10, { error: "Enter a message of at least 10 characters." }).max(4000),
  // Honeypot
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactFormState = { error?: string; success?: true } | undefined;

export const NewsletterSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type NewsletterFormState = { error?: string; success?: true } | undefined;
