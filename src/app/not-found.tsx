"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden relative">
      {/* Background Grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)",
          backgroundSize: "6rem 6rem",
        }}
      />

      {/* Beam Background */}
      <div className="pointer-events-none absolute inset-0 h-full w-full -z-10 bg-white">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse at center, black 50%, transparent 100%)",
          }}
        />

        {/* SVG Beams */}
        <svg
          className="absolute h-full w-full"
          fill="none"
          viewBox="0 0 696 316"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="beam-gradient-404-0" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0} />
              <stop offset="20%" stopColor="#ef4444" stopOpacity={1} />
              <stop offset="50%" stopColor="#dc2626" stopOpacity={1} />
              <stop offset="80%" stopColor="#f87171" stopOpacity={1} />
              <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="beam-gradient-404-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" stopOpacity={0} />
              <stop offset="20%" stopColor="#64748b" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#94a3b8" stopOpacity={0.8} />
              <stop offset="80%" stopColor="#cbd5e1" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <g opacity={0.1}>
            <path d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875" stroke="currentColor" className="text-slate-300" strokeWidth={0.5} />
            <path d="M-358 -213C-358 -213 -290 192 174 319C638 446 706 851 706 851" stroke="currentColor" className="text-slate-300" strokeWidth={0.5} />
            <path d="M-336 -237C-336 -237 -268 168 196 295C660 422 728 827 728 827" stroke="currentColor" className="text-slate-300" strokeWidth={0.5} />
          </g>
          <path d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875" stroke="url(#beam-gradient-404-0)" strokeWidth={1.5} strokeLinecap="round" className="animate-beam-slow" />
          <path d="M-336 -237C-336 -237 -268 168 196 295C660 422 728 827 728 827" stroke="url(#beam-gradient-404-1)" strokeWidth={1} strokeLinecap="round" className="animate-beam-medium opacity-60" />
          <path d="M-204 -381C-204 -381 -136 24 328 151C792 278 860 683 860 683" stroke="url(#beam-gradient-404-0)" strokeWidth={1.5} strokeLinecap="round" className="animate-beam-fast" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo variant="landing" size="md" />
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Error Code */}
          <div className="mb-4">
            <span className="text-8xl md:text-9xl font-bold text-slate-100 select-none tracking-tighter">
              404
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-semibold text-slate-900 tracking-tight mb-5 leading-[1.2]">
            <span className="text-emerald-500">Page Not Found</span>
          </h1>

          {/* Subheadline */}
          <p className="text-[13px] md:text-sm text-slate-700 max-w-xl mx-auto mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.{" "}
            <br className="hidden md:block" />
            Let's get you back on track with your financial planning.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/">
              <Button size="lg" className="min-w-[180px]">
                <Home size={18} className="mr-2" />
                Back Home
              </Button>
            </Link>
            <Button variant="secondary" size="lg" onClick={() => window.history.back()} className="min-w-[180px]">
              <ArrowLeft size={18} className="mr-2" />
              Go Back
            </Button>
          </div>

          {/* Search Suggestion */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-[13px]">
              <Search size={14} />
              <span>Looking for something specific?</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {["Dashboard", "Transactions", "Budgets", "Settings"].map((page) => (
                <Link
                  key={page}
                  href={`/${page.toLowerCase()}`}
                  className="px-4 py-2 text-[13px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 hover:border-slate-300"
                >
                  {page}
                </Link>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="mt-12 text-[11px] text-slate-400">
            &copy; 2026 BudgetMe. All rights reserved.
          </p>
        </div>
      </main>

      {/* Animated floating elements */}
      <div className="absolute top-1/4 left-10 w-16 h-16 rounded-full bg-red-100/50 blur-xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-24 h-24 rounded-full bg-slate-100/50 blur-2xl animate-pulse delay-500" />
    </div>
  );
}
