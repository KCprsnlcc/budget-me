"use client";

import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-1 text-xl font-medium tracking-tight text-slate-900">
          Reset your password
        </h1>
        <p className="text-xs text-slate-500">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600"
        >
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700 flex items-center gap-2"
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          Check your email for a password reset link.
        </div>
      )}

      {/* Form */}
      <form
        className="space-y-4 mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const supabase = createClient();
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(
              email,
              {
                redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
              }
            );
            if (resetError) {
              setError(resetError.message);
              return;
            }
            setSuccess(true);
          });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isPending || success}
            className="min-h-[44px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <Button type="submit" variant="auth" disabled={isPending || success} className="min-h-[44px]">
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Sending link...
            </span>
          ) : success ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Link sent
            </span>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-600 hover:text-emerald-700 focus:text-emerald-700 focus:outline-none focus:underline transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
