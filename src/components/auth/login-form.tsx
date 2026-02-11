"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialAuthButtons } from "./social-auth-buttons";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-1 text-xl font-medium tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="text-xs text-slate-500">
          Sign in to your BudgetMe account
        </p>
      </div>

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

      {/* Form */}
      <form className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="mb-0">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-[10px] font-medium text-slate-500 hover:text-emerald-600 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
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

        <div className="flex items-center pt-1">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
          />
          <label
            htmlFor="remember"
            className="ml-2 block text-xs text-slate-600 cursor-pointer select-none"
          >
            Remember for 30 days
          </label>
        </div>

        <Button type="submit" variant="auth">
          Sign in
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
