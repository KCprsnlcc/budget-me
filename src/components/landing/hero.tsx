import Link from "next/link";
import { Monitor, ShieldCheck, CloudCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TECH_SPECS } from "@/lib/constants";

const ICON_MAP: Record<string, React.ElementType> = {
  Monitor,
  ShieldCheck,
  CloudCheck: CloudCog,
};

export function Hero() {
  return (
    <section className="relative z-10 pt-40 pb-12 md:pt-40 md:pb-20 px-6 overflow-hidden">
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
            <linearGradient id="beam-gradient-0" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0} />
              <stop offset="20%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="50%" stopColor="#059669" stopOpacity={1} />
              <stop offset="80%" stopColor="#34d399" stopOpacity={1} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="beam-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
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
          <path d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875" stroke="url(#beam-gradient-0)" strokeWidth={1.5} strokeLinecap="round" className="animate-beam-slow" />
          <path d="M-336 -237C-336 -237 -268 168 196 295C660 422 728 827 728 827" stroke="url(#beam-gradient-1)" strokeWidth={1} strokeLinecap="round" className="animate-beam-medium opacity-60" />
          <path d="M-204 -381C-204 -381 -136 24 328 151C792 278 860 683 860 683" stroke="url(#beam-gradient-0)" strokeWidth={1.5} strokeLinecap="round" className="animate-beam-fast" />
        </svg>
      </div>

      {/* Left Hero Image */}
      <div className="hidden xl:block absolute left-5 top-1/2 -translate-y-1/2 h-[70%] z-20 pointer-events-none [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/left-side-hero.png" alt="" className="h-full w-auto object-contain object-left-bottom" />
      </div>

      {/* Right Hero Image */}
      <div className="hidden xl:block absolute right-5 top-1/2 -translate-y-1/2 h-[70%] z-20 pointer-events-none [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/right-side-hero.png" alt="" className="h-full w-auto object-contain object-right-bottom" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-5xl font-semibold text-slate-900 tracking-tight mb-5 leading-[1.2]">
          Smart Financial Planning <br />
          <span className="text-emerald-500">Made Simple for Everyone</span>
        </h1>

        {/* Subheadline */}
        <p className="text-[13px] md:text-sm text-slate-700 max-w-xl mx-auto mb-8 leading-relaxed">
          Take control of your finances with intuitive budgeting tools. Track expenses,{" "}
          <br className="hidden md:block" />
          set ambitious goals, and build wealth with AI-powered insights.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link href="/register">
            <Button size="lg">Start your budget</Button>
          </Link>
          <Button variant="secondary" size="lg">
            Request a demo
          </Button>
        </div>

        {/* Tech Specs Marquee */}
        <div className="relative max-w-5xl mx-auto">
          {/* Edge Fades */}
          <div className="absolute left-[-20px] top-0 bottom-0 w-40 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-[-20px] top-0 bottom-0 w-40 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-[-40px] left-0 right-0 h-32 bg-gradient-to-t from-white via-white/40 to-transparent z-10 pointer-events-none" />

          <div className="relative overflow-hidden py-12">
            <div className="flex animate-marquee gap-24 items-start w-max px-4">
              {/* Triple repeat for seamless loop */}
              {[...Array(3)].map((_, repeatIdx) =>
                TECH_SPECS.map((spec) => {
                  const Icon = ICON_MAP[spec.icon];
                  return (
                    <div
                      key={`${repeatIdx}-${spec.title}`}
                      className="w-72 shrink-0 group hover:translate-y-[-2px] transition-transform duration-300"
                    >
                      <div className="text-slate-900 text-[11px] font-bold mb-2 flex items-center gap-2 uppercase tracking-tight">
                        {Icon && (
                          <Icon
                            size={16}
                            className="text-emerald-500 group-hover:scale-110 transition-transform"
                          />
                        )}
                        {spec.title}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed uppercase tracking-wider">
                        {spec.description}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <p className="text-center text-[10px] font-bold text-slate-900/60 uppercase tracking-[0.25em] mt-6 pb-8">
            Engineered with high-performance architecture for the modern web
          </p>
        </div>
      </div>
    </section>
  );
}
