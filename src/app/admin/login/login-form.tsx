"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/app/actions/auth";
import type { LoginFormState } from "@/lib/validation/auth";

const initialState: LoginFormState = undefined;

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form className="mt-7 space-y-5" action={formAction}>
      <input type="hidden" name="next" value={next} />

      <Field label="Email address" htmlFor="admin-email" required>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" aria-hidden />
          <Input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="pl-9"
            placeholder="you@committee.org"
          />
        </div>
      </Field>
      <Field label="Password" htmlFor="admin-password" required>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" aria-hidden />
          <Input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="pl-9"
            placeholder="••••••••"
          />
        </div>
      </Field>

      {state?.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-ink-500">
          <input type="checkbox" className="size-3.5 accent-navy-900" />
          Remember this device
        </label>
      </div>

      <Button type="submit" size="lg" className="w-full justify-center" disabled={pending}>
        {pending ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
