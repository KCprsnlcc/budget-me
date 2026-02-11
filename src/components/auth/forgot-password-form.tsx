"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
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

      {/* Form */}
      <form className="space-y-4 mt-6">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <Button type="submit" variant="auth">
          Send reset link
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
