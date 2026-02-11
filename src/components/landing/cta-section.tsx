import { CheckCheck, ShieldCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VALUE_PROPS } from "@/lib/constants";

const ICON_MAP: Record<string, React.ElementType> = {
  CheckCheck,
  ShieldCheck,
  TrendingUp,
};

export function CTASection() {
  return (
    <section className="relative z-10 py-24 px-6 border-t border-slate-100 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto relative min-h-[400px] flex items-center">
        {/* Text Content */}
        <div className="max-w-2xl relative z-10">
          <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight mb-6 leading-tight">
            Start Your Financial <br />
            <span className="text-emerald-500">Growth journey today</span>
          </h2>
          <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
            Join thousands of users who have transformed their financial lives with
            BudgetMe. Get instant clarity on your spending and savings goals.
          </p>

          {/* Value Props */}
          <div className="flex flex-wrap gap-6 mb-10 text-sm font-medium text-slate-700">
            {VALUE_PROPS.map((prop) => {
              const Icon = ICON_MAP[prop.icon];
              return (
                <div key={prop.text} className="flex items-center gap-2">
                  {Icon && <Icon size={20} className="text-emerald-500" />}
                  {prop.text}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg">Get Started Free</Button>
            <Button variant="secondary" size="lg">
              View Demo
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="hidden lg:block absolute right-[-5%] top-1/2 -translate-y-1/2 h-[120%] z-0 pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/2-persons.webp"
            alt="BudgetMe Team"
            className="h-full w-auto object-contain object-right-bottom drop-shadow-2xl opacity-90"
          />
        </div>
      </div>
    </section>
  );
}
