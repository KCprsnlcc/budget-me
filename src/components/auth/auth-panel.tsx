"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Quote } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { fetchTestimonials } from "@/components/landing/_lib/testimonial-service";
import type { Testimonial } from "@/types";

type PageType = "login" | "register" | "forgot" | "reset-password";

const SVG_TRANSFORM: Record<PageType, string> = {
  login: "scale-y-[-1]",
  register: "scale-x-[-1]",
  forgot: "rotate-180",
  "reset-password": "rotate-90",
};

const FOOTER_TEXT: Record<PageType, string> = {
  login: "By continuing, you agree to BudgetMe\u2019s",
  register: "By creating an account, you agree to BudgetMe\u2019s",
  forgot: "By continuing, you agree to BudgetMe\u2019s",
  "reset-password": "By continuing, you agree to BudgetMe\u2019s",
};

interface AuthPanelProps {
  children: React.ReactNode;
  page?: PageType;
  header?: React.ReactNode;
}

export function AuthPanel({
  children,
  page = "login",
  header,
}: AuthPanelProps) {
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTestimonial() {
      try {
        const testimonials = await fetchTestimonials();
        if (testimonials.length > 0) {
          // Randomly select a testimonial
          const randomIndex = Math.floor(Math.random() * testimonials.length);
          setTestimonial(testimonials[randomIndex]);
        }
      } catch (error) {
        console.error("Failed to load testimonial:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTestimonial();
  }, []);

  return (
    <>
      {/* Left Panel: Auth Form */}
      <div className="flex w-full shrink-0 flex-col border-r border-slate-100 bg-white sm:w-[400px] lg:w-[450px] relative z-20 h-screen">
        {/* Fixed Header: Logo */}
        <div className="shrink-0 px-8 pt-6 pb-2 bg-white z-10">
          {page === "register" ? (
            <>
              <div className="mb-6 flex items-center gap-2">
                <Logo variant="landing" size="md" />
              </div>
              <div className="mx-auto w-full max-w-[300px]">
                <h1 className="mb-1 text-xl font-medium tracking-tight text-slate-900">
                  Create your account
                </h1>
                <p className="text-xs text-slate-500">
                  Start your journey to financial clarity
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Logo variant="landing" size="md" />
            </div>
          )}
          {header}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 scroll-smooth">
          <div
            className={`flex min-h-full flex-col items-center ${
              page === "register" ? "justify-center py-2" : "py-10"
            }`}
          >
            <div className="w-full max-w-[300px] my-auto">{children}</div>
          </div>
        </div>

        {/* Fixed Footer: Legal */}
        <div className="shrink-0 px-8 pb-6 pt-2 bg-white z-10">
          <div className="mx-auto w-full max-w-[300px] text-[10px] leading-relaxed text-slate-400 text-left">
            {FOOTER_TEXT[page]}{" "}
            <a
              href="#"
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600 hover:decoration-slate-400 transition-all"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600 hover:decoration-slate-400 transition-all"
            >
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </div>

      {/* Right Panel: Testimonial */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-white p-12 lg:flex relative overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)] opacity-40" />

        {/* Animated SVG Beams */}
        <svg
          className={`absolute inset-0 h-full w-full pointer-events-none ${SVG_TRANSFORM[page]}`}
          fill="none"
          viewBox="0 0 696 316"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient
              id="beam-gradient-0"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity={0} />
              <stop offset="20%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="50%" stopColor="#059669" stopOpacity={1} />
              <stop offset="80%" stopColor="#34d399" stopOpacity={1} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient
              id="beam-gradient-1"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#64748b" stopOpacity={0} />
              <stop offset="20%" stopColor="#64748b" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#94a3b8" stopOpacity={0.8} />
              <stop offset="80%" stopColor="#cbd5e1" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <g opacity={0.1}>
            <path
              d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875"
              stroke="currentColor"
              className="text-slate-300"
              strokeWidth={0.5}
            />
            <path
              d="M-358 -213C-358 -213 -290 192 174 319C638 446 706 851 706 851"
              stroke="currentColor"
              className="text-slate-300"
              strokeWidth={0.5}
            />
            <path
              d="M-336 -237C-336 -237 -268 168 196 295C660 422 728 827 728 827"
              stroke="currentColor"
              className="text-slate-300"
              strokeWidth={0.5}
            />
          </g>
          {/* Static paths - uncomment below and comment out above for animated version */}
          <path
            d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875"
            stroke="url(#beam-gradient-0)"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.3}
          />
          <path
            d="M-336 -237C-336 -237 -268 168 196 295C660 422 728 827 728 827"
            stroke="url(#beam-gradient-1)"
            strokeWidth={1}
            strokeLinecap="round"
            opacity={0.2}
          />
          <path
            d="M-204 -381C-204 -381 -136 24 328 151C792 278 860 683 860 683"
            stroke="url(#beam-gradient-0)"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.25}
          />
          {/* Animated paths - uncomment to restore animations
          <path
            d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875"
            stroke="url(#beam-gradient-0)"
            strokeWidth={1.5}
            strokeLinecap="round"
            className="animate-beam-slow"
          />
          <path
            d="M-336 -237C-336 -237 -268 168 196 295C660 422 728 827 728 827"
            stroke="url(#beam-gradient-1)"
            strokeWidth={1}
            strokeLinecap="round"
            className="animate-beam-medium opacity-60"
          />
          <path
            d="M-204 -381C-204 -381 -136 24 328 151C792 278 860 683 860 683"
            stroke="url(#beam-gradient-0)"
            strokeWidth={1.5}
            strokeLinecap="round"
            className="animate-beam-fast delay-200"
          />
          */}
        </svg>

        {/* Top Right Action */}
        <div className="absolute right-8 top-8 z-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-6 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[13px] font-medium transition-all shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
            Back to home
          </Link>
        </div>

        {/* Quote Content */}
        <div className="w-full max-w-[580px] relative z-10">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="mb-8 p-3 bg-slate-100 w-fit rounded-xl h-12 w-12" />
              <div className="mb-10 space-y-3">
                <div className="h-6 bg-slate-100 rounded w-full" />
                <div className="h-6 bg-slate-100 rounded w-5/6" />
                <div className="h-6 bg-slate-100 rounded w-4/6" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-100" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-32" />
                  <div className="h-3 bg-slate-100 rounded w-24" />
                </div>
              </div>
            </div>
          ) : testimonial ? (
            <>
              <div className="mb-8 p-3 bg-white w-fit rounded-xl border border-slate-100 shadow-sm">
                <Quote className="h-6 w-6 rotate-180 fill-emerald-50 text-emerald-500" />
              </div>

              <blockquote className="mb-10 text-2xl font-normal leading-snug tracking-tight text-slate-900 [text-wrap:balance]">
                {testimonial.text}
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white shadow-sm">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {testimonial.handle}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-400">
              <p className="text-sm">No testimonials available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
