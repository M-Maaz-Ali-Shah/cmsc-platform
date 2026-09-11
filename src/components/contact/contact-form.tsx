"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitContactMessage } from "@/app/actions/contact";
import type { ContactFormState } from "@/lib/validation/contact";

const initialState: ContactFormState = undefined;

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, initialState);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="size-7" aria-hidden />
        </div>
        <h3 className="font-heading text-lg font-bold text-navy-900">Message sent</h3>
        <p className="max-w-sm text-sm text-ink-500">
          Thank you for reaching out. The committee will respond as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <Field label="Full Name" htmlFor="contact-name" required>
        <Input id="contact-name" name="name" required autoComplete="name" />
      </Field>
      <Field label="Email" htmlFor="contact-email" required>
        <Input id="contact-email" type="email" name="email" required autoComplete="email" />
      </Field>
      <Field label="Subject" htmlFor="contact-subject" required className="sm:col-span-2">
        <Input id="contact-subject" name="subject" required />
      </Field>
      <Field label="Message" htmlFor="contact-message" required className="sm:col-span-2">
        <Textarea id="contact-message" name="message" rows={5} required />
      </Field>
      {state?.error && (
        <p role="alert" className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Sending…" : "Send Message"}
        </Button>
      </div>
    </form>
  );
}
