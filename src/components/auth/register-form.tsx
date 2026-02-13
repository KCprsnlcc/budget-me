"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialAuthButtons } from "./social-auth-buttons";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      {/* Social Auth */}
      <SocialAuthButtons />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-wide">
          <span className="bg-white px-2 text-slate-400">or</span>
        </div>
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
          Check your email for a confirmation link to complete registration.
        </div>
      )}

      {/* Form */}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);

          if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
          }
          if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
          }
          if (!termsAccepted) {
            setError("You must accept the Terms of Service and Privacy Policy.");
            return;
          }

          startTransition(async () => {
            const supabase = createClient();
            const { error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: fullName,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              },
            });
            if (signUpError) {
              setError(signUpError.message);
              return;
            }
            setSuccess(true);
          });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="fullname">Full name</Label>
          <Input
            id="fullname"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isPending || success}
            className="min-h-[44px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

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

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isPending || success}
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
          <div className="mt-1 text-[10px] text-slate-400">
            Must be at least 8 characters long
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isPending || success}
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

        <div className="flex items-start pt-1">
          <div className="flex h-5 items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={isPending || success}
              className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
            />
          </div>
          <div className="ml-2 text-xs">
            <label
              htmlFor="terms"
              className="text-slate-600 cursor-pointer select-none"
            >
              I agree to the{" "}
              <a
                href="#"
                className="text-emerald-600 hover:text-emerald-700 underline decoration-emerald-200 underline-offset-2 transition-colors"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-emerald-600 hover:text-emerald-700 underline decoration-emerald-200 underline-offset-2 transition-colors"
              >
                Privacy Policy
              </a>
            </label>
          </div>
        </div>

        <Button type="submit" variant="auth" disabled={isPending || success} className="min-h-[44px]">
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Creating account...
            </span>
          ) : success ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Check your email
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{" "}
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
