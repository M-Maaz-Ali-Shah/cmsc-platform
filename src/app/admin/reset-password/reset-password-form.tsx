"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/app/actions/auth";
import type { ResetPasswordFormState } from "@/lib/validation/auth";

const initialState: ResetPasswordFormState = undefined;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, formAction, pending] = useActionState(resetPassword, initialState);

  if (state && "success" in state && state.success) {
    return (
      <div className="mt-7 space-y-4 text-center">
        <p className="rounded-md bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-800">
          Your password has been reset. Any other signed-in sessions for
          your account have been signed out.
        </p>
        <Link href="/admin/login" className="text-sm font-semibold text-navy-800 underline-offset-4 hover:underline">
          Sign in with your new password
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <p role="alert" className="mt-7 rounded-md bg-red-50 px-3 py-3 text-sm font-medium text-red-700">
        Missing reset token. Use the link from your password reset email, or{" "}
        <Link href="/admin/forgot-password" className="underline">
          request a new one
        </Link>
        .
      </p>
    );
  }

  return (
    <form className="mt-7 space-y-5" action={formAction}>
      <input type="hidden" name="token" value={token} />

      <Field label="New password" htmlFor="rp-password" required hint="At least 10 characters.">
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" aria-hidden />
          <Input
            id="rp-password"
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
      <Field label="Confirm new password" htmlFor="rp-confirm" required>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" aria-hidden />
          <Input
            id="rp-confirm"
            name="confirmPassword"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            className="pl-9"
            placeholder="••••••••••"
          />
        </div>
      </Field>

      {state && "error" in state && state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full justify-center" disabled={pending}>
        {pending ? "Resetting…" : "Reset Password"}
      </Button>
    </form>
  );
}
