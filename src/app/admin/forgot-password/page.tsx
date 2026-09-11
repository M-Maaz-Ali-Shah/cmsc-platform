import type { Metadata } from "next";
import { KeyRound } from "lucide-react";

import { LogoLockup } from "@/components/brand/logo-lockup";
import { Card } from "@/components/ui/card";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4 py-16 text-white">
      <div className="crescent-field pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <LogoLockup variant="onDark" />
        </div>

        <Card className="border-white/10 bg-surface/95 p-7 sm:p-9">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-700">
              <KeyRound className="size-6" aria-hidden />
            </div>
            <h1 className="mt-4 font-heading text-xl font-bold text-navy-900">Reset Your Password</h1>
            <p className="mt-1 text-sm text-ink-500">
              Enter your account email and we&rsquo;ll send you a reset link.
            </p>
          </div>

          <ForgotPasswordForm />
        </Card>
      </div>
    </div>
  );
}
