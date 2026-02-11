"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  return (
    <div>
      {/* Back link */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-600 transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back to sign in
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-1 text-xl font-medium tracking-tight text-slate-900">
          Reset your password
        </h1>
        <p className="text-[13px] text-slate-500">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {/* Form */}
      <form className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
          />
        </div>

        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-[12px] text-slate-400">
        Remember your password?{" "}
        <Link href="/login" className="text-slate-900 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
