"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialAuthButtons } from "./social-auth-buttons";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-1 text-xl font-medium tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="text-[13px] text-slate-500">
          Start your financial journey today
        </p>
      </div>

      {/* Social Auth */}
      <SocialAuthButtons />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[11px]">
          <span className="bg-white px-3 text-slate-400 uppercase tracking-wider font-medium">
            or
          </span>
        </div>
      </div>

      {/* Form */}
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" type="text" placeholder="John" autoComplete="given-name" />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" type="text" placeholder="Doe" autoComplete="family-name" />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="name@example.com" autoComplete="email" />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Must be at least 8 characters
          </p>
        </div>

        <Button type="submit" className="w-full">
          Create account
        </Button>
      </form>

      {/* Terms */}
      <p className="mt-6 text-center text-[11px] text-slate-400 leading-relaxed">
        By creating an account, you agree to our{" "}
        <a href="#" className="underline hover:text-slate-600">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-slate-600">
          Privacy Policy
        </a>
      </p>

      {/* Footer */}
      <p className="mt-4 text-center text-[12px] text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-slate-900 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
