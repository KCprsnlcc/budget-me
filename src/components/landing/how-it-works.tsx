import { UserPlus, Wallet, BarChart3, TrendingUp } from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

const ICON_MAP: Record<string, React.ElementType> = {
  UserPlus,
  Wallet,
  BarChart3,
  TrendingUp,
};

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative z-10 py-20 px-6 bg-slate-50/50 border-y border-slate-100"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-emerald-600 text-[10px] font-bold tracking-widest uppercase mb-2">
            Process
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mb-3">
            How It Works
          </h3>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Get started in four simple steps and take control of your financial future.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-0 relative">
          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const Icon = ICON_MAP[step.icon];
            const isLast = index === HOW_IT_WORKS_STEPS.length - 1;

            return (
              <div key={step.number} className="relative text-center">
                {/* Connector line (desktop) */}
                {!isLast && (
                  <div
                    className="hidden md:block absolute top-9 left-[calc(50%+36px)] h-0.5 opacity-40"
                    style={{
                      width: "calc(100% - 72px)",
                      background:
                        "linear-gradient(90deg, #94a3b8 0%, #e2e8f0 40%, #e2e8f0 60%, #94a3b8 100%)",
                    }}
                  />
                )}

                {/* Vertical connector (mobile) */}
                {!isLast && (
                  <div className="md:hidden w-0.5 h-8 mx-auto opacity-40 bg-gradient-to-b from-slate-400 via-slate-200 to-slate-400" />
                )}

                {/* Step number */}
                <div className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase mb-3">
                  Step {step.number}
                </div>

                {/* Icon ring */}
                <div className="w-[72px] h-[72px] mx-auto mb-4 rounded-2xl border-2 border-slate-200 bg-white flex items-center justify-center transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md cursor-pointer">
                  {Icon && <Icon size={28} className="text-slate-600" strokeWidth={1.5} />}
                </div>

                {/* Content */}
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  {step.title}
                </h4>
                <p className="text-[13px] text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
