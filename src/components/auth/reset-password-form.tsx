"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Check if we have the required token
  if (!token_hash || type !== "recovery") {
    return (
      <div className="text-center">
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600">
          Invalid or expired password reset link. Please request a new one.
        </div>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      
      // First verify the token
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: "recovery",
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      // If verification successful, update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess("Password reset successfully! Redirecting to login...");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login?message=password_reset");
      }, 2000);
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-1 text-xl font-medium tracking-tight text-slate-900">
          Reset Password
        </h1>
        <p className="text-xs text-slate-500">
          Enter your new password below
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-green-100 bg-green-50 px-3 py-2.5 text-xs text-green-600"
        >
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600"
        >
          {error}
        </div>
      )}

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isPending}
              className="min-h-[44px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-emerald-600 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2.5"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isPending}
              className="min-h-[44px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-emerald-600 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2.5"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" variant="auth" disabled={isPending} className="min-h-[44px]">
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Resetting password...
            </span>
          ) : (
            "Reset Password"
          )}
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
