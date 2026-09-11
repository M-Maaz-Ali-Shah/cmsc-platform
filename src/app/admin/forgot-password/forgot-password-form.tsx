"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/app/actions/auth";
import type { ForgotPasswordFormState } from "@/lib/validation/auth";

const initialState: ForgotPasswordFormState = undefined;

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state && "success" in state && state.success) {
    return (
      <div className="mt-7 space-y-4 text-center">
        <p className="rounded-md bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-800">
          If an account exists with that email address, a password reset link has been sent.
        </p>
        <Link href="/admin/login" className="text-sm font-semibold text-navy-800 underline-offset-4 hover:underline">
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="mt-7 space-y-5" action={formAction}>
      <Field label="Email address" htmlFor="fp-email" required>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" aria-hidden />
          <Input
            id="fp-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="pl-9"
            placeholder="you@committee.org"
          />
        </div>
      </Field>

      {state && "error" in state && state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full justify-center" disabled={pending}>
        {pending ? "Sending…" : "Send Reset Link"}
      </Button>

      <p className="text-center text-xs text-ink-500">
        <Link href="/admin/login" className="font-semibold text-navy-800 underline-offset-4 hover:underline">
          Return to sign in
        </Link>
      </p>
    </form>
  );
}
