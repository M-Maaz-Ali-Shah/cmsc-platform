"use client";

import { useActionState } from "react";
import { Lock, Mail, User } from "lucide-react";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createFirstAdmin } from "@/app/actions/auth";
import type { SetupFormState } from "@/lib/validation/auth";

const initialState: SetupFormState = undefined;

export function SetupForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(createFirstAdmin, initialState);

  return (
    <form className="mt-7 space-y-5" action={formAction}>
      <input type="hidden" name="token" value={token} />

      <Field label="Full name" htmlFor="setup-name" required>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" aria-hidden />
          <Input id="setup-name" name="name" type="text" required className="pl-9" placeholder="Full name" />
        </div>
      </Field>
      <Field label="Email address" htmlFor="setup-email" required>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" aria-hidden />
          <Input
            id="setup-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="pl-9"
            placeholder="you@committee.org"
          />
        </div>
      </Field>
      <Field label="Password" htmlFor="setup-password" required hint="At least 10 characters.">
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" aria-hidden />
          <Input
            id="setup-password"
            name="password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            className="pl-9"
            placeholder="••••••••••"
          />
        </div>
      </Field>

      {state?.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full justify-center" disabled={pending}>
        {pending ? "Creating account…" : "Create Super Admin account"}
      </Button>
    </form>
  );
}
